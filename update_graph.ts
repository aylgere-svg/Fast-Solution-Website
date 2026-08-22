import fs from 'fs';

const filePath = 'src/services/graphService.ts';
let code = fs.readFileSync(filePath, 'utf8');

const helper = `
const getGraphListUrl = (config: SharePointConfig, listId: string) => {
  let site = config.siteId?.trim() || 'fassolutions.sharepoint.com/sites/FASMainS';
  if (site.includes('/')) {
    const parts = site.split('/');
    site = \`\${parts[0]}:/\${parts.slice(1).join('/')}:\`;
  }
  return \`https://graph.microsoft.com/v1.0/sites/\${site}/lists/\${listId}/items\`;
};
`;

if (!code.includes('getGraphListUrl')) {
  code = code.replace(/export const fetchSharePointItemsViaGraph/, helper + '\nexport const fetchSharePointItemsViaGraph');
}

fs.writeFileSync(filePath, code);
