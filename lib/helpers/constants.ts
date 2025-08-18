export type statuses = Array<StatusText>;

export enum NetworkDevicesTypes {
  Switch,
}

export const StatusCodeGroups = {
  success: [
    { value: 200, label: '200 - OK' },
    { value: 201, label: '201 - Created' },
    { value: 202, label: '202 - Accepted' },
    { value: 204, label: '204 - No Content' }
  ],
  redirect: [
    { value: 301, label: '301 - Moved Permanently' },
    { value: 302, label: '302 - Found' },
    { value: 304, label: '304 - Not Modified' },
    { value: 307, label: '307 - Temporary Redirect' }
  ],
  client_error: [
    { value: 400, label: '400 - Bad Request' },
    { value: 401, label: '401 - Unauthorized' },
    { value: 403, label: '403 - Forbidden' },
    { value: 404, label: '404 - Not Found' }
  ],
  server_error: [
    { value: 500, label: '500 - Internal Server Error' },
    { value: 502, label: '502 - Bad Gateway' },
    { value: 503, label: '503 - Service Unavailable' },
    { value: 504, label: '504 - Gateway Timeout' }
  ]
};

// Content types for different request types
export const ContentTypes = [
  'application/json',
  'application/xml',
  'text/plain',
  'text/html',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'application/octet-stream'
] as const;

// Authentication types
export const AuthTypes = [
  { value: 'none', label: 'No Authentication' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'basic', label: 'Basic Authentication' },
  { value: 'api_key', label: 'API Key' },
  { value: 'oauth2', label: 'OAuth 2.0' },
  { value: 'custom', label: 'Custom Headers' }
] as const;

export enum HttpMethods {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS"
}

export const HttpMethodsValues = Object.values(HttpMethods) as [
  string,
  ...string[]
];

export enum Devices {
  Network = "Network",
  Database = "Database",
  Server = "Server",
}

export enum PluginTypes {
  HTTPMonitor = "HTTPMonitor",
  SSLMonitor = "SSLChecker",
  DatabaseMonitor = "DatabaseMonitor",
  AgentMonitor = "AgentMonitor",

  NetworkMonitor = "NetworkMonitor"
}

export const dbImagePaths = [
  "Redis",
  "sql-server",
  "MongoDB",
  "postgresql",
  "oracle",
];
