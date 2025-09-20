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
    CreatedAt: new Date().toISOString(),
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

export const sanitizeContent = (content: string): string => {
  return content.replace(/[<>]/g, "");
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

export const evaluationWindowOptions = [
  { label: "Last 5 minutes", value: "5m" },
  { label: "Last 15 minutes", value: "15m" },
  { label: "Last hour", value: "1h" },
  { label: "Last 6 hours", value: "6h" },
  { label: "Last 12 hours", value: "12h" },
  { label: "Last 24 hours", value: "24h" },
  { label: "Custom", value: "Custom" },
];

export const alertThrottleOptions = [
  { label: "Every 5 minutes", value: "5m" },
  { label: "Every 15 minutes", value: "15m" },
  { label: "Every hour", value: "1h" },
  { label: "Every 6 hours", value: "6h" },
  { label: "Custom", value: "Custom" },
];

export const getIntervalLabel = (cron: string): string => {
  const match = intervalOptions.find((option) => option.cron === cron);
  return match?.label ?? `Custom: ${cron}`;
};

// Helper function to generate initials from service name
export const generateInitials = (name: string) => {
  if (!name) return "?";

  // Split by common separators and filter out empty strings
  const words = name.split(/[\s\-_\.]+/).filter((word) => word.length > 0);

  if (words.length === 1) {
    // Single word: take first 2-3 characters
    return words[0].substring(0, Math.min(3, words[0].length)).toUpperCase();
  } else if (words.length === 2) {
    // Two words: take first character of each
    return (words[0][0] + words[1][0]).toUpperCase();
  } else {
    // Multiple words: take first character of first 3 words
    return words
      .slice(0, 3)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }
};
