export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badge: string;
  features: string[];
}

export interface MetricItem {
  value: string;
  label: string;
  subtext: string;
  numericTarget?: number;
  suffix?: string;
  prefix?: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  avatarUrl?: string;
}

export interface TechToolItem {
  name: string;
  category: string;
  description: string;
  capabilities: string[];
  iconType: string;
  highlightColor: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
}

export interface SharePointConfig {
  // SharePoint Coordinates
  siteUrl: string; // SharePoint Site Location (e.g. https://fassolutions.sharepoint.com/sites/FASMainS)
  listLocationUrl: string; // Direct SharePoint List Location / URL (e.g. https://fassolutions.sharepoint.com/sites/FASMainS/Lists/ClientLeads)
  listName: string; // SharePoint List display name (e.g. Client Leads & Inquiries)
  listId: string; // SharePoint List ID GUID or Slug
  siteId?: string; // Optional site ID or relative path
  directWebhookUrl?: string; // Optional Power Automate / Logic Apps / REST Webhook URL

  // Microsoft Entra ID / Azure App Registration Essentials
  appName?: string; // e.g. 'GoogleAI'
  clientId: string; // Application (client) ID: b7f3dee0-f086-462f-a4b7-c35923cac30c
  tenantId: string; // Directory (tenant) ID: b7b9b31d-d810-4d17-8a8f-b958e88a1013
  objectId?: string; // Object ID: 9e19169a-48ea-46cd-954e-1054f14773a0
  clientSecret?: string; // Client Secret (from 3 secrets)
  appState?: 'Activated' | 'Pending' | 'Disabled'; // State: Activated
  scopes?: string; // e.g. https://graph.microsoft.com/.default
  tokenEndpoint?: string; // https://login.microsoftonline.com
  accessToken?: string; // Active Bearer JWT Token

  // Operating Mode
  authMode: 'azure_app_registration' | 'direct_location' | 'webhook_proxy' | 'sandbox_mode';
  autoSyncIntervalSec: number;
}

export interface SharePointColumn {
  name: string;
  displayName: string;
  type: 'text' | 'choice' | 'number' | 'dateTime' | 'boolean' | 'currency' | 'note';
  required?: boolean;
  choices?: string[];
}

export interface SharePointItem {
  id: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  webUrl?: string;
  fields: {
    Title: string;
    ClientName?: string;
    Email?: string;
    Phone?: string;
    Service?: string;
    Status?: 'New' | 'In Progress' | 'Contacted' | 'Qualified' | 'Completed' | 'Archived';
    Priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
    EstimatedValue?: number;
    Source?: string;
    Notes?: string;
    AssignedTo?: string;
    [key: string]: any;
  };
}

export interface SharePointList {
  id: string;
  name: string;
  displayName: string;
  description: string;
  locationUrl?: string; // Direct SharePoint List Location URL (e.g. https://fassolutions.sharepoint.com/sites/FASMainS/Lists/ClientLeads)
  siteUrl?: string; // Parent SharePoint Site URL
  directWebhookUrl?: string; // Optional Power Automate / Logic App Webhook URL
  itemsCount: number;
  lastModifiedDateTime: string;
  columns: SharePointColumn[];
}

export interface GraphApiLog {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  endpoint: string;
  status: number;
  durationMs: number;
  requestBody?: any;
  responseBody?: any;
  statusText?: string;
}

// Authorized Administrator User ID for FAST Solutions Backend RBAC
export const AUTHORIZED_ADMIN_UID = 'Dq956Mzr1BPBLSdo6fCG2XQSNoj1';
export const AUTHORIZED_ADMIN_EMAILS: string[] = [
  'aylgere@gmail.com',
  'admin@fassolutions.com',
  'admin@fastsolutions.com',
  'contact@fassolutions.com',
];

export interface AdminAuthSession {
  uid: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  authenticatedAt: number;
  role: 'SuperAdmin' | 'Admin' | 'Unauthorized';
  authMethod: 'password' | 'google' | 'oauth';
  token?: string;
}
