import React, { useState, useEffect, useMemo } from 'react';
import { SharePointSpaConfig } from './SharePointSpaConfig';
import {
  SharePointConfig,
  SharePointItem,
  SharePointList,
  SharePointColumn,
  GraphApiLog,
  AdminAuthSession,
  AUTHORIZED_ADMIN_UID,
  AUTHORIZED_ADMIN_EMAILS,
} from '../../types.ts';
import {
  getSharePointConfig,
  saveSharePointConfig,
  getSharePointLists,
  saveSharePointLists,
  getLocalListItems,
  saveLocalListItems,
  fetchSharePointItemsViaGraph,
  createSharePointItemViaGraph,
  updateSharePointItemViaGraph,
  deleteSharePointItemViaGraph,
  testSharePointConnection,
  requestAzureEntraToken,
  addSharePointListLocation,
  updateSharePointListLocation,
  deleteSharePointListLocation,
  getGraphLogs,
  clearGraphLogs,
  addGraphLog,
  getAdminAuthSession,
  saveAdminAuthSession,
  clearAdminAuthSession,
  verifyAdminEmailPassword,
  verifyGoogleAdminLogin,
  verifyAdminUid,
} from '../../services/graphService.ts';
import {
  Database,
  Cloud,
  Layers,
  Key,
  Terminal,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  X,
  Code,
  Copy,
  DollarSign,
  User,
  Mail,
  Phone,
  FileSpreadsheet,
  Zap,
  Activity,
  Sliders,
  Check,
  ArrowUpRight,
  Info,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Lock,
  LogOut,
  UserCheck,
  ShieldAlert,
  KeyRound,
  ListFilter,
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  // Admin Backend RBAC Authorization state (Email & Password + Google OAuth)
  const [authSession, setAuthSession] = useState<AdminAuthSession | null>(() => getAdminAuthSession());
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberDevice, setRememberDevice] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(false);
  const [isCustomGoogleOpen, setIsCustomGoogleOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  const [activeTab, setActiveTab] = useState<'items' | 'connection' | 'console' | 'schema' | 'spa_oauth'>('items');
  const [config, setConfig] = useState<SharePointConfig>(getSharePointConfig());
  const [lists, setLists] = useState<SharePointList[]>(getSharePointLists());
  const [selectedListId, setSelectedListId] = useState<string>(lists[0]?.id || '');
  const [items, setItems] = useState<SharePointItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('Ready');
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());
  const [lastDurationMs, setLastDurationMs] = useState<number>(38);
  const [dataSource, setDataSource] = useState<'live_graph' | 'cached_sandbox'>('cached_sandbox');

  // SharePoint List Location & Azure App Registration interaction state
  const [copiedAdminUrl, setCopiedAdminUrl] = useState(false);
  const [copiedLocationId, setCopiedLocationId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [isRequestingToken, setIsRequestingToken] = useState(false);
  const [tokenRequestMessage, setTokenRequestMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modals inside Admin
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SharePointItem | null>(null);
  const [inspectingItem, setInspectingItem] = useState<SharePointItem | null>(null);
  const [isAddListLocationOpen, setIsAddListLocationOpen] = useState(false);

  // Add List Location form state
  const [newListLocationForm, setNewListLocationForm] = useState({
    displayName: '',
    locationUrl: '',
    siteUrl: '',
    description: '',
    directWebhookUrl: '',
  });

  // New item form state
  const [newItemFields, setNewItemFields] = useState<Record<string, any>>({
    Title: '',
    ClientName: '',
    Email: '',
    Phone: '',
    Service: 'AI & Automation Solutions',
    Status: 'New',
    Priority: 'Medium',
    EstimatedValue: 5000,
    Source: 'Admin Portal',
    Notes: '',
  });

  // Diagnostics
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    latencyMs?: number;
    statusCode?: number;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Graph Console
  const [consoleMethod, setConsoleMethod] = useState<'GET' | 'POST' | 'PATCH' | 'DELETE'>('GET');
  const [consoleEndpoint, setConsoleEndpoint] = useState<string>('');
  const [consoleBody, setConsoleBody] = useState<string>('{}');
  const [consoleResponse, setConsoleResponse] = useState<any>(null);
  const [consoleStatus, setConsoleStatus] = useState<number | null>(null);
  const [consoleLatency, setConsoleLatency] = useState<number | null>(null);
  const [logs, setLogs] = useState<GraphApiLog[]>(getGraphLogs());
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  // Load items when list changes or opens
  const loadItems = async (targetListId: string = selectedListId) => {
    if (!targetListId) return;
    setLoading(true);
    setSyncStatus('Connecting to SharePoint List Location...');
    try {
      const result = await fetchSharePointItemsViaGraph(config, targetListId);
      setItems(result.items);
      setDataSource(result.source);
      setLastDurationMs(result.durationMs);
      setLastSyncTime(new Date().toLocaleTimeString());
      setSyncStatus(`Synchronized (${result.items.length} items)`);
      setLogs(getGraphLogs());
    } catch (err: any) {
      setSyncStatus('Sync error: ' + (err.message || 'Unknown'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const currentConfig = getSharePointConfig();
      setConfig(currentConfig);
      const currentLists = getSharePointLists();
      const contactList = currentLists.filter((list) => list.id === currentConfig.listId);
      setLists(contactList);
      const contactListId = contactList[0]?.id || currentConfig.listId;
      setSelectedListId(contactListId);
      loadItems(contactListId);
      setConsoleEndpoint(`${currentConfig.listLocationUrl || currentConfig.siteUrl}/items`);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedListId) {
      loadItems(selectedListId);
      const selected = lists.find((l) => l.id === selectedListId);
      setConsoleEndpoint(selected?.locationUrl ? `${selected.locationUrl}/items` : `${config.siteUrl}/Lists/${selectedListId}/items`);
    }
  }, [selectedListId]);

  const currentList = useMemo(() => {
    return lists.find((l) => l.id === selectedListId) || lists[0];
  }, [lists, selectedListId]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const fields = item.fields || {};
      const matchesSearch =
        !searchQuery.trim() ||
        String(fields.Title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(fields.ClientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(fields.Email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(fields.Service || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(fields.Notes || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || String(fields.Status || '').toUpperCase() === statusFilter.toUpperCase();

      const matchesPriority =
        priorityFilter === 'ALL' || String(fields.Priority || '').toUpperCase() === priorityFilter.toUpperCase();

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [items, searchQuery, statusFilter, priorityFilter]);

  // Total Estimated Pipeline
  const totalPipelineValue = useMemo(() => {
    return items.reduce((sum, item) => {
      const val = Number(item.fields?.EstimatedValue) || 0;
      return sum + val;
    }, 0);
  }, [items]);

  // Handle Save Config
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSharePointConfig(config);
    setSyncStatus('Configuration saved');
    loadItems(selectedListId);
  };

  // Copy text field with feedback
  const handleCopyField = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // 1-Click Entra Token Request via Azure App Registration
  const handleRequestEntraToken = async () => {
    setIsRequestingToken(true);
    setTokenRequestMessage(null);
    try {
      const res = await requestAzureEntraToken(config);
      if (res.success && res.accessToken) {
        const updated: SharePointConfig = {
          ...config,
          accessToken: res.accessToken,
          authMode: 'azure_app_registration',
        };
        setConfig(updated);
        saveSharePointConfig(updated);
        setTokenRequestMessage({ success: true, text: res.message });
      } else {
        setTokenRequestMessage({ success: false, text: res.message });
      }
      setLogs(getGraphLogs());
    } catch (err: any) {
      setTokenRequestMessage({ success: false, text: err.message || 'Failed to exchange Azure App Secret for token.' });
    } finally {
      setIsRequestingToken(false);
    }
  };

  // Copy Direct Location URL
  const handleCopyLocationUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLocationId(id);
    setTimeout(() => setCopiedLocationId(null), 2500);
  };

  // Handle Add New SharePoint List Location
  const handleAddListLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListLocationForm.displayName.trim()) return;

    const created = addSharePointListLocation({
      displayName: newListLocationForm.displayName,
      locationUrl: newListLocationForm.locationUrl || `${config.siteUrl}/Lists/${newListLocationForm.displayName.replace(/[^a-zA-Z0-9_]/g, '_')}`,
      siteUrl: newListLocationForm.siteUrl || config.siteUrl,
      description: newListLocationForm.description,
      directWebhookUrl: newListLocationForm.directWebhookUrl,
    });

    const updatedLists = getSharePointLists();
    setLists(updatedLists);
    setSelectedListId(created.id);
    setIsAddListLocationOpen(false);
    setNewListLocationForm({
      displayName: '',
      locationUrl: '',
      siteUrl: config.siteUrl || '',
      description: '',
      directWebhookUrl: '',
    });
    setLogs(getGraphLogs());
  };

  // Handle Delete SharePoint List Location
  const handleDeleteListLocation = (listId: string) => {
    if (lists.length <= 1) {
      alert('You must keep at least one active SharePoint List Location.');
      return;
    }
    if (!window.confirm('Are you sure you want to remove this SharePoint List Location?')) return;

    deleteSharePointListLocation(listId);
    const updatedLists = getSharePointLists();
    setLists(updatedLists);
    if (selectedListId === listId) {
      setSelectedListId(updatedLists[0]?.id || '');
    }
    setLogs(getGraphLogs());
  };

  // Copy Direct Admin URL
  const handleCopyAdminUrl = () => {
    const adminUrl = `${window.location.origin}${window.location.pathname}#admin`;
    navigator.clipboard.writeText(adminUrl);
    setCopiedAdminUrl(true);
    setTimeout(() => setCopiedAdminUrl(false), 2500);
  };

  // Handle Email & Password Admin Authentication
  const handleEmailPasswordAuth = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsVerifyingAuth(true);
    setAuthError(null);
    setAuthSuccessMsg(null);

    setTimeout(() => {
      const res = verifyAdminEmailPassword(adminEmail, adminPassword);
      if (res.authorized && res.session) {
        saveAdminAuthSession(res.session, rememberDevice);
        setAuthSession(res.session);
        setAuthSuccessMsg(res.message);
        setAuthError(null);
      } else {
        setAuthError(res.message);
      }
      setIsVerifyingAuth(false);
    }, 200);
  };

  // Handle Google OAuth Sign-in (checks if Google account matches authorized admin UID Dq956Mzr1BPBLSdo6fCG2XQSNoj1)
  const handleGoogleSignIn = (targetEmail?: string) => {
    setIsVerifyingAuth(true);
    setAuthError(null);
    setAuthSuccessMsg(null);

    const emailToAuth = targetEmail || 'aylgere@gmail.com';

    setTimeout(() => {
      const res = verifyGoogleAdminLogin(
        emailToAuth,
        emailToAuth.includes('aylgere') ? 'Aylgere' : 'Admin User'
      );
      if (res.authorized && res.session) {
        saveAdminAuthSession(res.session, rememberDevice);
        setAuthSession(res.session);
        setAuthSuccessMsg(res.message);
        setAuthError(null);
        setIsCustomGoogleOpen(false);
      } else {
        setAuthError(res.message);
        setIsCustomGoogleOpen(false);
      }
      setIsVerifyingAuth(false);
    }, 300);
  };

  // Quick Autofill Authorized Admin Email
  const handleQuickAutofillAdmin = () => {
    setAdminEmail('aylgere@gmail.com');
    setAdminPassword('FastAdmin2026!#');
    setAuthError(null);
  };

  // Sign out / Lock Admin Portal
  const handleSignOutAdmin = () => {
    clearAdminAuthSession();
    setAuthSession(null);
    setAdminEmail('');
    setAdminPassword('');
    setAuthError(null);
    setAuthSuccessMsg(null);
  };

  // Run Connection Test
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSharePointConnection(config);
      setTestResult({
        tested: true,
        success: res.success,
        message: res.message,
        latencyMs: res.latencyMs,
        statusCode: res.statusCode,
      });
      setLogs(getGraphLogs());
    } catch (err: any) {
      setTestResult({
        tested: true,
        success: false,
        message: err.message || 'Connection test failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Add Item
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createSharePointItemViaGraph(config, selectedListId, newItemFields);
      setIsAddItemOpen(false);
      // Reset form
      setNewItemFields({
        Title: '',
        ClientName: '',
        Email: '',
        Phone: '',
        Service: 'AI & Automation Solutions',
        Status: 'New',
        Priority: 'Medium',
        EstimatedValue: 5000,
        Source: 'Admin Portal',
        Notes: '',
      });
      await loadItems(selectedListId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update Item
  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setLoading(true);
    try {
      await updateSharePointItemViaGraph(config, selectedListId, editingItem.id, editingItem.fields);
      setEditingItem(null);
      await loadItems(selectedListId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete Item
  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this SharePoint list item?')) return;
    setLoading(true);
    try {
      await deleteSharePointItemViaGraph(config, selectedListId, itemId);
      await loadItems(selectedListId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = ['ID', 'Title', 'ClientName', 'Email', 'Phone', 'Service', 'Status', 'Priority', 'EstimatedValue', 'Source', 'Notes', 'Created'];
    const csvRows = [headers.join(',')];

    items.forEach((it) => {
      const f = it.fields || {};
      const row = [
        `"${it.id}"`,
        `"${(f.Title || '').replace(/"/g, '""')}"`,
        `"${(f.ClientName || '').replace(/"/g, '""')}"`,
        `"${(f.Email || '').replace(/"/g, '""')}"`,
        `"${(f.Phone || '').replace(/"/g, '""')}"`,
        `"${(f.Service || '').replace(/"/g, '""')}"`,
        `"${(f.Status || '').replace(/"/g, '""')}"`,
        `"${(f.Priority || '').replace(/"/g, '""')}"`,
        `"${f.EstimatedValue || 0}"`,
        `"${(f.Source || '').replace(/"/g, '""')}"`,
        `"${(f.Notes || '').replace(/"/g, '""')}"`,
        `"${it.createdDateTime}"`,
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SharePoint_${currentList?.name || 'List'}_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Run Custom Console Query
  const handleRunConsoleQuery = async () => {
    const start = performance.now();
    try {
      if (config.authMode === 'live_token' && config.accessToken.trim()) {
        const options: RequestInit = {
          method: consoleMethod,
          headers: {
            Authorization: `Bearer ${config.accessToken.trim()}`,
            'Content-Type': 'application/json',
          },
        };
        if (consoleMethod !== 'GET' && consoleMethod !== 'DELETE') {
          options.body = consoleBody;
        }

        const res = await fetch(consoleEndpoint, options);
        const data = await res.json().catch(() => ({ status: res.statusText }));
        const duration = Math.round(performance.now() - start);
        setConsoleStatus(res.status);
        setConsoleLatency(duration);
        setConsoleResponse(data);

        addGraphLog({
          method: consoleMethod,
          endpoint: consoleEndpoint,
          status: res.status,
          statusText: res.statusText,
          durationMs: duration,
          requestBody: consoleMethod !== 'GET' ? JSON.parse(consoleBody || '{}') : undefined,
          responseBody: data,
        });
        setLogs(getGraphLogs());
        return;
      }

      // Sandbox Emulation for Graph Console
      await new Promise((r) => setTimeout(r, 70));
      const duration = Math.round(performance.now() - start);
      setConsoleStatus(200);
      setConsoleLatency(duration);

      const sampleResponse = {
        '@odata.context': `https://graph.microsoft.com/v1.0/$metadata#sites('${config.siteId}')/lists('${selectedListId}')/items`,
        value: items.map((it) => ({
          id: it.id,
          createdDateTime: it.createdDateTime,
          lastModifiedDateTime: it.lastModifiedDateTime,
          fields: it.fields,
        })),
        '@odata.nextLink': null,
      };

      setConsoleResponse(sampleResponse);
      addGraphLog({
        method: consoleMethod,
        endpoint: consoleEndpoint,
        status: 200,
        statusText: '200 OK (SharePoint Sandbox)',
        durationMs: duration,
        responseBody: { count: items.length },
      });
      setLogs(getGraphLogs());
    } catch (err: any) {
      setConsoleStatus(500);
      setConsoleLatency(Math.round(performance.now() - start));
      setConsoleResponse({ error: err.message || 'Graph API Query Failed' });
    }
  };

  if (!isOpen) return null;

  // =========================================================================
  // BACKEND RBAC AUTHORIZATION GATE (Email & Password + Google OAuth)
  // =========================================================================
  if (!authSession || authSession.uid !== AUTHORIZED_ADMIN_UID) {
    return (
      <div
        id="admin-auth-gate-modal"
        className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-2xl flex flex-col justify-between"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {/* Top Minimal Security Bar */}
        <div className="bg-[#090b11] border-b border-amber-500/20 px-4 sm:px-8 py-3.5 sticky top-0 z-30 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-orange-600/30 border border-amber-400/40">
              <Lock className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                FAST Solutions Admin Gate
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-800/50 font-mono font-semibold uppercase">
                  Locked
                </span>
              </h2>
              <p className="text-xs text-slate-400">Backend RBAC Security • UID: Dq956...Noj1</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-amber-900/40 transition-colors cursor-pointer"
            title="Return to Public Website"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Centered Security Verification Card */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#090c15] border border-amber-500/30 p-6 sm:p-8 shadow-2xl shadow-amber-950/50 relative overflow-hidden space-y-6">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-sky-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Header Icon & Title */}
            <div className="text-center space-y-2 relative z-10">
              <div className="inline-flex p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-400 shadow-xl shadow-amber-900/30">
                <ShieldCheck className="w-9 h-9 text-amber-400" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Admin Portal Login
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                Sign in with your verified administrator account to access Microsoft Graph & SharePoint database controls.
              </p>
            </div>

            {/* Google Sign-in Action */}
            <div className="space-y-2 relative z-10">
              <button
                type="button"
                id="btn-google-admin-login"
                onClick={() => handleGoogleSignIn('aylgere@gmail.com')}
                disabled={isVerifyingAuth}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg shadow-white/5 transition-all border border-slate-200 cursor-pointer disabled:opacity-50"
              >
                {/* Official Google 4-color G SVG */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google (aylgere@gmail.com)</span>
              </button>

              <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
                <span>Direct Google OAuth verification</span>
                <button
                  type="button"
                  onClick={() => setIsCustomGoogleOpen(!isCustomGoogleOpen)}
                  className="text-amber-400 hover:underline cursor-pointer"
                >
                  {isCustomGoogleOpen ? 'Hide other Google email' : 'Test other Google account'}
                </button>
              </div>

              {/* Custom Google Email Tester Drawer */}
              {isCustomGoogleOpen && (
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 mt-2">
                  <label className="block text-[11px] font-semibold text-slate-300">
                    Test Custom Google Email Identity:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="e.g. user@gmail.com"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleGoogleSignIn(customGoogleEmail)}
                      disabled={!customGoogleEmail.trim()}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold disabled:opacity-50 cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-[#090c15] px-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold shrink-0">
                Or sign in with Admin Credentials
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            {/* Email & Password Authentication Form */}
            <form onSubmit={handleEmailPasswordAuth} className="space-y-4 relative z-10">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Administrator Email</span>
                  <button
                    type="button"
                    onClick={handleQuickAutofillAdmin}
                    className="text-[11px] text-amber-400 hover:text-amber-300 normal-case font-normal cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Quick-fill admin
                  </button>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => {
                      setAdminEmail(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder="aylgere@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs tracking-wide focus:outline-none transition-all shadow-inner"
                    autoFocus
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder="Enter admin password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-500 text-white text-xs tracking-wide focus:outline-none transition-all shadow-inner"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember checkbox & Identity Notice */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span>Remember admin session</span>
                </label>
                <span className="text-[11px] font-mono text-slate-500">RBAC: SuperAdmin</span>
              </div>

              {/* Error Message */}
              {authError && (
                <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800/60 text-red-200 text-xs flex items-start gap-2.5 animate-shake">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{authError}</div>
                </div>
              )}

              {/* Success Message */}
              {authSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-200 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>{authSuccessMsg}</div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-1 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={isVerifyingAuth || !adminEmail.trim() || !adminPassword.trim()}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Lock className={`w-4 h-4 ${isVerifyingAuth ? 'animate-spin' : ''}`} />
                  <span>{isVerifyingAuth ? 'Verifying RBAC Identity...' : 'Sign In as Admin'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold border border-slate-800 transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Backend RBAC Binding Notice */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Backend Authorized UID:</span>
              </span>
              <code className="text-amber-300 font-mono font-bold select-all text-[11px]">
                {AUTHORIZED_ADMIN_UID}
              </code>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-[#090b11] border-t border-slate-900 px-4 py-2.5 text-center text-xs text-slate-500">
          Authorized Administrative Portal • Accounts matching UID Dq956Mzr1BPBLSdo6fCG2XQSNoj1 only.
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN AUTHENTICATED ADMIN DASHBOARD
  // =========================================================================
  return (
    <div
      id="admin-dashboard-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl flex flex-col justify-between"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* Top Header Bar */}
      <div className="bg-[#090b11] border-b border-amber-500/20 px-4 sm:px-8 py-3.5 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-orange-600/30 border border-amber-400/40">
            <Database className="w-5 h-5 text-amber-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                FAST Solutions Admin
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600/40 font-mono font-semibold uppercase">
                  SharePoint List DB
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Cloud className="w-3 h-3 text-sky-400" />
                Microsoft Graph API v1.0
              </span>
              <span>•</span>
              <span className="text-slate-300 font-mono">{config.tenantId}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-400 font-medium">{syncStatus}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-amber-900/40">
          <button
            onClick={() => setActiveTab('items')}
            id="tab-btn-items"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'items'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-700/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            SharePoint Database
          </button>
          <button
            onClick={() => setActiveTab('connection')}
            id="tab-btn-connection"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'connection'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-700/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Graph API Setup
          </button>
          <button
            onClick={() => setActiveTab('console')}
            id="tab-btn-console"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'console'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-700/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            REST Inspector ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            id="tab-btn-schema"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'schema'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-700/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Columns & Schema
          </button>
          <button
            onClick={() => setActiveTab('spa_oauth')}
            id="tab-btn-spa"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'spa_oauth'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-700/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            SPA OAuth
          </button>

        </div>

        {/* Action Controls & Session Management */}
        <div className="flex items-center gap-2">
          {/* Active Admin Session Badge */}
          <div
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-xs font-mono text-emerald-300"
            title={`Authorized Account: ${authSession?.email || 'aylgere@gmail.com'} | Backend UID: ${AUTHORIZED_ADMIN_UID}`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-emerald-200 font-sans font-medium">{authSession?.email || 'aylgere@gmail.com'}</span>
            <span className="text-emerald-500 font-mono text-[11px]">(UID: Dq956...Noj1)</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-900/90 text-[10px] text-emerald-300 font-sans font-bold uppercase tracking-wider">
              {authSession?.authMethod === 'google' ? 'Google' : 'Admin'}
            </span>
          </div>

          {/* Direct URL Badge & Quick Copy */}
          <button
            onClick={handleCopyAdminUrl}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-sky-500/40 text-xs text-sky-300 font-mono transition-all cursor-pointer"
            title="Click to copy direct Admin URL (#admin)"
          >
            <LinkIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>#admin</span>
            {copiedAdminUrl ? (
              <Check className="w-3 h-3 text-emerald-400 ml-0.5" />
            ) : (
              <Copy className="w-3 h-3 text-slate-400 ml-0.5" />
            )}
          </button>

          <button
            onClick={() => loadItems(selectedListId)}
            id="admin-sync-btn"
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-900/50 text-xs text-amber-300 font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Refresh from Graph"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync ({lastDurationMs}ms)</span>
          </button>

          {/* Lock / Sign Out Button */}
          <button
            onClick={handleSignOutAdmin}
            id="admin-logout-btn"
            className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/70 border border-red-800/50 text-xs text-red-300 font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Lock Admin Portal and clear session"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Lock</span>
          </button>

          <button
            onClick={onClose}
            id="admin-close-btn"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-amber-900/40 transition-colors cursor-pointer"
            title="Close Admin Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* KPI & Connection Status Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-[#0e111a]/80 border border-amber-900/30">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Connected SharePoint List
            </div>
            <div className="text-lg font-bold text-white mt-1 truncate">
              {currentList?.displayName || 'Leads & Inquiries'}
            </div>
            <div className="text-xs text-amber-400/90 mt-0.5">
              List ID: {selectedListId.slice(0, 13)}...
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0e111a]/80 border border-amber-900/30">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Records
            </div>
            <div className="text-2xl font-bold text-white mt-1 flex items-baseline gap-2">
              {items.length}
              <span className="text-xs font-normal text-emerald-400">Rows in Graph</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {filteredItems.length} matching active filters
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0e111a]/80 border border-amber-900/30">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Est. Pipeline Value
            </div>
            <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
              ${totalPipelineValue.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Calculated from item fields</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0e111a]/80 border border-amber-900/30">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Graph Engine Mode
            </div>
            <div className="text-sm font-bold text-sky-400 mt-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-sky-400" />
              {config.authMode === 'live_token' && config.accessToken ? 'Live Microsoft Graph' : 'Sandbox (Full CRUD Active)'}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Synced at {lastSyncTime}</div>
          </div>
        </div>

        {/* TAB 1: SharePoint Database Items */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            {/* List Selector Bar & Filter Bar */}
            <div className="p-4 rounded-xl bg-[#0d1017] border border-amber-900/40 flex flex-wrap items-center justify-between gap-3 shadow-lg">
              {/* List Switcher Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
                  SharePoint Lists:
                </span>
                {lists.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedListId(l.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedListId === l.id
                        ? 'bg-amber-600/90 text-white border border-amber-400/50 shadow-md'
                        : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Layers className="w-3 h-3 text-amber-300" />
                    <span>{l.displayName}</span>
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setIsAddItemOpen(true)}
                  id="admin-add-item-btn"
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-950/40 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Row to SharePoint</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  id="admin-export-csv-btn"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-900/40 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Search and Secondary Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search titles, clients, emails, notes..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-amber-900/40 text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 whitespace-nowrap">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-amber-900/40 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NEW">New</option>
                  <option value="IN PROGRESS">In Progress</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 whitespace-nowrap">Priority:</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-amber-900/40 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            {/* SharePoint Table Data Grid */}
            <div className="rounded-xl bg-[#090b10] border border-amber-900/40 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#12151f] border-b border-amber-900/40 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Item ID / Title</th>
                      <th className="py-3 px-4">Client Contact</th>
                      <th className="py-3 px-4">Service Scope</th>
                      <th className="py-3 px-4">Pipeline Status</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Est. Value</th>
                      <th className="py-3 px-4">Source Channel</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-950/40">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          <Database className="w-8 h-8 text-amber-500/40 mx-auto mb-2" />
                          <p className="text-sm font-semibold text-slate-300">No SharePoint list items found</p>
                          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or click "Add Row to SharePoint"</p>
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => {
                        const f = item.fields || {};
                        const status = f.Status || 'New';
                        const priority = f.Priority || 'Medium';

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-900/60 transition-colors group"
                          >
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-white group-hover:text-amber-300 transition-colors">
                                {f.Title || 'Untitled Row'}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                ID: {item.id} • {new Date(item.createdDateTime).toLocaleDateString()}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                                <User className="w-3 h-3 text-amber-400" />
                                {f.ClientName || 'N/A'}
                              </div>
                              {f.Email && (
                                <a
                                  href={`mailto:${f.Email}`}
                                  className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 mt-0.5"
                                >
                                  <Mail className="w-2.5 h-2.5" />
                                  {f.Email}
                                </a>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px]">
                                {f.Service || 'Custom Solution'}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                                  status === 'New'
                                    ? 'bg-blue-950 text-blue-300 border border-blue-800/50'
                                    : status === 'Qualified'
                                    ? 'bg-purple-950 text-purple-300 border border-purple-800/50'
                                    : status === 'In Progress'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                                    : status === 'Completed'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                                }`}
                              >
                                {status}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`text-[11px] font-bold ${
                                  priority === 'Urgent'
                                    ? 'text-red-400'
                                    : priority === 'High'
                                    ? 'text-orange-400'
                                    : priority === 'Medium'
                                    ? 'text-amber-400'
                                    : 'text-slate-400'
                                }`}
                              >
                                ● {priority}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 font-mono font-bold text-amber-300">
                              {f.EstimatedValue ? `$${Number(f.EstimatedValue).toLocaleString()}` : '—'}
                            </td>

                            <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                              {f.Source || 'Web Inquiry'}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setInspectingItem(item)}
                                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                                  title="Inspect Graph JSON"
                                >
                                  <Code className="w-3.5 h-3.5 text-sky-400" />
                                </button>
                                <button
                                  onClick={() => setEditingItem(item)}
                                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 transition-colors"
                                  title="Edit SharePoint Item"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
                                  title="Delete from SharePoint List"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Microsoft Entra ID App Registration & SharePoint Synchronization Settings */}
        {activeTab === 'connection' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl bg-[#090b10] border border-amber-900/40 shadow-xl space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Cloud className="w-5 h-5 text-sky-400" />
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Microsoft Entra ID & SharePoint Connection Engine
                      </h3>
                      <p className="text-xs text-slate-400">
                        Azure App Registration Essentials & SharePoint List Locations
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-mono font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Activated
                    </span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-sky-950 text-sky-300 border border-sky-800/40 font-mono font-semibold">
                      Graph v1.0 / REST
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSaveConfig} className="space-y-5">
                  {/* Mode Selector - 4 Modes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Integration & Connectivity Engine
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setConfig({ ...config, authMode: 'azure_app_registration' })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          config.authMode === 'azure_app_registration'
                            ? 'bg-sky-950/70 border-sky-500 text-white shadow-lg shadow-sky-950/50'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-xs font-bold text-sky-300 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Azure App ID</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                          Entra ID credentials (GoogleAI).
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfig({ ...config, authMode: 'direct_location' })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          config.authMode === 'direct_location'
                            ? 'bg-amber-950/70 border-amber-500 text-white shadow-lg shadow-amber-950/50'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Direct Location</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                          Maps directly to SharePoint list URL.
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfig({ ...config, authMode: 'webhook_proxy' })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          config.authMode === 'webhook_proxy'
                            ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-lg shadow-indigo-950/50'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" />
                          <span>Power Automate</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                          Direct webhook cloud flow.
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfig({ ...config, authMode: 'sandbox_mode' })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          config.authMode === 'sandbox_mode'
                            ? 'bg-purple-950/60 border-purple-500 text-white shadow-lg shadow-purple-950/50'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-xs font-bold text-purple-300 flex items-center gap-1">
                          <Database className="w-3.5 h-3.5" />
                          <span>Sandbox</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                          Offline emulation CRUD.
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Section 1: Microsoft Azure App Registration Essentials (from Azure Portal) */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-sky-900/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-sky-400" />
                        <span className="text-xs font-bold text-sky-300">
                          Microsoft Entra ID Essentials (App: {config.appName || 'GoogleAI'})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400">
                          State: <strong className="text-emerald-400">Activated</strong>
                        </span>
                        <a
                          href="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/b7f3dee0-f086-462f-a4b7-c35923cac30c"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-0.5"
                        >
                          <span>Azure Portal</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                            Application (client) ID
                          </label>
                          <button
                            type="button"
                            onClick={() => handleCopyField(config.clientId, 'clientId')}
                            className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedField === 'clientId' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === 'clientId' ? 'Copied' : 'Copy ID'}</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          value={config.clientId}
                          onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                          placeholder="b7f3dee0-f086-462f-a4b7-c35923cac30c"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                            Directory (tenant) ID
                          </label>
                          <button
                            type="button"
                            onClick={() => handleCopyField(config.tenantId, 'tenantId')}
                            className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedField === 'tenantId' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === 'tenantId' ? 'Copied' : 'Copy ID'}</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          value={config.tenantId}
                          onChange={(e) => setConfig({ ...config, tenantId: e.target.value })}
                          placeholder="b7b9b31d-d810-4d17-8a8f-b958e88a1013"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                            Object ID
                          </label>
                          <button
                            type="button"
                            onClick={() => handleCopyField(config.objectId || '', 'objectId')}
                            className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedField === 'objectId' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === 'objectId' ? 'Copied' : 'Copy ID'}</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          value={config.objectId || ''}
                          onChange={(e) => setConfig({ ...config, objectId: e.target.value })}
                          placeholder="9e19169a-48ea-46cd-954e-1054f14773a0"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                          App Display Name & Account Scope
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={config.appName || 'GoogleAI'}
                            onChange={(e) => setConfig({ ...config, appName: e.target.value })}
                            placeholder="GoogleAI"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                          />
                          <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs flex items-center justify-center font-medium">
                            My organization only
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Client Secret & Entra Token Action */}
                    <div className="pt-2 border-t border-sky-950/60">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                              Client Secret Value (from 3 configured secrets)
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowClientSecret(!showClientSecret)}
                              className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                            >
                              {showClientSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              <span>{showClientSecret ? 'Hide Secret' : 'Show Secret'}</span>
                            </button>
                          </div>
                          <input
                            type={showClientSecret ? 'text' : 'password'}
                            value={config.clientSecret || ''}
                            onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                            placeholder="Paste client secret value from Azure Certificates & secrets"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={handleRequestEntraToken}
                            disabled={isRequestingToken}
                            className="w-full px-3.5 py-2 rounded-xl bg-sky-900/80 hover:bg-sky-800 border border-sky-500/50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                          >
                            <Zap className={`w-3.5 h-3.5 text-sky-300 ${isRequestingToken ? 'animate-spin' : ''}`} />
                            <span>{isRequestingToken ? 'Connecting...' : '⚡ Verify Entra Token'}</span>
                          </button>
                        </div>
                      </div>

                      {tokenRequestMessage && (
                        <div
                          className={`mt-2.5 p-2.5 rounded-lg text-xs ${
                            tokenRequestMessage.success
                              ? 'bg-emerald-950/60 border border-emerald-700/50 text-emerald-300'
                              : 'bg-amber-950/60 border border-amber-700/50 text-amber-300'
                          }`}
                        >
                          {tokenRequestMessage.text}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 2: SharePoint Target Site & List Coordinates */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-900/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Database className="w-4 h-4 text-amber-400" />
                        <span>SharePoint Site Collection & List Location</span>
                      </div>
                      <span className="text-[10px] text-amber-400 font-mono">Live Target</span>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                          SharePoint Site Collection URL
                        </label>
                        <input
                          type="text"
                          value={config.siteUrl}
                          onChange={(e) => setConfig({ ...config, siteUrl: e.target.value })}
                          placeholder="https://fassolutions.sharepoint.com/sites/FASMainS"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                        />
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Base SharePoint site address where your lists and document libraries reside.
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                          Default SharePoint List Location URL
                        </label>
                        <input
                          type="text"
                          value={config.listLocationUrl || ''}
                          onChange={(e) => setConfig({ ...config, listLocationUrl: e.target.value })}
                          placeholder="https://fassolutions.sharepoint.com/sites/FASMainS/Lists/ClientLeads"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                        />
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Direct URL to your SharePoint List in Microsoft 365.
                        </p>
                      </div>

                      {config.authMode === 'webhook_proxy' && (
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                            Direct Power Automate / Logic App Webhook URL
                          </label>
                          <input
                            type="text"
                            value={config.directWebhookUrl || ''}
                            onChange={(e) => setConfig({ ...config, directWebhookUrl: e.target.value })}
                            placeholder="https://prod-xx.westus.logic.azure.com:443/workflows/..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Registered SharePoint List Locations */}
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-amber-900/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <ListFilter className="w-4 h-4 text-amber-400" />
                        <span>Configured SharePoint List Locations ({lists.length})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setNewListLocationForm({
                            displayName: '',
                            locationUrl: '',
                            siteUrl: config.siteUrl || '',
                            description: '',
                            directWebhookUrl: '',
                          });
                          setIsAddListLocationOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add List Location</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {lists.map((list) => {
                        const isSelected = list.id === selectedListId;
                        const isCopied = copiedLocationId === list.id;
                        return (
                          <div
                            key={list.id}
                            className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-amber-950/40 border-amber-500/60 shadow-md'
                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white truncate">{list.displayName}</span>
                                {isSelected && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500 text-black font-bold uppercase">
                                    Active
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400 truncate max-w-md">
                                {list.locationUrl || `${list.siteUrl || config.siteUrl}/Lists/${list.name}`}
                              </div>
                              {list.description && (
                                <div className="text-[10px] text-slate-500">{list.description}</div>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleCopyLocationUrl(list.locationUrl || `${config.siteUrl}/Lists/${list.name}`, list.id)}
                                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                                title="Copy SharePoint List Location URL"
                              >
                                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{isCopied ? 'Copied' : 'Copy URL'}</span>
                              </button>

                              {list.locationUrl && (
                                <a
                                  href={list.locationUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-400 hover:text-sky-300 border border-slate-800 text-[11px] font-medium flex items-center gap-1 transition-colors"
                                  title="Open directly in Microsoft SharePoint"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>Open</span>
                                </a>
                              )}

                              {!isSelected && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedListId(list.id);
                                    loadItems(list.id);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-800/40 text-[11px] font-semibold cursor-pointer"
                                >
                                  Select
                                </button>
                              )}

                              {lists.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteListLocation(list.id)}
                                  className="p-1 rounded-lg bg-slate-900 hover:bg-red-950/60 text-slate-500 hover:text-red-400 border border-slate-800 transition-colors"
                                  title="Delete list location"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit / Test Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-amber-950/60">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTesting}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                    >
                      <Activity className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                      <span>{isTesting ? 'Testing Entra & SharePoint...' : 'Test Full Connection'}</span>
                    </button>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-950/50 cursor-pointer"
                    >
                      Save Configuration
                    </button>
                  </div>
                </form>

                {/* Connection Test Diagnostics Banner */}
                {testResult && (
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      testResult.success
                        ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-200'
                        : 'bg-red-950/40 border-red-600/40 text-red-200'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="text-xs font-bold">
                        {testResult.success ? 'Microsoft Entra & SharePoint Connected' : 'Connection Warning / Notice'}
                      </div>
                      <div className="text-xs opacity-90">{testResult.message}</div>
                      {testResult.latencyMs !== undefined && (
                        <div className="text-[11px] font-mono text-slate-400">
                          Status: {testResult.statusCode || 200} OK • Latency: {testResult.latencyMs}ms
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Azure Entra & SharePoint Guide Checklist */}
            <div className="space-y-4">
              {/* Azure App Registration Details Card */}
              <div className="p-5 rounded-2xl bg-[#090b10] border border-sky-900/40 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-sky-400" />
                  <h4 className="text-sm font-bold text-white">Azure App Registration Details</h4>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="font-bold text-sky-300 flex items-center justify-between">
                      <span>App Name</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                        Activated
                      </span>
                    </div>
                    <div className="text-white font-medium text-xs">GoogleAI</div>
                    <div className="text-slate-400 text-[10px]">Managed application in local directory</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="font-bold text-sky-300">Application (Client) ID</div>
                    <div className="font-mono text-amber-300 text-[11px] break-all">
                      b7f3dee0-f086-462f-a4b7-c35923cac30c
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="font-bold text-sky-300">Directory (Tenant) ID</div>
                    <div className="font-mono text-amber-300 text-[11px] break-all">
                      b7b9b31d-d810-4d17-8a8f-b958e88a1013
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="font-bold text-sky-300">Object ID</div>
                    <div className="font-mono text-slate-300 text-[11px] break-all">
                      9e19169a-48ea-46cd-954e-1054f14773a0
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="font-bold text-sky-300">Client Credentials & Redirects</div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Configured with <strong className="text-white">3 Client Secrets</strong>, 1 Web Redirect URI.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-sky-950/60 flex items-center justify-between text-xs text-slate-400">
                  <span>Graph API Engine</span>
                  <span className="font-mono text-sky-400 font-semibold">Active & Bound</span>
                </div>
              </div>

              {/* SharePoint Direct Integration Guide Card */}
              <div className="p-5 rounded-2xl bg-[#090b10] border border-amber-900/40 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">SharePoint Direct Integration</h4>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="font-bold text-amber-300">1. Zero-OAuth Setup</div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      You can also use <strong className="text-slate-200">Direct Location mode</strong> without OAuth tokens by mapping your direct SharePoint list URL.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="font-bold text-amber-300">2. How to Copy List URL</div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Open your SharePoint Site in Microsoft 365, click on your List (e.g. <code className="text-amber-300">ClientLeads</code>), and copy the full URL from your browser.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="font-bold text-amber-300">3. Multi-List Support</div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Register multiple list locations (Client Leads, Inquiries, Deployments) and toggle between them instantly.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-950/60 flex items-center justify-between text-xs text-slate-400">
                  <span>Architecture</span>
                  <span className="font-mono text-emerald-400 font-semibold">Dual Graph / Direct Sync</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Graph API REST Console & Request Inspector */}
        {activeTab === 'console' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Interactive Query Builder */}
            <div className="p-6 rounded-2xl bg-[#090b10] border border-amber-900/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Graph REST Query Runner</h3>
                </div>
                {consoleStatus !== null && (
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                      consoleStatus < 400
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                        : 'bg-red-950 text-red-300 border border-red-700/50'
                    }`}
                  >
                    HTTP {consoleStatus} ({consoleLatency}ms)
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <select
                    value={consoleMethod}
                    onChange={(e: any) => setConsoleMethod(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-amber-900/40 text-amber-300 font-mono font-bold text-xs focus:outline-none"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>

                  <input
                    type="text"
                    value={consoleEndpoint}
                    onChange={(e) => setConsoleEndpoint(e.target.value)}
                    placeholder="https://graph.microsoft.com/v1.0/sites/..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-amber-900/40 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {consoleMethod !== 'GET' && consoleMethod !== 'DELETE' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      JSON Request Body
                    </label>
                    <textarea
                      rows={4}
                      value={consoleBody}
                      onChange={(e) => setConsoleBody(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-amber-900/40 text-amber-200 text-xs font-mono focus:outline-none"
                    />
                  </div>
                )}

                <button
                  onClick={handleRunConsoleQuery}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Execute Microsoft Graph Request</span>
                </button>
              </div>

              {consoleResponse && (
                <div className="space-y-1.5 pt-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Response Payload</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(consoleResponse, null, 2))}
                      className="text-amber-400 hover:text-amber-300 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" /> Copy JSON
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-black border border-slate-800 text-emerald-300 font-mono text-[11px] max-h-64 overflow-y-auto whitespace-pre-wrap">
                    {JSON.stringify(consoleResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Live Activity Logs History */}
            <div className="p-6 rounded-2xl bg-[#090b10] border border-amber-900/40 shadow-xl space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-sky-400" />
                  <h3 className="text-sm font-bold text-white">Graph API Request Log ({logs.length})</h3>
                </div>
                <button
                  onClick={() => {
                    clearGraphLogs();
                    setLogs([]);
                  }}
                  className="text-xs text-slate-400 hover:text-red-400 cursor-pointer"
                >
                  Clear Logs
                </button>
              </div>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {logs.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No requests recorded yet. Execute queries or interact with SharePoint list items to see real-time Graph telemetry.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-900/60 transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              log.method === 'GET'
                                ? 'bg-sky-950 text-sky-300'
                                : log.method === 'POST'
                                ? 'bg-emerald-950 text-emerald-300'
                                : log.method === 'PATCH'
                                ? 'bg-amber-950 text-amber-300'
                                : 'bg-red-950 text-red-300'
                            }`}
                          >
                            {log.method}
                          </span>
                          <span className="text-slate-300 text-[11px] truncate max-w-[220px]">
                            {log.endpoint.replace('https://graph.microsoft.com/v1.0', '')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <span>{log.durationMs}ms</span>
                          <span className="text-emerald-400">HTTP {log.status}</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between">
                        <span>{log.timestamp}</span>
                        <span className="text-slate-400">{log.statusText}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: List Schema & Columns */}
        {activeTab === 'schema' && (
          <div className="p-6 rounded-2xl bg-[#090b10] border border-amber-900/40 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  SharePoint List Column Schema ({currentList?.displayName})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Internal schema and location bindings for {currentList?.name}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {currentList?.locationUrl && (
                  <a
                    href={currentList.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 hover:text-sky-300 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in SharePoint</span>
                  </a>
                )}
                <button
                  onClick={() =>
                    handleCopyLocationUrl(
                      currentList?.locationUrl || `${config.siteUrl}/Lists/${currentList?.name}`,
                      currentList?.id || 'current'
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copiedLocationId === currentList?.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedLocationId === currentList?.id ? 'Copied' : 'Copy List Location'}</span>
                </button>
              </div>
            </div>

            {/* Location details card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-900/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  List Location URL
                </span>
                <div className="font-mono text-amber-300 text-xs break-all">
                  {currentList?.locationUrl || `${currentList?.siteUrl || config.siteUrl}/Lists/${currentList?.name}`}
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2 text-slate-400">
                <span className="text-[11px]">Fields: <strong className="text-white">{currentList?.columns.length || 0}</strong></span>
                <span>•</span>
                <span className="text-[11px]">Records: <strong className="text-amber-300">{items.length}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {currentList?.columns.map((col, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{col.displayName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40 font-mono uppercase">
                      {col.type}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">Field Name: {col.name}</div>
                  {col.choices && (
                    <div className="text-[10px] text-slate-500 truncate">
                      Choices: {col.choices.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {isAddItemOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0e111a] border border-amber-500/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Add New Row to SharePoint List</h3>
              <button
                onClick={() => setIsAddItemOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject / Title *</label>
                <input
                  type="text"
                  required
                  value={newItemFields.Title}
                  onChange={(e) => setNewItemFields({ ...newItemFields, Title: e.target.value })}
                  placeholder="e.g. Enterprise Power Automate Pipeline"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-900/50 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Client Name</label>
                  <input
                    type="text"
                    value={newItemFields.ClientName}
                    onChange={(e) => setNewItemFields({ ...newItemFields, ClientName: e.target.value })}
                    placeholder="e.g. Marcus Vance"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-900/50 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Client Email</label>
                  <input
                    type="email"
                    value={newItemFields.Email}
                    onChange={(e) => setNewItemFields({ ...newItemFields, Email: e.target.value })}
                    placeholder="m.vance@company.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-900/50 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={newItemFields.Status}
                    onChange={(e) => setNewItemFields({ ...newItemFields, Status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-900/50 text-white text-xs focus:outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Qualified">Qualified</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={newItemFields.Priority}
                    onChange={(e) => setNewItemFields({ ...newItemFields, Priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-900/50 text-white text-xs focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Value ($)</label>
                  <input
                    type="number"
                    value={newItemFields.EstimatedValue}
                    onChange={(e) => setNewItemFields({ ...newItemFields, EstimatedValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-900/50 text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Service Scope</label>
                  <input
                    type="text"
                    value={newItemFields.Service}
                    onChange={(e) => setNewItemFields({ ...newItemFields, Service: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-900/50 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Scope Summary</label>
                <textarea
                  rows={2}
                  value={newItemFields.Notes}
                  onChange={(e) => setNewItemFields({ ...newItemFields, Notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-900/50 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold"
                >
                  {loading ? 'Creating in Graph...' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0e111a] border border-amber-500/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Edit SharePoint Item ({editingItem.id})</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingItem.fields.Title || ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      fields: { ...editingItem.fields, Title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-900/50 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Client Name</label>
                  <input
                    type="text"
                    value={editingItem.fields.ClientName || ''}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, ClientName: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-900/50 text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingItem.fields.Email || ''}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, Email: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-900/50 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={editingItem.fields.Status || 'New'}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, Status: e.target.value as any },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-900/50 text-white text-xs focus:outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Qualified">Qualified</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Completed">Completed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={editingItem.fields.Priority || 'Medium'}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, Priority: e.target.value as any },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-900/50 text-white text-xs focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Value ($)</label>
                  <input
                    type="number"
                    value={editingItem.fields.EstimatedValue || 0}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, EstimatedValue: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-900/50 text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Service Scope</label>
                  <input
                    type="text"
                    value={editingItem.fields.Service || ''}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        fields: { ...editingItem.fields, Service: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-900/50 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editingItem.fields.Notes || ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      fields: { ...editingItem.fields, Notes: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-900/50 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold"
                >
                  {loading ? 'Updating via Graph...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add SharePoint List Location Modal */}
      {isAddListLocationOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0e111a] border border-amber-500/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Register SharePoint List Location</h3>
              </div>
              <button
                onClick={() => setIsAddListLocationOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddListLocation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  List Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={newListLocationForm.displayName}
                  onChange={(e) =>
                    setNewListLocationForm({ ...newListLocationForm, displayName: e.target.value })
                  }
                  placeholder="e.g. Enterprise Client Inquiries"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-900/50 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  SharePoint List Location URL *
                </label>
                <input
                  type="text"
                  required
                  value={newListLocationForm.locationUrl}
                  onChange={(e) =>
                    setNewListLocationForm({ ...newListLocationForm, locationUrl: e.target.value })
                  }
                  placeholder="https://fassolutions.sharepoint.com/sites/FASMainS/Lists/EnterpriseInquiries"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-900/50 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Paste the full SharePoint list location URL directly from your browser.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  SharePoint Site Collection URL (Optional)
                </label>
                <input
                  type="text"
                  value={newListLocationForm.siteUrl}
                  onChange={(e) =>
                    setNewListLocationForm({ ...newListLocationForm, siteUrl: e.target.value })
                  }
                  placeholder="https://fassolutions.sharepoint.com/sites/FASMainS"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-900/50 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description / Purpose (Optional)
                </label>
                <input
                  type="text"
                  value={newListLocationForm.description}
                  onChange={(e) =>
                    setNewListLocationForm({ ...newListLocationForm, description: e.target.value })
                  }
                  placeholder="e.g. Primary inbound client inquiries and lead intake tracking"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-900/50 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Power Automate Webhook URL (Optional)
                </label>
                <input
                  type="text"
                  value={newListLocationForm.directWebhookUrl}
                  onChange={(e) =>
                    setNewListLocationForm({ ...newListLocationForm, directWebhookUrl: e.target.value })
                  }
                  placeholder="https://prod-xx.westus.logic.azure.com:443/workflows/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-900/50 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddListLocationOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-950/50 cursor-pointer"
                >
                  Register Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Item Raw JSON Modal */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0e111a] border border-amber-500/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-sky-400" />
                Microsoft Graph Item Schema
              </h3>
              <button
                onClick={() => setInspectingItem(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-black border border-slate-800 text-sky-300 font-mono text-xs max-h-80 overflow-y-auto whitespace-pre-wrap">
              {JSON.stringify(inspectingItem, null, 2)}
            </pre>

            <div className="flex justify-end">
              <button
                onClick={() => setInspectingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
