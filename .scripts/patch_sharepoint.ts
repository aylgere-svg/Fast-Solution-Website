import fs from 'fs';

const file = 'src/services/sharepointService.ts';
let code = fs.readFileSync(file, 'utf8');

const replacement = `
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
       url = \`https://graph.microsoft.com/v1.0/sites/\${formattedSiteId}/lists/\${this.config.listId}\${endpoint}\`;
    }
`;

code = code.replace(
  /private async fetchGraph\(method: string, endpoint: string, body\?: any\) \{[\s\S]*?if \(this\.config\.listId\.includes\('graph\.microsoft\.com'\)\) \{[\s\S]*?url = `\$\{baseUrl\}\$\{endpoint\}`;\n    \}/,
  replacement.trim()
);

fs.writeFileSync(file, code);
