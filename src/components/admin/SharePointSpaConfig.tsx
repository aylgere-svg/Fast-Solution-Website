import React, { useState, useEffect } from 'react';
import { SharePointService, SPConfig, SPItem } from '../../services/sharepointService.ts';

export const SharePointSpaConfig: React.FC = () => {
  const [config, setConfig] = useState<SPConfig>({
    tenantId: '',
    clientId: '',
    siteId: '',
    listId: ''
  });
  const [service, setService] = useState<SharePointService | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<SPItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sp_spa_config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('sp_spa_config', JSON.stringify(config));
    setService(new SharePointService(config));
    setError('Configuration saved. Ready to authenticate.');
  };

  const handleLogin = async () => {
    if (!service) return;
    setLoading(true);
    setError(null);
    try {
      await service.loginPopup();
      setIsAuthenticated(true);
      setError('Successfully authenticated!');
      await loadItems();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    if (!service) return;
    setLoading(true);
    try {
      const data = await service.getItems();
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load items');
      if (err.message.includes('401')) setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!service) return;
    setLoading(true);
    try {
      await service.createItem({ Title: `New Item ${new Date().toLocaleTimeString()}` });
      await loadItems();
    } catch (err: any) {
      setError(err.message || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 mt-8">
      <h3 className="text-xl font-semibold mb-4 text-neutral-900">SPA OAuth Configuration (Client-Side)</h3>
      <p className="text-sm text-neutral-600 mb-6">
        Configure the Microsoft Entra ID popup flow. Uses <code>response_type=token</code> and requires <code>Sites.ReadWrite.All</code> delegated scope.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Tenant ID</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={config.tenantId}
            onChange={(e) => setConfig({ ...config, tenantId: e.target.value })}
            placeholder="e.g. b7b9b31d-d810-..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Client ID</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={config.clientId}
            onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
            placeholder="e.g. b7f3dee0-f086-..."
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-1">Site ID</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={config.siteId}
            onChange={(e) => setConfig({ ...config, siteId: e.target.value })}
            placeholder="e.g. yourdomain.sharepoint.com,..."
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-1">List ID</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={config.listId}
            onChange={(e) => setConfig({ ...config, listId: e.target.value })}
            placeholder="e.g. d4810f92-721a-..."
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-900 transition-colors text-sm font-medium"
        >
          Save Configuration
        </button>
        <button
          onClick={handleLogin}
          disabled={!service || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
        >
          {loading ? 'Processing...' : 'Login & Authenticate'}
        </button>
      </div>

      {error && (
        <div className={`p-4 rounded-md mb-6 ${error.includes('Error') || error.includes('failed') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {isAuthenticated && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-neutral-900">List Items</h4>
            <div className="flex gap-2">
              <button
                onClick={loadItems}
                disabled={loading}
                className="px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded text-sm hover:bg-neutral-200"
              >
                Refresh
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="px-3 py-1.5 bg-neutral-800 text-white rounded text-sm hover:bg-neutral-900"
              >
                Create Test Item
              </button>
            </div>
          </div>
          
          <div className="bg-neutral-50 rounded border border-neutral-200 overflow-hidden">
            {items.length === 0 ? (
              <div className="p-4 text-center text-sm text-neutral-500">No items found</div>
            ) : (
              <ul className="divide-y divide-neutral-200">
                {items.map((item) => (
                  <li key={item.id} className="p-3 hover:bg-white text-sm">
                    <span className="font-medium">{item.fields.Title || 'Untitled'}</span>
                    <span className="text-neutral-500 ml-2 text-xs">(ID: {item.id})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
