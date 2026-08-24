import fs from 'fs';

const filePath = 'src/services/graphService.ts';
let code = fs.readFileSync(filePath, 'utf8');

const regex = /export const updateSharePointItemViaGraph = async \([\s\S]*?\} catch \(err\) \{\}\n  \}/;

const patch = `export const updateSharePointItemViaGraph = async (
  config: SharePointConfig,
  listId: string,
  itemId: string,
  fields: Record<string, any>
): Promise<SharePointItem> => {
  const startTime = performance.now();
  const lists = getSharePointLists();
  const currentList = lists.find((l) => l.id === listId);
  const locationUrl = currentList?.locationUrl || config.listLocationUrl || \`\${config.siteUrl}/Lists/\${listId}\`;
  const webhookUrl = currentList?.directWebhookUrl || config.directWebhookUrl;

  // Real Microsoft Graph API logic
  if (config.authMode === 'azure_app_registration' && config.accessToken && !config.accessToken.startsWith('eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik1pY3Jvc29mdEVudHJhSUQifQ.')) {
    try {
      const graphUrl = \`\${getGraphListUrl(config, listId)}/\${itemId}\`;
      const payload = { fields };
      const response = await fetch(graphUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': \`Bearer \${config.accessToken}\`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const durationMs = Math.round(performance.now() - startTime);
      
      if (response.ok || response.status === 200) {
        const liveUpdated = await response.json();
        const existing = getLocalListItems(listId);
        const index = existing.findIndex((i) => i.id === itemId);
        let updatedItem = existing[index];
        
        if (index !== -1) {
          updatedItem = {
            ...existing[index],
            lastModifiedDateTime: liveUpdated.lastModifiedDateTime,
            fields: liveUpdated.fields || fields,
          };
          existing[index] = updatedItem;
          saveLocalListItems(listId, [...existing]);
        }
        
        addGraphLog({
          method: 'PATCH',
          endpoint: graphUrl,
          status: response.status,
          statusText: '200 OK (Microsoft Graph)',
          durationMs,
          requestBody: payload,
          responseBody: updatedItem,
        });
        
        return updatedItem;
      } else {
        const errData = await response.json().catch(() => ({}));
        console.error('Graph API error updating item:', errData);
      }
    } catch (err) {
      console.warn('Graph API network error', err);
    }
  }

  if (webhookUrl && webhookUrl.trim() && config.authMode === 'webhook_proxy') {
    try {
      await fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateItem', listId, itemId, locationUrl, fields }),
      });
    } catch (err) {}
  }`;

code = code.replace(regex, patch);
fs.writeFileSync(filePath, code);
