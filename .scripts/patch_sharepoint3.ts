import fs from 'fs';

const file = 'src/services/sharepointService.ts';
let code = fs.readFileSync(file, 'utf8');

const replacement = `
  private formatSiteId(siteInput: string): string {
    let site = siteInput.trim();
    
    // If the user pasted a full Graph API URL, extract just the site portion
    if (site.includes('graph.microsoft.com/v1.0/sites/')) {
      const parts = site.split('graph.microsoft.com/v1.0/sites/');
      site = parts[1].split('/lists')[0];
      return site; // return as-is because it's already formatted
    }
    
    // Remove https:// if present
    site = site.replace(/^https?:\\/\\//, '');
    
    // Format for Graph API: hostname:/site-path:
    if (site.includes('/') && !site.includes(':/')) {
      const parts = site.split('/');
      site = \`\${parts[0]}:/\${parts.slice(1).join('/')}:\`;
    }
    
    return site;
  }

  private async fetchGraph(method: string, endpoint: string, body?: any) {
    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required. Token is missing or expired.');
    }

    let url;
    
    // If the user pasted a full Graph API URL into listId, just append the endpoint
    if (this.config.listId && this.config.listId.includes('graph.microsoft.com')) {
       const baseUrl = this.config.listId.split('?')[0].replace(/\\/items.*$/, '');
       url = \`\${baseUrl}\${endpoint}\`;
    } else {
       const formattedSiteId = this.formatSiteId(this.config.siteId);
       
       // Prevent double stacking if it somehow still got through
       if (formattedSiteId.includes('graph.microsoft.com')) {
          url = \`\${formattedSiteId}/lists/\${this.config.listId}\${endpoint}\`;
       } else {
          url = \`https://graph.microsoft.com/v1.0/sites/\${formattedSiteId}/lists/\${this.config.listId}\${endpoint}\`;
       }
    }
`;

code = code.replace(
  /private formatSiteId\(siteInput: string\): string \{[\s\S]*?url = `https:\/\/graph\.microsoft\.com\/v1\.0\/sites\/\$\{formattedSiteId\}\/lists\/\$\{this\.config\.listId\}\$\{endpoint\}`;\n    \}/,
  replacement.trim()
);

fs.writeFileSync(file, code);
