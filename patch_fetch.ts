import fs from 'fs';

const filePath = 'src/services/graphService.ts';
let code = fs.readFileSync(filePath, 'utf8');

const regex = /export const fetchSharePointItemsViaGraph = async \([\s\S]*?\} catch \(err\) \{[\s\S]*?\}\n  \}/;

const patch = `export const fetchSharePointItemsViaGraph = async (
  config: SharePointConfig,
  listId: string
): Promise<{ items: SharePointItem[]; source: 'live_graph' | 'cached_sandbox'; durationMs: number }> => {
  const startTime = performance.now();
  const lists = getSharePointLists();
  const currentList = lists.find((l) => l.id === listId);
  const locationUrl = currentList?.locationUrl || config.listLocationUrl || \`\${config.siteUrl}/Lists/\${listId}\`;
  const webhookUrl = currentList?.directWebhookUrl || config.directWebhookUrl;

  // Real Microsoft Graph API logic
  if (config.authMode === 'azure_app_registration' && config.accessToken && !config.accessToken.startsWith('eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik1pY3Jvc29mdEVudHJhSUQifQ.')) {
    try {
      const graphUrl = getGraphListUrl(config, listId) + '?expand=fields';
      const response = await fetch(graphUrl, {
        method: 'GET',
        headers: {
          'Authorization': \`Bearer \${config.accessToken}\`,
          'Accept': 'application/json'
        }
      });
      const durationMs = Math.round(performance.now() - startTime);
      
      if (response.ok) {
        const data = await response.json();
        const items: SharePointItem[] = (data.value || []).map((item: any) => ({
          id: String(item.id),
          createdDateTime: item.createdDateTime,
          lastModifiedDateTime: item.lastModifiedDateTime,
          webUrl: item.webUrl || locationUrl,
          fields: item.fields || {},
        }));
        
        saveLocalListItems(listId, items);
        
        addGraphLog({
          method: 'GET',
          endpoint: graphUrl,
          status: response.status,
          statusText: '200 OK (Microsoft Graph)',
          durationMs,
          responseBody: { count: items.length },
        });
        
        return { items, source: 'live_graph', durationMs };
      } else {
        const errData = await response.json().catch(() => ({}));
        console.error('Graph API error fetching items:', errData);
      }
    } catch (err) {
      console.warn('Graph API network error', err);
    }
  }

  // If a direct webhook endpoint is configured (e.g. Power Automate / Logic App SharePoint Connector)
  if (webhookUrl && webhookUrl.trim() && config.authMode === 'webhook_proxy') {
    try {
      const response = await fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getItems', listId, locationUrl }),
      });

      const durationMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        const data = await response.json();
        const items: SharePointItem[] = Array.isArray(data.items || data.value)
          ? (data.items || data.value).map((item: any) => ({
              id: String(item.id || item.ID || 'sp-' + Math.random().toString(36).substr(2, 6)),
              createdDateTime: item.createdDateTime || item.Created || new Date().toISOString(),
              lastModifiedDateTime: item.lastModifiedDateTime || item.Modified || new Date().toISOString(),
              webUrl: item.webUrl || locationUrl,
              fields: item.fields || item,
            }))
          : [];

        if (items.length > 0) {
          saveLocalListItems(listId, items);
        }

        addGraphLog({
          method: 'POST',
          endpoint: webhookUrl,
          status: response.status,
          statusText: '200 OK (SharePoint Webhook Sync)',
          durationMs,
          responseBody: { count: items.length, locationUrl },
        });

        return { items: items.length > 0 ? items : getLocalListItems(listId), source: 'live_graph', durationMs };
      }
    } catch (err) {
      console.warn('Webhook sync error, falling back to local list storage', err);
    }
  }`;

code = code.replace(regex, patch);
fs.writeFileSync(filePath, code);
