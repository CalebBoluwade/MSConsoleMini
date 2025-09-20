type ServiceType = "AGENT" | "Web Modules" | "Network" | "Server";

type Roles = "MS005" | "MS001" | "ADMIN" | "ALLSTAFF";

type StatusText =
  | "Healthy"
  | "Escalation"
  | "Acknowledged"
  | "Degraded"
  | "UnknownStatus"
  | "InvalidConfiguration"
  | "Scheduled";

type statuses = Array<StatusText>;

type MonitorPlugin = {
  Id: string;
  Name: string;
  Description: string;
  pluginType: string;
  isRecommended?: boolean;
  compatibleDeviceTypes: ServiceType[];
  comingSoon?: boolean;
  // [key: string]: any;
};

interface PluginResult {
  pluginId: string;
  pluginName: string;
  pluginDescription: string;
  pluginType: string;
  status: StatusText;
  output: string;
  metrics: Record;
  checkedAt: string;
}

interface MonitoringResult {
  id: string;
  systemMonitorId: string;
  status: StatusText;
  checkedAt: string;
  message: string;
  pluginResults: PluginResult[];
}

interface BaseMonitor {
  SystemMonitorId: string;
  ServiceName: string;
  Description: string;
  IPAddress: string;
  Port: number;
  Agent: string;
  CurrentHealthCheck: string;
  HealthStatusInfo: {
    Name: string;
    Description: string;
    Color: string;
  };
  Metrics: Record<string, number>[];
  Plugins: string[];
  PluginDetails: MonitorPlugin[];
  checkInterval: string;
  Configuration: string;
  // HealthStatus: "Good" | "Moderate" | "Bad" | "Unavailable";
  Device: string;
  IsMonitored: boolean;
  CreatedAt: string;
  IsServiceIssueAcknowledged: boolean;
  // CreatedAt: string;
  Metadata: MonitorMetaData;
}

interface MonitorGroup {
  id: string;
  name: string;
  description: string;
  deviceIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

type MonitorMetaData = {
  CreatedAt: string;
  DownTime: string;
  LastCheckTime: string | null;
  LastServiceUpTime: string | null;
  AcknowledgedDateTime: string | null;
  SnoozeUntil: string | null;
};

interface NetworkDevice extends BaseMonitor {
  machineType: string;
  vendor: string;
  responseTime: number;
  cpuUtilization: number;
  memoryUtilization: number;
  packetLoss?: number;
}

interface Tracker {
  key: string;
  color: Color;
  tooltip: string;
  entity: string;
}

type WebSocketMessage =
  | DeviceUpdateMessage
  | BatchDeviceUpdateMessage
  | SubscriptionMessage
  | HeartbeatMessage;

type DeviceUpdateMessage<T> = {
  type: "device_update";
  deviceId: string;
  data: Partial<T>;
};

type BatchDeviceUpdateMessage<T> = {
  type: "batch_device_update";
  devices: Array<{
    deviceId: string;
    data: Partial<T>;
  }>;
};

type SubscriptionMessage = {
  type: "subscribe" | "unsubscribe";
  topics: string[];
};

type HeartbeatMessage = {
  type: "heartbeat";
  timestamp: number;
};

type MonitoringRule = {
  id: string;
  name: string;
  serviceId: string;
  description?: string;
  ruleType: "custom" | "threshold" | "anomaly";
  metricName: string;
  lastTriggered: string;
  conditions: RuleCondition;
  alertChannels: string[];
  createdAt: string;
  updatedAt: string;
  severity: string;
  isActive: boolean;
  recipientsUserIds: string[];
  recipients: User[];
};

// Rule Condition
interface RuleCondition {
  Operator: ">" | "<" | ">=" | "<=" | "==" | "!=" | "rate_gt" | "rate_lt";
  Threshold: number;
  EvaluationWindow: string; // in seconds or minutes
  ConsecutiveBreaches: number;
  AggregationMethod?: "max" | "min" | "avg" | "sum" | "count";
}

// Query parameters for listing rules
interface RuleQueryParameters {
  page?: number;
  pageSize?: number;
  search?: string;
  ruleType?: "custom" | "threshold" | "anomaly";
  isActive?: boolean;
}

// Request payloads
interface CreateRuleRequest {
  name: string;
  serviceId: string;
  description?: string;
  metricName: string;
  conditions: RuleCondition;
}

interface UpdateRuleRequest {
  name?: string;
  serviceId: string;
  description?: string;
  ruleType?: "custom" | "threshold" | "anomaly";
  metricName?: string;
  conditions?: RuleCondition;
  isActive?: boolean;
}

interface RuleConflict {
  conflictRuleId: string;
  conflictField: string;
  description: string;
}

interface PagedResult<T> {
  data: T[];
  page: number;
  pageSiz: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// Generic API wrapper response
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

interface DBSchema {
  groups: {
    key: string;
    value: MonitorGroup;
    indexes: { name: string };
  };
  devices: {
    key: string;
    value: BaseMonitor;
    indexes: { name: string };
  };
}

interface APIResponse<T> {
  data: APIResponsePayload<T>;
  error?: undefined;
}

interface JWTAuthPayload {
  Role: Array<Roles>;
}

interface User {
  id: string;
  username: string;
  fullName: string;
  displayName: string;
  title: string;
  department: string;
  avatar: string;
  groups: string[];
  phoneNumber: string;
}

interface UserAuthLoginResponse {
  isAuthenticated: boolean;
  message: string;
  userData?: User;
}

// interface AlertRule {
//   id: string;
//   name: string;
//   description: string;
//   team: string[];
//   metric: MetricType;
//   condition: ConditionType;
//   threshold: number;
//   duration: DurationType;
//   severity: SeverityType;
//   status: StatusType;
//   notifications: NotificationType[];
//   targetType: TargetType;
//   targetId: string;
//   created: string;
//   name: string;
//   description: string;
//   team: string[];
//   metric: MetricType;
//   condition: ConditionType;
//   threshold: string | number;
//   duration: DurationType;
//   severity: SeverityType;
//   notifications: NotificationType[];
//   targetType: TargetType;
//   targetId: string;
//   lastTriggered: string | null;
// }
