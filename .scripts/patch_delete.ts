import fs from 'fs';

const filePath = 'src/services/graphService.ts';
let code = fs.readFileSync(filePath, 'utf8');

const regex = /export const deleteSharePointItemViaGraph = async \([\s\S]*?\} catch \(err\) \{\}\n  \}/;

const patch = `export const deleteSharePointItemViaGraph = async (
  config: SharePointConfig,
  listId: string,
  itemId: string
): Promise<boolean> => {
  const startTime = performance.now();
  const lists = getSharePointLists();
  const currentList = lists.find((l) => l.id === listId);
  const locationUrl = currentList?.locationUrl || config.listLocationUrl || \`\${config.siteUrl}/Lists/\${listId}\`;
  const webhookUrl = currentList?.directWebhookUrl || config.directWebhookUrl;

  // Real Microsoft Graph API logic
  if (config.authMode === 'azure_app_registration' && config.accessToken && !config.accessToken.startsWith('eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik1pY3Jvc29mdEVudHJhSUQifQ.')) {
    try {
      const graphUrl = \`\${getGraphListUrl(config, listId)}/\${itemId}\`;
      const response = await fetch(graphUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': \`Bearer \${config.accessToken}\`
        }
      });
      const durationMs = Math.round(performance.now() - startTime);
      
      if (response.ok || response.status === 204) {
        const existing = getLocalListItems(listId);
        const filtered = existing.filter((i) => i.id !== itemId);
        saveLocalListItems(listId, filtered);
        
        addGraphLog({
          method: 'DELETE',
          endpoint: graphUrl,
          status: response.status || 204,
          statusText: '204 No Content (Microsoft Graph)',
          durationMs,
          responseBody: { itemId, status: 'deleted', locationUrl },
        });
        
        return true;
      } else {
        const errData = await response.json().catch(() => ({}));
        console.error('Graph API error deleting item:', errData);
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
        body: JSON.stringify({ action: 'deleteItem', listId, itemId, locationUrl }),
      });
    } catch (err) {}
  }`;

code = code.replace(regex, patch);
fs.writeFileSync(filePath, code);
