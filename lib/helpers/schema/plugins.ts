import { z } from "zod";
import { HttpMethodsValues, PluginTypes } from "../constants";

// Base schema for all plugins
export const basePluginSchema = z.object({
  enabled: z.boolean().default(true),
  name: z.string().min(1, "Plugin name is required"),
  description: z.string().optional(),
});

// Zod schemas for each plugin type
const HttpMonitorSchema = basePluginSchema.extend({
  url: z.string().url("Must be a valid URL").min(1, "URL is required"),
  useSSL: z.boolean(),
  timeout: z
    .number()
    .min(1, "Timeout must be at least 1 second")
    .max(300, "Timeout cannot exceed 300 seconds"),
  followRedirects: z.boolean(),
  userAgent: z
    .string()
    .min(1, "User Agent is required")
    .max(200, "User Agent too long"),
  Method: z.enum(HttpMethodsValues),
  ContentType: z.string().optional(),
  postData: z.object({}),
});

const SSLMonitorSchema = basePluginSchema.extend({
  daysBeforeExpiry: z
    .number()
    .min(1, "Days Before Expiry must be at least 1 Day")
    .max(30, "Days Before Expiry cannot exceed 30 Days"),
});

const DatabaseMonitorSchema = basePluginSchema.extend({
  connectionString: z.string().min(1, "Connection string is required"),
  dbUser: z.string().min(1, "Connection string is required"),
  dbPass: z.string().min(1, "Password string is required"),
  database: z.string().min(1, "Password string is required"),
  queryTimeout: z
    .number()
    .min(1, "Query timeout must be at least 1 second")
    .max(600, "Query timeout cannot exceed 600 seconds"),
  useEncryption: z.boolean().optional(),
  poolSize: z
    .number()
    .min(1, "Pool size must be at least 1")
    .max(100, "Pool size cannot exceed 100"),
  customHealthQuery: z
    .string()
    .min(1, "Health check query is required")
    .max(1000, "Query too long"),
  dbType: z.enum(["postgresql", "mysql", "mssql", "oracle"]),
});

const FileMonitorSchema = basePluginSchema.extend({
  watchPath: z
    .string()
    .min(1, "Watch path is required")
    .regex(/^\//, "Path must be absolute (start with /)"),
  recursive: z.boolean(),
  filePattern: z
    .string()
    .min(1, "File pattern is required")
    .refine((val) => {
      try {
        new RegExp(val);
        return true;
      } catch {
        return false;
      }
    }, "Must be a valid regular expression"),
  maxFileSize: z
    .number()
    .min(1, "File size must be at least 1 MB")
    .max(1000, "File size cannot exceed 1000 MB"),
  ignoreHidden: z.boolean(),
  alertOnChange: z.boolean(),
});

const ServiceMonitorSchema = basePluginSchema.extend({
  serviceName: z
    .string()
    .min(1, "Service name is required")
    .max(100, "Service name too long"),
  checkMethod: z.enum(["status", "process", "port"]),
  port: z
    .number()
    .min(1, "Port must be at least 1")
    .max(65535, "Port cannot exceed 65535"),
  autoRestart: z.boolean(),
  restartDelay: z
    .number()
    .min(0, "Restart delay cannot be negative")
    .max(300, "Restart delay cannot exceed 300 seconds"),
  maxRestarts: z
    .number()
    .min(0, "Max restarts cannot be negative")
    .max(10, "Max restarts cannot exceed 10"),
});

export type PluginGenericProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // or a more specific type like string | number | boolean | ...
};

export type PluginInputProps = {
  type: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: any;
  // default: string | number | boolean | unknown;

  min?: number;
  max?: number;
  options?: Array<string>;
  [x: string]: unknown;
};

export interface PluginConfig {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodSchema<any, any, any>;
  properties: Record<string, PluginInputProps>;
}

// Plugin configurations with Zod schemas
export const PLUGIN_CONFIGS: Record<string, PluginConfig> = {
  [PluginTypes.HTTPMonitor]: {
    name: "HTTP Monitor",
    schema: HttpMonitorSchema,
    properties: {
      method: {
        type: "select",
        label: "HTTP Method",
        default: "GET",
        options: HttpMethodsValues,
      },
      url: {
        type: "text",
        label: "Target URL",
        default: "https://example.com",
      },

      useSSL: { type: "boolean", label: "Use SSL (HTTPS)", default: true },
      timeout: {
        type: "number",
        label: "Timeout (seconds)",
        default: 30,
        min: 1,
        max: 300,
      },
      userAgent: {
        type: "text",
        label: "User Agent",
        default: "System Monitor Bot",
      },
    },
  },
  [PluginTypes.SSLMonitor]: {
    name: "SSL Monitor",
    schema: SSLMonitorSchema,
    properties: {
      daysBeforeExpiry: {
        type: "number",
        label: "Days Before Expiry",
        default: 10,
        min: 1,
        max: 30,
      },
    },
  },
  [PluginTypes.DatabaseMonitor]: {
    name: "Database Monitor",
    schema: DatabaseMonitorSchema,
    properties: {
      connectionString: {
        type: "text",
        label: "Connection String",
        default: "",
      },
      queryTimeout: {
        type: "number",
        label: "Query Timeout (seconds)",
        default: 60,
        min: 1,
        max: 600,
      },
      useEncryption: {
        type: "boolean",
        label: "Use Encrypted Connection",
        default: true,
      },
      poolSize: {
        type: "number",
        label: "Connection Pool Size",
        default: 10,
        min: 1,
        max: 100,
      },
      customHealthQuery: {
        type: "textarea",
        label: "Health Check Query",
        default: "SELECT 1",
      },
      dbType: {
        type: "select",
        label: "Database Type",
        default: "postgresql",
        options: ["postgresql", "mysql", "mssql", "oracle"],
      },
    },
  },
  "file-monitor": {
    name: "File System Monitor",
    schema: FileMonitorSchema,
    properties: {
      watchPath: { type: "text", label: "Watch Path", default: "/var/log" },
      recursive: {
        type: "boolean",
        label: "Monitor Subdirectories",
        default: true,
      },
      filePattern: {
        type: "text",
        label: "File Pattern (regex)",
        default: ".*\\.log$",
      },
      maxFileSize: {
        type: "number",
        label: "Max File Size (MB)",
        default: 100,
        min: 1,
        max: 1000,
      },
      ignoreHidden: {
        type: "boolean",
        label: "Ignore Hidden Files",
        default: true,
      },
      alertOnChange: {
        type: "boolean",
        label: "Alert on File Changes",
        default: false,
      },
    },
  },
  "service-monitor": {
    name: "Service Monitor",
    schema: ServiceMonitorSchema,
    properties: {
      serviceName: { type: "text", label: "Service Name", default: "" },
      checkMethod: {
        type: "select",
        label: "Check Method",
        default: "status",
        options: ["status", "process", "port"],
      },
      port: {
        type: "number",
        label: "Port Number",
        default: 80,
        min: 1,
        max: 65535,
      },
      autoRestart: {
        type: "boolean",
        label: "Auto Restart on Failure",
        default: false,
      },
      restartDelay: {
        type: "number",
        label: "Restart Delay (seconds)",
        default: 30,
        min: 0,
        max: 300,
      },
      maxRestarts: {
        type: "number",
        label: "Max Restart Attempts",
        default: 3,
        min: 0,
        max: 10,
      },
    },
  },
  [PluginTypes.Agent]: {
    name: "Agent Health",
    schema: HttpMonitorSchema,
    properties: {
      customAgentPort: {
        type: "text",
        label: "Custom Agent Port",
        default: "30025",
        min: 80,
        max: 60000,
      },
      useSSL: {
        type: "boolean",
        label: "Use Agent SSL (HTTPS)",
        default: true,
      },
      timeout: {
        type: "number",
        label: "Timeout (seconds)",
        default: 30,
        min: 1,
        max: 300,
      },
      userAgent: {
        type: "text",
        label: "User Agent",
        default: "System Monitor Bot",
      },
    },
  },
};
