export type statuses = Array<StatusText>;

export enum NetworkDevicesTypes {
  Switch,
}

export enum HttpMethods {
  GET = "GET",
  POST = "POST",
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
}

export const dbImagePaths = [
  "Redis",
  "sql-server",
  "MongoDB",
  "postgresql",
  "oracle",
];
