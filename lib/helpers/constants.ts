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

type MetricType =
  | "cpu_usage"
  | "memory_usage"
  | "disk_free_space"
  | "network_latency"
  | "error_rate"
  | "request_count";

type DurationType = "1m" | "5m" | "10m" | "15m" | "30m" | "1h";

interface MetricOption {
  value: MetricType;
  label: string;
}

interface DurationOption {
  value: DurationType;
  label: string;
}

export const metrics: MetricOption[] = [
    { value: "cpu_usage", label: "CPU Usage (%)" },
    { value: "memory_usage", label: "Memory Usage (%)" },
    { value: "disk_free_space", label: "Disk Free Space (%)" },
    { value: "network_latency", label: "Network Latency (ms)" },
    { value: "error_rate", label: "Error Rate (%)" },
    { value: "request_count", label: "Request Count" },
  ] as const;

export const durations: DurationOption[] = [
    { value: "1m", label: "1 minute" },
    { value: "5m", label: "5 minutes" },
    { value: "10m", label: "10 minutes" },
    { value: "15m", label: "15 minutes" },
    { value: "30m", label: "30 minutes" },
    { value: "1h", label: "1 hour" },
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
