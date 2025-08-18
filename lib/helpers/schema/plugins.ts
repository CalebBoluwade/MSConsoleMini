/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import {
  HttpMethodsValues,
  PluginTypes,
} from "../constants";
import { Globe, LucideIcon } from "lucide-react";

// Base schema for all plugins
export const basePluginSchema = z.object({
  enabled: z.boolean().default(true),
  // name: z.string().min(1, "Plugin name is required"),
  // description: z.string().optional(),
});

// Zod schemas for each plugin type
const HttpMonitorSchema = basePluginSchema.extend({
  method: z.enum(HttpMethodsValues),
  // url: z.string().url("Must be a valid URL").min(1, "URL is required"),
  endpoint_path: z.string().optional(),
  useSSL: z.boolean(),
  timeout: z.number().min(1).max(300),
  connect_timeout: z.number().min(1).max(60),
  insecure_skip_verify: z.boolean(),
  auth_type: z.enum(["none", "bearer", "basic", "api_key"]),
  auth_token: z.string().optional(),
  basic_username: z.string().optional(),
  basic_password: z.string().optional(),
  api_key_header: z.string().optional(),
  api_key_value: z.string().optional(),
  expected_status_codes: z.array(z.number()),
  follow_redirects: z.boolean(),
  max_redirects: z.number().min(0).max(20),
  response_contains: z.string().optional(),
  userAgent: z.string(),
  post_data: z.string().optional(),
  custom_headers: z.array(z.object({
    key: z.string(),
    value: z.string()
  })).optional(),
  content_type: z.string().optional()
});

const AgentMonitorSchema = basePluginSchema.extend({
  cpu: z.boolean(),
  memory: z.boolean(),
  disk: z.boolean(),

  high: z
    .number()
    .min(70, "Threshold must be at least 70")
    .max(100, "Threshold must be at most 100"),
  mid: z
    .number()
    .min(50, "Threshold must be at least 70")
    .max(70, "Threshold must be at most 100"),
  low: z
    .number()
    .min(0, "Threshold must be at least 70")
    .max(50, "Threshold must be at most 100"),
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
  
  [key: string]: any; // or a more specific type like string | number | boolean | ...
};

// Enhanced Plugin Configuration Types
export interface FieldDependency {
  field: string;
  
  value: any | any[];
}

export type ValidationRule = {
  type: string;
  label: string;
  pattern?: RegExp;
  message?: string;
  default: any;
  min?: number;
  max?: number;
  options?: Array<string | FieldOption>;
  required?: boolean;
};

export interface FieldOption {
  
  value: any;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface BaseField {
  type: string;
  label: string;
  tooltip?: string;
  default?: any;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  dependsOn?: string | FieldDependency;
  warning?: string;
  rows?: number;  // Add rows for textarea
  maxLength?: number;  // Add maxLength for textarea/text
  unit?: string;  // Add unit for number fields
  step?: number;  // Add step for number fields
}

export interface SelectField extends BaseField {
  type: "select";
  options: (string | FieldOption)[];
  multiple?: boolean;
}

export interface MultiSelectField extends BaseField {
  type: "multi-select";
  options: FieldOption[];
}

export interface NumberField extends BaseField {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface TextField extends BaseField {
  type: "text" | "email" | "url" | "password";
}

export interface TextareaField extends BaseField {
  type: "textarea";
  rows?: number;
  maxLength?: number;
}

export interface BooleanField extends BaseField {
  type: "boolean";
}

export interface KeyValueField extends BaseField {
  type: "key-value";
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  allowDuplicateKeys?: boolean;
}

export type FormField =
  | SelectField
  | MultiSelectField
  | NumberField
  | TextField
  | TextareaField
  | BooleanField
  | KeyValueField;

export interface PluginConfig {
  title: string;
  description?: string;
  icon?: LucideIcon;
  fields: Record<string, FormField>;
  collapsible?: boolean;
  schema: z.ZodSchema<any>;
}
// Plugin configurations with Zod schemas
export const PLUGIN_CONFIGS: Record<string, PluginConfig> = {
  [PluginTypes.HTTPMonitor]: {
    title: "HTTP Monitor",
    icon: Globe,
    schema: HttpMonitorSchema,
    fields: {
      // Basic Configuration
      method: {
        type: "select",
        label: "HTTP Method",
        default: "GET",
        options: HttpMethodsValues.map((method) => ({
          value: method,
          label: method,
        })),
        tooltip: "HTTP method to use for the request",
        required: true,
      },
      // url: {
      //   type: "url",
      //   label: "Target URL",
      //   default: "https://example.com",
      //   placeholder: "https://api.example.com/health",
      //   tooltip: "Full URL to monitor including protocol",
      //   required: true,

      // },
      endpoint_path: {
        type: "text",
        label: "Endpoint Path",
        default: "/health",
        placeholder: "/health",
        tooltip:
          "Path to append to the base URL (optional if full URL is provided above)",
      },
      useSSL: {
        type: "boolean",
        label: "Force HTTPS",
        default: true,
        tooltip: "Force the use of HTTPS regardless of URL protocol",
      },
      timeout: {
        type: "number",
        label: "Request Timeout",
        default: 30,
        min: 1,
        max: 300,
        unit: "seconds",
        tooltip: "Maximum time to wait for a response",
      },
      connect_timeout: {
        type: "number",
        label: "Connection Timeout",
        default: 10,
        min: 1,
        max: 60,
        unit: "seconds",
        tooltip: "Maximum time to wait for connection establishment",
      },

      // Security
      insecure_skip_verify: {
        type: "boolean",
        label: "Skip SSL Verification",
        default: false,
        tooltip: "Skip SSL certificate verification",
        warning:
          "This option reduces security and should only be used for testing",
      },
      auth_type: {
        type: "select",
        label: "Authentication Type",
        default: "none",
        options: [
          { value: "none", label: "No Authentication" },
          { value: "bearer", label: "Bearer Token" },
          { value: "basic", label: "Basic Auth" },
          { value: "api_key", label: "API Key" },
        ],
        tooltip: "Type of authentication to use",
      },
      auth_token: {
        type: "password",
        label: "Bearer Token",
        placeholder: "your-bearer-token",
        tooltip: "Bearer token for authorization header",
        dependsOn: { field: "auth_type", value: "bearer" },
      },
      basic_username: {
        type: "text",
        label: "Username",
        placeholder: "username",
        tooltip: "Basic auth username",
        dependsOn: { field: "auth_type", value: "basic" },
      },
      basic_password: {
        type: "password",
        label: "Password",
        placeholder: "password",
        tooltip: "Basic auth password",
        dependsOn: { field: "auth_type", value: "basic" },
      },
      api_key_header: {
        type: "text",
        label: "API Key Header",
        default: "X-API-Key",
        placeholder: "X-API-Key",
        tooltip: "Header name for API key",
        dependsOn: { field: "auth_type", value: "api_key" },
      },
      api_key_value: {
        type: "password",
        label: "API Key Value",
        placeholder: "your-api-key",
        tooltip: "API key value",
        dependsOn: { field: "auth_type", value: "api_key" },
      },

      // Validation
      expected_status_codes: {
        type: "multi-select",
        label: "Expected Status Codes",
        default: [200],
        options: [
          { value: 200, label: "200 - OK" },
          { value: 201, label: "201 - Created" },
          { value: 202, label: "202 - Accepted" },
          { value: 204, label: "204 - No Content" },
          { value: 301, label: "301 - Moved Permanently" },
          { value: 302, label: "302 - Found" },
          { value: 304, label: "304 - Not Modified" },
        ],
        tooltip: "HTTP status codes that indicate a healthy response",
      },
      follow_redirects: {
        type: "boolean",
        label: "Follow Redirects",
        default: true,
        tooltip: "Automatically follow HTTP redirects",
      },
      max_redirects: {
        type: "number",
        label: "Max Redirects",
        default: 5,
        min: 0,
        max: 20,
        tooltip: "Maximum number of redirects to follow",
        dependsOn: "follow_redirects",
      },
      response_contains: {
        type: "text",
        label: "Response Must Contain",
        placeholder: "success",
        tooltip: "Text that must be present in the response body (optional)",
      },

      // Advanced
      userAgent: {
        type: "text",
        label: "User Agent",
        default: "MS.GoMonitor/2.0",
        placeholder: "Custom User Agent",
        tooltip: "Custom User-Agent header value",
      },
      post_data: {
        type: "textarea",
        label: "Request Body",
        placeholder: '{"key": "value"}',
        tooltip: "Request body for POST/PUT requests (JSON format recommended)",
        dependsOn: { field: "method", value: ["POST", "PUT", "PATCH"] },
      },
      custom_headers: {
        type: "key-value",
        label: "Custom Headers",
        tooltip: "Additional HTTP headers to send with the request",
        default: [],
      },
      content_type: {
        type: "select",
        label: "Content Type",
        default: "application/json",
        options: [
          "application/json",
          "application/xml",
          "text/plain",
          "application/x-www-form-urlencoded",
          "multipart/form-data",
        ],
        tooltip: "Content-Type header for request body",
        dependsOn: { field: "method", value: ["POST", "PUT", "PATCH"] },
      },


    },
  },
  [PluginTypes.SSLMonitor]: {
    title: "SSL Monitor",
    schema: SSLMonitorSchema,
    fields: {
      daysBeforeExpiry: {
        type: "number",
        label: "Days Before Expiry",
        default: 10,
        min: 1,
        max: 30,
      },
      port: {
        type: "number",
        label: "Port",
        default: 443,
        min: 1,
        max: 65535,
        tooltip: "SSL port to connect to",
      },
    },
  },
  [PluginTypes.DatabaseMonitor]: {
    title: "Database Monitor",
    schema: DatabaseMonitorSchema,
    fields: {
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
    title: "File System Monitor",
    schema: FileMonitorSchema,
    fields: {
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
    title: "Service Monitor",
    schema: ServiceMonitorSchema,
    fields: {
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
  [PluginTypes.AgentMonitor]: {
    title: "Agent Health",
    schema: AgentMonitorSchema,
    fields: {
      cpu: {
        type: "boolean",
        label: "Enable CPU Monitoring",
        default: false,
      },
      memory: {
        type: "boolean",
        label: "Enable System Memory Usage Monitoring",
        default: false,
      },
      disk: {
        type: "boolean",
        label: "Enable System Disk Utilization Monitoring",
        default: false,
      },
      high: {
        type: "number",
        label: "High Threshold",
        default: 70,
        min: 70,
        max: 100,
      },
      mid: {
        type: "number",
        label: "Mid Threshold",
        default: 50,
        min: 50,
        max: 70,
      },
      low: {
        type: "number",
        label: "Low Threshold",
        default: 15,
        min: 0,
        max: 50,
      },
    },
  },
  [PluginTypes.NetworkMonitor]: {
    title: "Network Monitor",
    schema: basePluginSchema,
    fields: {
      // Add properties specific to Network Monitor
      snmpVersion: {
        type: "select",
        label: "SNMP Version",
        default: "v2c",
        options: ["v1", "v2c", "v3"],
      },
      communityString: {
        type: "text",
        label: "Community String",
        default: "public",
      },
      timeout: {
        type: "number",
        label: "Timeout (ms)",
        default: 1000,
        min: 100,
        max: 5000,
      },
      retries: { type: "number", label: "Retries", default: 3, min: 1, max: 5 },
    },
  },
};
