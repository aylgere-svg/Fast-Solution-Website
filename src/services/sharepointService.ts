export interface SPConfig {
  tenantId: string;
  clientId: string;
  siteId: string;
  listId: string;
}

export interface SPItem {
  id: string;
  fields: Record<string, any>;
}

export class SharePointService {
  private config: SPConfig;
  private accessToken: string | null = null;
  private tokenExpiration: number = 0;

  constructor(config: SPConfig) {
    this.config = config;
  }

  public setToken(token: string, expiresIn: number = 3600) {
    this.accessToken = token;
    this.tokenExpiration = Date.now() + expiresIn * 1000;
  }

  public getToken(): string | null {
    if (this.accessToken && Date.now() < this.tokenExpiration) {
      return this.accessToken;
    }
    return null;
  }

  public async loginPopup(): Promise<string> {
    const { tenantId, clientId } = this.config;
    // CRITICAL: Request ONLY the Sites.ReadWrite.All scope for delegated flow as requested.
    const scopes = 'https://graph.microsoft.com/Sites.ReadWrite.All';
    const redirectUri = window.location.origin + window.location.pathname;
    
    const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&prompt=select_account`;

    return new Promise((resolve, reject) => {
      const width = 600;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(authUrl, 'SharePointAuth', `width=${width},height=${height},left=${left},top=${top}`);
      
      if (!popup) {
        reject(new Error('Popup blocked by browser. Please allow popups.'));
        return;
      }

      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          reject(new Error('Popup closed by user before completing authentication.'));
          return;
        }

        try {
          // This will throw a DOMException if the popup is still on microsoft.com due to cross-origin policies
          const popupUrl = popup.location.href;
          
          if (popupUrl.includes(redirectUri) && popupUrl.includes('#')) {
            const hashParams = new URLSearchParams(popup.location.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const expiresIn = parseInt(hashParams.get('expires_in') || '3600', 10);
            const error = hashParams.get('error');
            const errorDescription = hashParams.get('error_description');

            clearInterval(timer);
            popup.close();

            if (error) {
              reject(new Error(`Azure AD Error: ${error} - ${errorDescription}`));
            } else if (accessToken) {
              this.setToken(accessToken, expiresIn);
              resolve(accessToken);
            } else {
              reject(new Error('No access token found in response.'));
            }
          }
        } catch (e) {
          // Expected cross-origin error while user is authenticating on Microsoft domain
        }
      }, 500);
    });
  }

  
  private formatSiteId(siteInput: string): string {
    if (!siteInput) return '';
    let site = siteInput.trim();
    
    // If the user pasted a full Graph API URL, extract just the site portion
    if (site.includes('graph.microsoft.com/v1.0/sites/')) {
      const parts = site.split('graph.microsoft.com/v1.0/sites/');
      return parts[1].split('/lists')[0];
    }
    
    // Remove https:// or http://
    site = site.replace(/^https?:\/\//i, '');
    
    // Remove any trailing slashes
    site = site.replace(/\/+$/, '');
    
    // If user pasted a full list URL into the Site ID (e.g. domain.com/sites/siteName/Lists/listName), extract just the site
    if (site.toLowerCase().includes('/lists/')) {
      site = site.substring(0, site.toLowerCase().indexOf('/lists/'));
    }
    
    // Format for Graph API: hostname:/site-path:
    if (site.includes('/') && !site.includes(':/')) {
      const parts = site.split('/');
      site = `${parts[0]}:/${parts.slice(1).join('/')}:`;
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
       const baseUrl = this.config.listId.split('?')[0].replace(/\/items.*$/, '');
       url = `${baseUrl}${endpoint}`;
    } else {
       const formattedSiteId = this.formatSiteId(this.config.siteId);
       
       // Prevent double stacking if it somehow still got through
       if (formattedSiteId.includes('graph.microsoft.com')) {
          url = `${formattedSiteId}/lists/${this.config.listId}${endpoint}`;
       } else {
          url = `https://graph.microsoft.com/v1.0/sites/${formattedSiteId}/lists/${this.config.listId}${endpoint}`;
       }
    }

    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        this.accessToken = null; // Invalidate token
        throw new Error('401 Unauthorized: Your session has expired. Please log in again.');
      }
      if (response.status === 400 || response.status === 404) {
        throw new Error(`Graph API Error (${response.status}): ${errorData?.error?.message || 'Check if list columns exist and IDs are correct.'}`);
      }
      throw new Error(`Graph API Error: ${response.status} ${response.statusText}`);
    }

    return response.status !== 204 ? await response.json() : null;
  }

  public async getItems(): Promise<SPItem[]> {
    const data = await this.fetchGraph('GET', '/items?expand=fields');
    return (data.value || []).map((item: any) => ({
      id: String(item.id),
      fields: item.fields || {}
    }));
  }

  public async createItem(fields: Record<string, any>): Promise<SPItem> {
    const data = await this.fetchGraph('POST', '/items', { fields });
    return {
      id: String(data.id),
      fields: data.fields || {}
    };
  }

  public async updateItem(itemId: string, fields: Record<string, any>): Promise<SPItem> {
    const data = await this.fetchGraph('PATCH', `/items/${itemId}/fields`, fields);
    return {
      id: String(data.id),
      fields: data.fields || {}
    };
  }
}
