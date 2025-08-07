type ServiceType = "AGENT" | "Web Modules" | "Network" | "Server";

type StatusText = "Healthy" | "Escalation" | "Acknowledged" | "Degraded" | "UnknownStatus" | "InvalidConfiguration" | "Scheduled";

type statuses = Array<StatusText>;

type MonitorPlugin = {
  Id: string;
  Name: string;
  Description: string;
  pluginType: string;
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
  Metrics: number[];
  Plugins: string[];
  PluginDetails: MonitorPlugin[];
  checkInterval: string;
  Configuration: string;
  // HealthStatus: "Good" | "Moderate" | "Bad" | "Unavailable";
  Device: string;
  IsMonitored: boolean;
  // LiveCheckFlag: number; // 0 | 1 | 2 | 3 | 4 | 5
  IsServiceIssueAcknowledged: boolean;
  // CreatedAt: string;
  Metadata: MonitorMetaData;
};

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

type WebSocketSubscriber = (message: WebSocketMessage) => void;

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

interface APIResponsePayload<T> {
    Message: string;
    MetaData: Record<string, number>;
    Data: Array<T>;
    Cause: string;
  }

  interface APIResponse<T> {
    data: APIResponsePayload<T>;
    error?: undefined;
  }


interface User {
  id: string;
  name: string;
  jobTitle: string;
  avatar: string;
  initials: string;
}