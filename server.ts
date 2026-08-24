import 'dotenv/config';
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes
  app.get('/api/contact-submission', async (req, res) => {
    const listId = String(req.query.listId || process.env.SHAREPOINT_LIST_ID || '').trim();
    const { SHAREPOINT_TENANT_ID, SHAREPOINT_CLIENT_ID, SHAREPOINT_CLIENT_SECRET, SHAREPOINT_SITE_ID } = process.env;
    if (!listId || !SHAREPOINT_TENANT_ID || !SHAREPOINT_CLIENT_ID || !SHAREPOINT_CLIENT_SECRET || !SHAREPOINT_SITE_ID) {
      return res.status(503).json({ error: 'SharePoint connection is not configured on the server.' });
    }

    try {
      const tokenResponse = await fetch(`https://login.microsoftonline.com/${SHAREPOINT_TENANT_ID}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: SHAREPOINT_CLIENT_ID,
          client_secret: SHAREPOINT_CLIENT_SECRET,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials',
        }),
      });
      const tokenData = await tokenResponse.json().catch(() => ({}));
      if (!tokenResponse.ok || !tokenData.access_token) {
        return res.status(502).json({ error: 'Microsoft Graph authentication failed.' });
      }

      let graphSiteId = SHAREPOINT_SITE_ID;
      const colonSite = SHAREPOINT_SITE_ID.match(/^([^:]+):\/?(.+?):?$/);
      if (colonSite && colonSite[1].includes('.sharepoint.com')) {
        const sitePath = colonSite[2].replace(/^\/+|:$/g, '');
        const siteLookup = await fetch(`https://graph.microsoft.com/v1.0/sites/${colonSite[1]}:/${sitePath}`, {
          headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/json' },
        });
        const siteData = await siteLookup.json().catch(() => ({}));
        if (!siteLookup.ok || !siteData.id) {
          return res.status(502).json({ error: 'Microsoft Graph could not find the configured SharePoint site.' });
        }
        graphSiteId = siteData.id;
      }

      const itemsResponse = await fetch(`https://graph.microsoft.com/v1.0/sites/${graphSiteId}/lists/${listId}/items?expand=fields`, {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/json' },
      });
      const itemsData = await itemsResponse.json().catch(() => ({}));
      if (!itemsResponse.ok) {
        return res.status(502).json({ error: `Microsoft Graph returned HTTP ${itemsResponse.status}.` });
      }
      return res.json({ items: (itemsData.value || []).map((item: any) => ({
        id: String(item.id),
        createdDateTime: item.createdDateTime,
        lastModifiedDateTime: item.lastModifiedDateTime,
        webUrl: item.webUrl,
        fields: item.fields || {},
      })) });
    } catch {
      return res.status(502).json({ error: 'Unable to reach SharePoint.' });
    }
  });

  app.post('/api/contact-submission', async (req, res) => {
    const { title, clientName, email, phone, service, notes, source, estimatedValue } = req.body || {};
    if (!clientName?.trim() || !email?.trim()) {
      return res.status(400).json({ error: 'Client name and email are required.' });
    }

    const fields = {
      Title: `${title || 'New Web Inquiry'} - ${clientName.trim()}`.slice(0, 255),
      BusinessEmail: email.trim(),
      PhoneNumber: phone || '',
      Company: clientName.trim(),
      Interest: service || 'General Inquiry',
      ProjectDetails: notes || '',
    };

    try {
      const webhookUrl = process.env.SHAREPOINT_WEBHOOK_URL?.trim();
      if (webhookUrl) {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'createItem', listId: process.env.SHAREPOINT_LIST_ID, fields }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          return res.status(502).json({ error: `SharePoint webhook returned HTTP ${response.status}.` });
        }
        return res.status(201).json({ item: data.item || data });
      }

      const { SHAREPOINT_TENANT_ID, SHAREPOINT_CLIENT_ID, SHAREPOINT_CLIENT_SECRET, SHAREPOINT_SITE_ID, SHAREPOINT_LIST_ID } = process.env;
      if (!SHAREPOINT_TENANT_ID || !SHAREPOINT_CLIENT_ID || !SHAREPOINT_CLIENT_SECRET || !SHAREPOINT_SITE_ID || !SHAREPOINT_LIST_ID) {
        return res.status(503).json({ error: 'SharePoint connection is not configured on the server.' });
      }

      const tokenResponse = await fetch(`https://login.microsoftonline.com/${SHAREPOINT_TENANT_ID}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: SHAREPOINT_CLIENT_ID,
          client_secret: SHAREPOINT_CLIENT_SECRET,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials',
        }),
      });
      const tokenData = await tokenResponse.json().catch(() => ({}));
      if (!tokenResponse.ok || !tokenData.access_token) {
        return res.status(502).json({ error: 'Microsoft Graph authentication failed.' });
      }

      let graphSiteId = SHAREPOINT_SITE_ID;
      const colonSite = SHAREPOINT_SITE_ID.match(/^([^:]+):\/?(.+?):?$/);
      if (colonSite && colonSite[1].includes('.sharepoint.com')) {
        const sitePath = colonSite[2].replace(/^\/+|:$/g, '');
        const siteLookup = await fetch(`https://graph.microsoft.com/v1.0/sites/${colonSite[1]}:/${sitePath}`, {
          headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/json' },
        });
        const siteData = await siteLookup.json().catch(() => ({}));
        if (!siteLookup.ok || !siteData.id) {
          return res.status(502).json({ error: `Microsoft Graph site lookup failed HTTP ${siteLookup.status}: ${siteData?.error?.message || 'Site not found.'}` });
        }
        graphSiteId = siteData.id;
      }

      const graphItemsUrl = `https://graph.microsoft.com/v1.0/sites/${graphSiteId}/lists/${SHAREPOINT_LIST_ID}/items`;
      const graphHeaders = {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      const createItem = (itemFields: Record<string, unknown>) => fetch(graphItemsUrl, {
        method: 'POST',
        headers: graphHeaders,
        body: JSON.stringify({ fields: itemFields }),
      });

      let graphResponse = await createItem(fields);
      let item = await graphResponse.json().catch(() => ({}));
      if (!graphResponse.ok) {
        const graphMessage = item?.error?.message || 'Check the SharePoint site and list IDs.';
        return res.status(502).json({ error: `Microsoft Graph returned HTTP ${graphResponse.status}: ${graphMessage}` });
      }
      return res.status(201).json({ item });
    } catch (error) {
      return res.status(502).json({ error: 'Unable to reach SharePoint.' });
    }
  });

  app.post("/api/azure-token", async (req, res) => {
    try {
      const { tenantId, clientId, clientSecret, scopes } = req.body;
      const endpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
      
      const params = new URLSearchParams();
      params.append('client_id', clientId);
      params.append('scope', scopes);
      params.append('client_secret', clientSecret);
      params.append('grant_type', 'client_credentials');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
