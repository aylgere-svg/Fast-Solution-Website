import fs from 'fs';

const filePath = 'src/services/graphService.ts';
let code = fs.readFileSync(filePath, 'utf8');

const regex = /export const createSharePointItemViaGraph = async \([\s\S]*?\} catch \(err\) \{[\s\S]*?\}\n  \}/;

const patch = `export const createSharePointItemViaGraph = async (
  config: SharePointConfig,
  listId: string,
  fields: Record<string, any>
): Promise<SharePointItem> => {
  const startTime = performance.now();
  const lists = getSharePointLists();
  const currentList = lists.find((l) => l.id === listId);
  const locationUrl = currentList?.locationUrl || config.listLocationUrl || \`\${config.siteUrl}/Lists/\${listId}\`;
  const webhookUrl = currentList?.directWebhookUrl || config.directWebhookUrl;

  const newItem: SharePointItem = {
    id: 'sp-' + Date.now().toString(36),
    createdDateTime: new Date().toISOString(),
    lastModifiedDateTime: new Date().toISOString(),
    webUrl: locationUrl,
    fields: {
      Title: fields.Title || 'Untitled Item',
      ...fields,
    },
  };

  // Real Microsoft Graph API logic
  if (config.authMode === 'azure_app_registration' && config.accessToken && !config.accessToken.startsWith('eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik1pY3Jvc29mdEVudHJhSUQifQ.')) {
    try {
      const graphUrl = getGraphListUrl(config, listId);
      const payload = { fields };
      const response = await fetch(graphUrl, {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${config.accessToken}\`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const durationMs = Math.round(performance.now() - startTime);
      
      if (response.ok || response.status === 201) {
        const liveCreated = await response.json();
        const savedItem: SharePointItem = {
          id: String(liveCreated.id),
          createdDateTime: liveCreated.createdDateTime,
          lastModifiedDateTime: liveCreated.lastModifiedDateTime,
          webUrl: liveCreated.webUrl || locationUrl,
          fields: liveCreated.fields || fields,
        };
        
        const existing = getLocalListItems(listId);
        saveLocalListItems(listId, [savedItem, ...existing]);
        
        addGraphLog({
          method: 'POST',
          endpoint: graphUrl,
          status: response.status,
          statusText: '201 Created (Microsoft Graph)',
          durationMs,
          requestBody: payload,
          responseBody: savedItem,
        });
        
        return savedItem;
      } else {
        const errData = await response.json().catch(() => ({}));
        console.error('Graph API error creating item:', errData);
      }
    } catch (err) {
      console.warn('Graph API network error', err);
    }
  }

  // If a direct webhook is connected
  if (webhookUrl && webhookUrl.trim() && config.authMode === 'webhook_proxy') {
    try {
      const response = await fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createItem', listId, locationUrl, fields }),
      });

      const durationMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        const liveCreated = await response.json();
        const savedItem: SharePointItem = {
          id: String(liveCreated.id || liveCreated.ID || newItem.id),
          createdDateTime: liveCreated.createdDateTime || new Date().toISOString(),
          lastModifiedDateTime: liveCreated.lastModifiedDateTime || new Date().toISOString(),
          webUrl: liveCreated.webUrl || locationUrl,
          fields: liveCreated.fields || fields,
        };

        const existing = getLocalListItems(listId);
        saveLocalListItems(listId, [savedItem, ...existing]);

        addGraphLog({
          method: 'POST',
          endpoint: webhookUrl,
          status: response.status,
          statusText: '201 Created (SharePoint Webhook)',
          durationMs,
          requestBody: { fields, locationUrl },
          responseBody: savedItem,
        });

        return savedItem;
      }
    } catch (err) {
      console.warn('Webhook create item error, saving to local list storage', err);
    }
  }`;

code = code.replace(regex, patch);
fs.writeFileSync(filePath, code);
