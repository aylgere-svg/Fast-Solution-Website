import fs from 'fs';

const sharepointServiceFile = 'src/services/sharepointService.ts';
let spCode = fs.readFileSync(sharepointServiceFile, 'utf8');

const spReplacement = `
  private formatSiteId(siteInput: string): string {
    if (!siteInput) return '';
    let site = siteInput.trim();
    
    // If the user pasted a full Graph API URL, extract just the site portion
    if (site.includes('graph.microsoft.com/v1.0/sites/')) {
      const parts = site.split('graph.microsoft.com/v1.0/sites/');
      return parts[1].split('/lists')[0];
    }
    
    // Remove https:// or http://
    site = site.replace(/^https?:\\/\\//i, '');
    
    // Remove any trailing slashes
    site = site.replace(/\\/+$/, '');
    
    // If user pasted a full list URL into the Site ID (e.g. domain.com/sites/siteName/Lists/listName), extract just the site
    if (site.toLowerCase().includes('/lists/')) {
      site = site.substring(0, site.toLowerCase().indexOf('/lists/'));
    }
    
    // Format for Graph API: hostname:/site-path:
    if (site.includes('/') && !site.includes(':/')) {
      const parts = site.split('/');
      site = \`\${parts[0]}:/\${parts.slice(1).join('/')}:\`;
    }
    
    return site;
  }
`;

spCode = spCode.replace(
  /private formatSiteId\(siteInput: string\): string \{[\s\S]*?return site;\n  \}/,
  spReplacement.trim()
);
fs.writeFileSync(sharepointServiceFile, spCode);


const graphServiceFile = 'src/services/graphService.ts';
let graphCode = fs.readFileSync(graphServiceFile, 'utf8');

const graphReplacement = `
const getGraphListUrl = (config: SharePointConfig, listId: string) => {
  // 1. If listId is actually a full Graph API URL, use it directly
  if (listId && listId.includes('graph.microsoft.com')) {
    return listId.split('?')[0].replace(/\\/items.*$/, '') + '/items';
  }

  // 2. Format the site safely
  let site = config.siteId?.trim() || 'fassolutions.sharepoint.com/sites/FASMainS';
  
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

console.log("Patched both files successfully!");
