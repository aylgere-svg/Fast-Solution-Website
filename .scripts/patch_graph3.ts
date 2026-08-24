import fs from 'fs';

const file = 'src/services/graphService.ts';
let code = fs.readFileSync(file, 'utf8');

const replacement = `
const getGraphListUrl = (config: SharePointConfig, listId: string) => {
  // 1. If listId is actually a full Graph API URL, use it directly (extract base endpoint)
  if (listId && listId.includes('graph.microsoft.com')) {
    return listId.split('?')[0].replace(/\\/items.*$/, '') + '/items';
  }

  // 2. Format the site
  let site = config.siteId?.trim() || 'fassolutions.sharepoint.com/sites/FASMainS';
  
  if (site.includes('graph.microsoft.com/v1.0/sites/')) {
    const parts = site.split('graph.microsoft.com/v1.0/sites/');
    site = parts[1].split('/lists')[0];
  } else {
    site = site.replace(/^https?:\\/\\//, '');
    if (site.includes('/') && !site.includes(':/')) {
      const parts = site.split('/');
      site = \`\${parts[0]}:/\${parts.slice(1).join('/')}:\`;
    }
  }

  // 3. Prevent double 'graph.microsoft.com'
  // If somehow site ended up being a full url, return it directly 
  if (site.includes('graph.microsoft.com')) {
      return \`\${site}/lists/\${listId}/items\`;
  }
  
  return \`https://graph.microsoft.com/v1.0/sites/\${site}/lists/\${listId}/items\`;
};
`;

code = code.replace(
  /const getGraphListUrl = \([\s\S]*?return `https:\/\/graph\.microsoft\.com\/v1\.0\/sites\/\$\{site\}\/lists\/\$\{listId\}\/items`;\n\};/,
  replacement.trim()
);

fs.writeFileSync(file, code);
