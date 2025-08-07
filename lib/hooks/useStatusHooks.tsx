import {
  Activity,
  AlertCircle,
  BellOffIcon,
  Bolt,
  CalendarX,
  CheckCircle,
  MonitorX,
} from "lucide-react";
import { cn } from "../utils";
import { Badge } from "@/components/ui/badge";

export const StatusIcon = (status: string) => {
  switch ((status ?? "").toLowerCase()) {
    case "healthy":
      return <CheckCircle className="min-h-5 min-w-5 text-[#10B981]" />;
    case "escalation":
      return <AlertCircle className="min-h-5 min-w-5 text-[#f59e0b]" />;
    case "acknowledged":
      return <BellOffIcon className="min-h-5 min-w-5 text-[#3b82f6]" />;
    case "degraded":
      return <MonitorX className="min-h-5 min-w-5 text-[#ef4444]" />;
    case "invalidconfiguration":
      return <Bolt className="min-h-5 min-w-5 text-[#6b7280]" />;
    case "scheduled":
      return <CalendarX className="min-h-5 min-w-5 text-[#8b5cf6]" />;
    default:
      return <Activity className="min-h-5 min-w-5 text-[#6b7280]" />;
  }
};

export const PluginTypeIcon = (type: string) => {
  switch ((type ?? "").toLowerCase()) {
    case "healthy":
      return <CheckCircle className="min-h-5 min-w-5 text-[#10B981]" />;
    case "escalation":
      return <AlertCircle className="min-h-5 min-w-5 text-[#f59e0b]" />;
    case "acknowledged":
      return <BellOffIcon className="min-h-5 min-w-5 text-[#3b82f6]" />;
    case "degraded":
      return <MonitorX className="min-h-5 min-w-5 text-[#ef4444]" />;
    case "invalidconfiguration":
      return <Bolt className="min-h-5 min-w-5 text-[#6b7280]" />;
    case "scheduled":
      return <CalendarX className="min-h-5 min-w-5 text-[#8b5cf6]" />;
    default:
      return <Activity className="min-h-5 min-w-5 text-[#6b7280]" />;
  }
};

export const StatusColor = (status: string): string => {
  switch ((status ?? "").toLowerCase()) {
    case "healthy":
      return "bg-green-100 text-green-800 border-green-200";
    case "escalation":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "acknowledged":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "degraded":
      return "bg-red-100 text-red-800 border-red-200";
    case "invalidconfiguration":
      return "bg-grey-100 text-blue-800 border-gray-200";
    case "scheduled":
      return "bg-purple-200 border-purple-800 text-purple-500";
    default:
      return "bg-grey-100 text-blue-800 border-gray-200";
  }
};

export const TremorColor = (status: string): string => {
  switch ((status ?? "").toLowerCase()) {
    case "healthy":
      return "emerald";
    case "escalation":
      return "amber";
    case "acknowledged":
      return "sky";
    case "degraded":
      return "red";
    case "invalidconfiguration":
      return "grey";
    case "scheduled":
      return "purple";
    default:
      return "gray";
  }
};

export const StatusEmoji = (status: string): string => {
  switch ((status ?? "").toLowerCase()) {
    case "healthy":
      return "✅";
    case "escalation":
      return "🚧";
    case "acknowledged":
      return "🙈🔇";
    case "degraded":
      return "🔥🧑🏽‍🚒";
    case "invalidconfiguration":
      return "🔩";
    case "scheduled":
      return "💤";
    default:
      return "👀";
  }
};

export const HexStatusColor = (status: string): string => {
  switch ((status ?? "").toLowerCase()) {
    case "healthy":
      return "#10B981";
    case "escalation":
      return "#f59e0b";
    case "acknowledged":
      return "#3b82f6";
    case "degraded":
      return "#ef4444";
    case "invalidconfiguration":
      return "#6b7280";
    case "scheduled":
      return "#8b5cf6";
    default:
      return "#6b7280";
  }
};

interface StatusBadgeProps {
  status: StatusText;
  className?: string;
  children?: React.ReactNode;
}

export function StatusBadge({
  status,
  className,
  children,
}: Readonly<StatusBadgeProps>) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        StatusColor(status),
        className
      )}
    >
      {children || status}
    </Badge>
  );
}

export const useGroupedMonitorResults = (
  monitorResults: MonitoringResult[]
) => {
  // Group by systemMonitorId and get the latest entry for each
  const grouped = monitorResults.reduce((acc, monitor) => {
    if (
      !acc[monitor.systemMonitorId] ||
      new Date(monitor.checkedAt) >
        new Date(acc[monitor.systemMonitorId].checkedAt)
    ) {
      acc[monitor.systemMonitorId] = monitor;
    }
    return acc;
  }, {} as Record<string, MonitoringResult>);

  return Object.values(grouped);
};