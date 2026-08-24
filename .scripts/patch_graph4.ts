import fs from 'fs';

const graphServiceFile = 'src/services/graphService.ts';
let graphCode = fs.readFileSync(graphServiceFile, 'utf8');

const graphReplacement = `
const getGraphListUrl = (config: SharePointConfig, listId: string) => {
  // 1. If listId is actually a full Graph API URL, use it directly
  if (listId && listId.includes('graph.microsoft.com')) {
    return listId.split('?')[0].replace(/\\/items.*$/, '') + '/items';
  }

  // 2. Format the site safely - USE siteUrl FIRST, then siteId, then fallback
  let site = config.siteUrl?.trim() || config.siteId?.trim() || 'fassolutions.sharepoint.com/sites/FASMainS';
  
  if (site.includes('graph.microsoft.com/v1.0/sites/')) {
    const parts = site.split('graph.microsoft.com/v1.0/sites/');
    site = parts[1].split('/lists')[0];
  } else {
    site = site.replace(/^https?:\\/\\//i, '');
    site = site.replace(/\\/+$/, ''); // trailing slash removal
    
    if (site.toLowerCase().includes('/lists/')) {
      site = site.substring(0, site.toLowerCase().indexOf('/lists/'));
    }

    if (site.includes('/') && !site.includes(':/')) {
      const parts = site.split('/');
      site = \`\${parts[0]}:/\${parts.slice(1).join('/')}:\`;
    }
  }

  if (site.includes('graph.microsoft.com')) {
      return \`\${site}/lists/\${listId}/items\`;
  }
  
  return \`https://graph.microsoft.com/v1.0/sites/\${site}/lists/\${listId}/items\`;
};
`;

graphCode = graphCode.replace(
  /const getGraphListUrl = \([\s\S]*?return `https:\/\/graph\.microsoft\.com\/v1\.0\/sites\/\$\{site\}\/lists\/\$\{listId\}\/items`;\n\};/,
  graphReplacement.trim()
);
fs.writeFileSync(graphServiceFile, graphCode);
