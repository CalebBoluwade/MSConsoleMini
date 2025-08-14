import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Bell,
  Clock,
  Mail,
  Smartphone,
  Slack,
  LucideIcon,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { useGetAllMonitorsQuery } from "@/lib/helpers/api/MonitorService";
import LoadingEventUI from "./LoadingUI";
import { db } from "@/lib/helpers/service/db/db.service";
import UserSelectDropdown from "./UserSelect";

// Type definitions
type MetricType =
  | "cpu_usage"
  | "memory_usage"
  | "disk_free_space"
  | "network_latency"
  | "error_rate"
  | "request_count";
type ConditionType = ">" | "<" | ">=" | "<=" | "==" | "!=";
type DurationType = "1m" | "5m" | "10m" | "15m" | "30m" | "1h";
type SeverityType = "critical" | "warning" | "info";
type StatusType = "active" | "paused" | "error";
type NotificationType = "email" | "sms" | "slack";
type FilterStatusType = "all" | StatusType;
type FilterSeverityType = "all" | SeverityType;
type TargetType = "node" | "nodeGroup";

interface User {
  id: string;
  name: string;
  jobTitle: string;
  avatar: string;
  initials: string;
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  team: string[];
  metric: MetricType;
  condition: ConditionType;
  threshold: number;
  duration: DurationType;
  severity: SeverityType;
  status: StatusType;
  notifications: NotificationType[];
  targetType: TargetType;
  targetId: string;
  created: string;
  lastTriggered: string | null;
}

interface NewAlertRule {
  name: string;
  description: string;
  team: string[];
  metric: MetricType;
  condition: ConditionType;
  threshold: string | number;
  duration: DurationType;
  severity: SeverityType;
  notifications: NotificationType[];
  targetType: TargetType;
  targetId: string;
}

interface MetricOption {
  value: MetricType;
  label: string;
}

interface ConditionOption {
  value: ConditionType;
  label: string;
}

interface DurationOption {
  value: DurationType;
  label: string;
}

interface ModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}

interface RuleFormProps {
  rule: NewAlertRule | AlertRule;
  setRule: (rule: NewAlertRule | AlertRule) => void;
  onSubmit: () => void;
  submitText: string;
  nodes: BaseMonitor[];
  nodeGroups: MonitorGroup[];
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  valueColor?: string;
}

const AlertRuleManagement: React.FC = () => {
  const [rules, setRules] = useState<AlertRule[]>([
    {
      id: "1",
      name: "High CPU Usage",
      description: "Alert when CPU usage exceeds 80%",
      metric: "cpu_usage",
      condition: ">",
      threshold: 80,
      duration: "5m",
      severity: "critical",
      status: "active",
      notifications: ["email", "slack"],
      team: ["team-1", "team-2"],
      targetType: "node",
      targetId: "node-1",
      created: "2024-01-15",
      lastTriggered: "2024-01-20",
    },
    {
      id: "2",
      name: "Memory Usage Warning",
      description: "Warning when memory usage exceeds 70%",
      metric: "memory_usage",
      condition: ">",
      threshold: 70,
      duration: "10m",
      severity: "warning",
      status: "active",
      notifications: ["email"],
      team: ["team-1"],
      targetType: "nodeGroup",
      targetId: "group-1",
      created: "2024-01-12",
      lastTriggered: "2024-01-19",
    },
    {
      id: "3",
      name: "Disk Space Low",
      description: "Alert when disk space is below 20%",
      metric: "disk_free_space",
      condition: "<",
      threshold: 20,
      duration: "1m",
      severity: "critical",
      status: "paused",
      notifications: ["email", "sms"],
      team: ["team-2", "team-3"],
      targetType: "node",
      targetId: "node-2",
      created: "2024-01-10",
      lastTriggered: null,
    },
  ]);

  const defaultUsers: User[] = [
    {
      id: "1",
      name: "Alice Johnson",
      jobTitle: "Senior Frontend Developer",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      initials: "AJ",
    },
    {
      id: "2",
      name: "Bob Smith",
      jobTitle: "Product Manager",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      initials: "BS",
    },
    {
      id: "3",
      name: "Carol Davis",
      jobTitle: "UX Designer",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      initials: "CD",
    },
    {
      id: "4",
      name: "David Wilson",
      jobTitle: "Backend Engineer",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      initials: "DW",
    },
    {
      id: "5",
      name: "Emma Brown",
      jobTitle: "Data Scientist",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
      initials: "EB",
    },
  ];

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<FilterStatusType>("all");
  const [filterSeverity, setFilterSeverity] =
    useState<FilterSeverityType>("all");
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedRule, setSelectedRule] = useState<AlertRule | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  const [monitorGroups, setMonitorGroups] = useState<MonitorGroup[]>([]);

  const [newRule, setNewRule] = useState<NewAlertRule>({
    name: "",
    description: "",
    metric: "cpu_usage",
    condition: ">",
    threshold: "",
    duration: "5m",
    severity: "warning",
    notifications: [],
    team: [],
    targetType: "node",
    targetId: "",
  });

  // Mock data for nodes and node groups
  //   const nodes: Node[] = [
  //     { id: "node-1", name: "Web Server 01", type: "web" },
  //     { id: "node-2", name: "Database Server 01", type: "database" },
  //     { id: "node-3", name: "API Server 01", type: "api" },
  //   ];

  useEffect(() => {
    const loadGroups = async () => {
      await db.initialize();
      const loadedGroups = await db.getAllGroups();
      setMonitorGroups(loadedGroups);
    };

    loadGroups();
  }, []);

  const { data: monitorNodes, isLoading, error } = useGetAllMonitorsQuery();

  //   const nodeGroups: NodeGroup[] = [
  //     { id: "group-1", name: "Production Web Servers", nodeCount: 5 },
  //     { id: "group-2", name: "Database Cluster", nodeCount: 3 },
  //     { id: "group-3", name: "API Gateway Cluster", nodeCount: 4 },
  //   ];

  const metrics: MetricOption[] = [
    { value: "cpu_usage", label: "CPU Usage (%)" },
    { value: "memory_usage", label: "Memory Usage (%)" },
    { value: "disk_free_space", label: "Disk Free Space (%)" },
    { value: "network_latency", label: "Network Latency (ms)" },
    { value: "error_rate", label: "Error Rate (%)" },
    { value: "request_count", label: "Request Count" },
  ];

  const conditions: ConditionOption[] = [
    { value: ">", label: "Greater than" },
    { value: "<", label: "Less than" },
    { value: ">=", label: "Greater than or equal" },
    { value: "<=", label: "Less than or equal" },
    { value: "==", label: "Equal to" },
    { value: "!=", label: "Not equal to" },
  ];

  const durations: DurationOption[] = [
    { value: "1m", label: "1 minute" },
    { value: "5m", label: "5 minutes" },
    { value: "10m", label: "10 minutes" },
    { value: "15m", label: "15 minutes" },
    { value: "30m", label: "30 minutes" },
    { value: "1h", label: "1 hour" },
  ];

  const severityColors: Record<SeverityType, string> = {
    critical: "bg-red-100 text-red-800 border-red-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
  };

  const statusColors: Record<StatusType, string> = {
    active: "bg-green-100 text-green-800",
    paused: "bg-gray-100 text-gray-800",
    error: "bg-red-100 text-red-800",
  };

  const notificationIcons: Record<NotificationType, LucideIcon> = {
    email: Mail,
    sms: Smartphone,
    slack: Slack,
  };

  const filteredRules = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return rules.filter((rule: AlertRule) => {
      const matchesSearch =
        rule.name.toLowerCase().includes(searchLower) ||
        rule.description.toLowerCase().includes(searchLower);
      const matchesStatus =
        filterStatus === "all" || rule.status === filterStatus;
      const matchesSeverity =
        filterSeverity === "all" || rule.severity === filterSeverity;
      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [rules, searchTerm, filterStatus, filterSeverity]);

  const stats = useMemo(
    () => ({
      total: rules.length,
      active: rules.filter((r) => r.status === "active").length,
      critical: rules.filter((r) => r.severity === "critical").length,
      triggered: rules.filter((r) => r.lastTriggered).length,
    }),
    [rules]
  );

  const resetNewRule = useCallback(
    () => ({
      name: "",
      description: "",
      metric: "cpu_usage" as MetricType,
      condition: ">" as ConditionType,
      threshold: "",
      duration: "5m" as DurationType,
      severity: "warning" as SeverityType,
      notifications: [] as NotificationType[],
      team: [] as string[],
      targetType: "node" as TargetType,
      targetId: "",
    }),
    []
  );

  const handleCreateRule = useCallback((): void => {
    const rule: AlertRule = {
      ...newRule,
      id: Date.now().toString(),
      threshold:
        typeof newRule.threshold === "string"
          ? parseFloat(newRule.threshold)
          : newRule.threshold,
      status: "active" as StatusType,
      created: new Date().toISOString().split("T")[0],
      lastTriggered: null,
    };
    setRules((prev) => [...prev, rule]);
    setNewRule(resetNewRule());
    setShowCreateModal(false);
  }, [newRule, resetNewRule]);

  const handleEditRule = useCallback((): void => {
    if (!selectedRule) return;
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === selectedRule.id ? { ...selectedRule } : rule
      )
    );
    setShowEditModal(false);
    setSelectedRule(null);
  }, [selectedRule]);

  const handleDeleteRule = useCallback((): void => {
    if (!ruleToDelete) return;
    setRules((prev) => prev.filter((rule) => rule.id !== ruleToDelete));
    setShowDeleteConfirm(false);
    setRuleToDelete(null);
  }, [ruleToDelete]);

  const toggleRuleStatus = useCallback((ruleId: string): void => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId
          ? { ...rule, status: rule.status === "active" ? "paused" : "active" }
          : rule
      )
    );
  }, []);

  const handleNotificationChange = useCallback(
    (
      notification: NotificationType,
      isChecked: boolean,
      ruleState: NewAlertRule | AlertRule,
      setRuleState: (rule: NewAlertRule | AlertRule) => void
    ): void => {
      const updatedNotifications = isChecked
        ? [...ruleState.notifications, notification]
        : ruleState.notifications.filter((n) => n !== notification);
      setRuleState({ ...ruleState, notifications: updatedNotifications });
    },
    []
  );

  if (isLoading) {
    return (
      <div className="h-[calc(100dvh-150px)] w-full flex justify-center items-center">
        <LoadingEventUI />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100dvh-150px)] w-full flex justify-center items-center">
        Error loading data
      </div>
    );
  }

  const Modal: React.FC<ModalProps> = ({ show, onClose, title, children }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black shadow bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">{title}</h2>
            <Button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle size={24} />
            </Button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  };

  const FormField: React.FC<FormFieldProps> = ({
    label,
    children,
    required = false,
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );

  const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon: Icon,
    bgColor,
    iconColor,
    valueColor = "text-gray-900",
  }) => (
    <div className="p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        </div>
        <div className={`p-2 ${bgColor} rounded-lg`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );

  const RuleForm: React.FC<RuleFormProps> = ({
    rule,
    setRule,
    onSubmit,
    submitText,
    nodes,
    nodeGroups,
  }) => {
    const handleInputChange = (
      field: keyof (NewAlertRule | AlertRule),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: any
    ): void => {
      setRule({ ...rule, [field]: value });
    };

    const isFormValid = (): boolean => {
      return !!(rule.name && rule.threshold && rule.targetId);
    };

    return (
      <div className="space-y-6">
        <FormField label="Rule Name" required>
          <input
            type="text"
            value={rule.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter rule name"
          />
        </FormField>

        <FormField label="Description">
          <textarea
            value={rule.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Enter rule description"
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Metric" required>
            <select
              value={rule.metric}
              onChange={(e) =>
                handleInputChange("metric", e.target.value as MetricType)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {metrics.map((metric) => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Condition" required>
            <select
              value={rule.condition}
              onChange={(e) =>
                handleInputChange("condition", e.target.value as ConditionType)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {conditions.map((condition) => (
                <option key={condition.value} value={condition.value}>
                  {condition.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Team" required>
          <UserSelectDropdown
            value={rule.team}
            onChange={(e) =>
              handleInputChange("team", e)
            }
            label="Assign Users"
            placeholder="Select team members..."
            // error={errors.assignedUsers?.message}
            enableSearch
            users={defaultUsers}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Threshold" required>
            <input
              type="number"
              value={rule.threshold}
              onChange={(e) => handleInputChange("threshold", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="80"
            />
          </FormField>

          <FormField label="Duration" required>
            <select
              value={rule.duration}
              onChange={(e) =>
                handleInputChange("duration", e.target.value as DurationType)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {durations.map((duration) => (
                <option key={duration.value} value={duration.value}>
                  {duration.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Severity" required>
            <select
              value={rule.severity}
              onChange={(e) =>
                handleInputChange("severity", e.target.value as SeverityType)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Target Type" required>
            <select
              value={rule.targetType}
              onChange={(e) =>
                handleInputChange("targetType", e.target.value as TargetType)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="node">Individual Node</option>
              <option value="nodeGroup">Node Group</option>
            </select>
          </FormField>

          <FormField
            label={
              rule.targetType === "node" ? "Select Node" : "Select Node Group"
            }
            required
          >
            <select
              value={rule.targetId}
              onChange={(e) => handleInputChange("targetId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                Select {rule.targetType === "node" ? "a node" : "a node group"}
              </option>
              {rule.targetType === "node"
                ? nodes.map((node) => (
                    <option
                      key={node.SystemMonitorId}
                      value={node.SystemMonitorId}
                    >
                      {node.ServiceName} ({node.Device})
                    </option>
                  ))
                : nodeGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({monitorGroups.length} nodes)
                    </option>
                  ))}
            </select>
          </FormField>
        </div>

        <FormField label="Notifications">
          <div className="space-y-3">
            {(["email", "sms", "slack"] as NotificationType[]).map(
              (notification) => {
                const Icon = notificationIcons[notification];
                return (
                  <label
                    key={notification}
                    className="flex items-center space-x-3"
                  >
                    <input
                      type="checkbox"
                      checked={rule.notifications.includes(notification)}
                      onChange={(e) =>
                        handleNotificationChange(
                          notification,
                          e.target.checked,
                          rule,
                          setRule
                        )
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Icon size={20} className="text-gray-500" />
                    <span className="capitalize">{notification}</span>
                  </label>
                );
              }
            )}
          </div>
        </FormField>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            onClick={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!isFormValid()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitText}
          </Button>
        </div>
      </div>
    );
  };

  const handleRuleChange = (rule: AlertRule | NewAlertRule) => {
    setSelectedRule(rule as AlertRule); // No type error
  };

  return (
    <div className="--min-h-screen --bg-gray-50 --p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div className="dark:bg-gray-800 space-y-6 rounded-lg px-6 py-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Alert Rules
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Monitor and manage your alert configurations
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(true)}
              className="border-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Rule
            </Button>
          </div>
        </motion.div>

        <div className="rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Alert Rules
                </h1>
                <p className="text-gray-600">
                  Monitor and manage your alert configurations
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              <span>Create Rule</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Total Rules"
            value={stats.total}
            icon={Settings}
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatsCard
            title="Active Rules"
            value={stats.active}
            icon={CheckCircle}
            bgColor="bg-green-100"
            iconColor="text-green-600"
            valueColor="text-green-600"
          />
          <StatsCard
            title="Critical Rules"
            value={stats.critical}
            icon={AlertTriangle}
            bgColor="bg-red-100"
            iconColor="text-red-600"
            valueColor="text-red-600"
          />
          <StatsCard
            title="Recently Triggered"
            value={stats.triggered}
            icon={Clock}
            bgColor="bg-orange-100"
            iconColor="text-orange-600"
            valueColor="text-orange-600"
          />
        </div>

        <FilterSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterSeverity={filterSeverity}
          setFilterSeverity={setFilterSeverity}
        />

        {/* Rules Table */}
        <div className="rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notifications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Triggered
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRules.map((rule) => (
                  <RuleTableRow
                    key={rule.id}
                    rule={rule}
                    metrics={metrics}
                    nodes={monitorNodes!}
                    nodeGroups={monitorGroups}
                    severityColors={severityColors}
                    statusColors={statusColors}
                    notificationIcons={notificationIcons}
                    onToggleStatus={toggleRuleStatus}
                    onEdit={(rule) => {
                      setSelectedRule({ ...rule });
                      setShowEditModal(true);
                    }}
                    onDelete={(ruleId) => {
                      setRuleToDelete(ruleId);
                      setShowDeleteConfirm(true);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredRules.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No rules found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new alert rule.
              </p>
            </div>
          )}
        </div>

        {/* Create Rule Modal */}
        <Modal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Alert Rule"
        >
          <RuleForm
            rule={newRule}
            setRule={setNewRule}
            onSubmit={handleCreateRule}
            submitText="Create Rule"
            nodes={monitorNodes!}
            nodeGroups={monitorGroups}
          />
        </Modal>

        {/* Edit Rule Modal */}
        <Modal
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Alert Rule"
        >
          {selectedRule && (
            <RuleForm
              rule={selectedRule}
              setRule={handleRuleChange}
              onSubmit={handleEditRule}
              submitText="Update Rule"
              nodes={monitorNodes!}
              nodeGroups={monitorGroups}
            />
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          show={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Delete Alert Rule"
        >
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Are you sure you want to delete this alert rule? This action
                cannot be undone.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteRule}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Rule
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

// Extracted Components
const FilterSection: React.FC<{
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: FilterStatusType;
  setFilterStatus: (status: FilterStatusType) => void;
  filterSeverity: FilterSeverityType;
  setFilterSeverity: (severity: FilterSeverityType) => void;
}> = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterSeverity,
  setFilterSeverity,
}) => (
  <div className="rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search rules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value as FilterStatusType)}
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="error">Error</option>
      </select>
      <select
        value={filterSeverity}
        onChange={(e) =>
          setFilterSeverity(e.target.value as FilterSeverityType)
        }
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Severities</option>
        <option value="critical">Critical</option>
        <option value="warning">Warning</option>
        <option value="info">Info</option>
      </select>
    </div>
  </div>
);

const RuleTableRow: React.FC<{
  rule: AlertRule;
  metrics: MetricOption[];
  nodes: BaseMonitor[];
  nodeGroups: MonitorGroup[];
  severityColors: Record<SeverityType, string>;
  statusColors: Record<StatusType, string>;
  notificationIcons: Record<NotificationType, LucideIcon>;
  onToggleStatus: (ruleId: string) => void;
  onEdit: (rule: AlertRule) => void;
  onDelete: (ruleId: string) => void;
}> = React.memo(
  ({
    rule,
    metrics,
    nodes,
    nodeGroups,
    severityColors,
    statusColors,
    notificationIcons,
    onToggleStatus,
    onEdit,
    onDelete,
  }) => {
    const getTargetName = () => {
      if (rule.targetType === "node") {
        return (
          nodes.find((n) => n.SystemMonitorId === rule.targetId)?.ServiceName ||
          "Unknown Node"
        );
      }
      return (
        nodeGroups.find((g) => g.id === rule.targetId)?.name || "Unknown Group"
      );
    };

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900">{rule.name}</div>
          <div className="text-sm text-gray-500">{rule.description}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{getTargetName()}</div>
          <div className="text-sm text-gray-500">
            {rule.targetType === "node" ? "Node" : "Node Group"}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {metrics.find((m) => m.value === rule.metric)?.label}{" "}
            {rule.condition} {rule.threshold}
          </div>
          <div className="text-sm text-gray-500">for {rule.duration}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              severityColors[rule.severity]
            }`}
          >
            {rule.severity}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <Button
            onClick={() => onToggleStatus(rule.id)}
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              statusColors[rule.status]
            } cursor-pointer hover:opacity-80`}
          >
            {rule.status}
          </Button>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex space-x-1">
            {rule.notifications.map((notification) => {
              const Icon = notificationIcons[notification];
              return (
                <Icon key={notification} size={16} className="text-gray-500" />
              );
            })}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {rule.lastTriggered || "Never"}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end space-x-2">
            <Button
              onClick={() => onEdit(rule)}
              className="text-blue-600 hover:text-blue-900"
            >
              <Edit size={16} />
            </Button>
            <Button
              onClick={() => onDelete(rule.id)}
              className="text-red-600 hover:text-red-900"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </td>
      </tr>
    );
  }
);

RuleTableRow.displayName = "RuleTableRow";

export default AlertRuleManagement;
