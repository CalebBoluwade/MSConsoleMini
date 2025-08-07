// Utility functions

export const StatusRanking: Record<StatusText, number> = {
  UnknownStatus: 0,
  Healthy: 1,
  Escalation: 2,
  Acknowledged: 3,
  Degraded: 4,
  InvalidConfiguration: 5,
  Scheduled: 6,
};

export const GenerateMockDevices = (count: number): BaseMonitor[] => {
  const statuses: StatusText[] = [
    "Healthy",
    "Escalation",
    "Degraded",
    "UnknownStatus",
  ];

  return Array.from({ length: count }, (_, i) => ({
    SystemMonitorId: `device-${i + 1}`,
    ServiceName: `Device ${i + 1}`,
    IPAddress: `192.168.1.${i + 1}`,
    Port: Math.floor(Math.random() * 1000),
    Device: "switch",
    Agent: "",
    Metrics: [],
    IsMonitored: true,
    IsServiceIssueAcknowledged: false,
    Configuration: "{}",
    vendor: "Cisco",
    Description: "ghfdbsdasdfghfdsadfdgf",
    // LiveCheckFlag: 0,
    machineType: "",
    responseTime: Math.floor(Math.random() * 100),
    packetLoss: Math.floor(Math.random() * 10),
    Plugins: [],
    checkInterval: "",
    PluginDetails: [
      {
        Id: "http-monitor",
        pluginType: "",
        Name: "Testing dfddbfsf",
        Description: "asdndnsbsbsdvch nmbnvbcxzdgfnbx",
        compatibleDeviceTypes: [],
      },
    ],
    CurrentHealthCheck: statuses[Math.floor(Math.random() * statuses.length)],
    HealthStatusInfo: {
      Name: "Healthy",
      Description: "Active Systems",
      Color: "#10b981",
    },
    cpuUtilization: Math.floor(Math.random() * 100),
    memoryUtilization: Math.floor(Math.random() * 100),
    Metadata: {
      LastServiceUpTime: new Date(
        Date.now() - Math.floor(Math.random() * 10000000)
      ).toISOString(),
      LastCheckTime: new Date(
        Date.now() - Math.floor(Math.random() * 10000000)
      ).toISOString(),
      DownTime: "0D 0H 0M 0S",
      SnoozeUntil: null,
      AcknowledgedDateTime: null,
      CreatedAt: new Date(
        Date.now() - Math.floor(Math.random() * 10000000)
      ).toISOString(),
    },
  }));
};

export const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const intervalOptions = [
  { label: "Every 30 seconds", cron: "*/30 * * * * *" },
  { label: "Every minute", cron: "* * * * *" },
  { label: "Every 5 minutes", cron: "*/5 * * * *" },
  { label: "Every 15 minutes", cron: "*/15 * * * *" },
  { label: "Every hour", cron: "0 * * * *" },
  { label: "Twice daily (8AM & 6PM)", cron: "0 8,18 * * *" },
  { label: "Daily at midnight", cron: "0 0 * * *" },
  { label: "Custom", cron: "" },
];

export const getIntervalLabel = (cron: string): string => {
  const match = intervalOptions.find((option) => option.cron === cron);
  return match?.label ?? `Custom: ${cron}`;
};