// export const NetworkDevicesTypes = ""

export type statuses = Array<StatusText>;

// Health ranking for sorting
// export const healthStatusRanking: StatusRanking = {
//   Good: {
//     I: 0,
//     Color: "#4CAF50",
//   },
//   Moderate: {
//     I: 1,
//     Color: "#FFC107",
//   },
//   Bad: {
//     I: 2,
//     Color: "#F44336",
//   },
// };

// Get status color

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
  HTTPMonitor = "http_monitor",
  SSLMonitor = "SSLChecker",
  DatabaseMonitor = "database-monitor",
  AgentMonitor = "AgentMonitor",
}

export const dbImagePaths = [
  "Redis",
  "sql-server",
  "MongoDB",
  "postgresql",
  "oracle",
];
