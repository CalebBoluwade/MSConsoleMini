"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PluginTypeIcon, StatusBadge } from "@/lib/hooks/useStatusHooks";
import { formatDate } from "@/lib/helpers/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

interface TimelineProps {
  items: PluginResult[];
  className?: string;
}

const TimelineConnector = () => (
  <div
    className="absolute left-5 top-5 -ml-px mt-1 w-0.5 ---translate-x-1/2 h-full --bg-gray-300 bg-primary/20"
    aria-hidden="true"
  />
);

const TimelineIcon = ({ children }: { children: ReactNode }) => (
  <div className="absolute left-0 top-1 flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center">
    {/* Icon container */}
    {children || (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M8 6h10" />
        <path d="M6 12h9" />
        <path d="M4 18h7" />
      </svg>
    )}
  </div>
);

export function Timeline({ items, className }: Readonly<TimelineProps>) {
  return (
    <div className={cn("relative", className)}>
      {/* Timeline line */}
      <TimelineConnector />

      <div className="space-y-8">
        <div className="relative pl-8">
          <TimelineIcon>{PluginTypeIcon("")}</TimelineIcon>

          {/* Content */}
          <div className="ml-4 flex-1 group-hover:translate-x-2 transition-all duration-300">
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">
                      {formatDate(items[0].checkedAt)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge status={items[0].status}>
                      {items[0].status}
                    </StatusBadge>
                    <StatusBadge status={"Healthy"}>
                      {"Basic Health"}
                    </StatusBadge>
                  </div>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {"default"}
                </CardTitle>
                <CardDescription className="text-gray-600 ">
                  {items[0].pluginName}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
                  {items[0].output}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {items.map((item, index) => (
          <div key={index + 1} className="relative pl-8">
            <TimelineIcon>{PluginTypeIcon(item.pluginType)}</TimelineIcon>

            {/* Content */}
            <div className="ml-4 flex-1 group-hover:translate-x-2 transition-all duration-300">
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">
                        {formatDate(item.checkedAt)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <StatusBadge status={item.status}>
                        {item.status}
                      </StatusBadge>
                      <StatusBadge status={"Healthy"}>
                        {item.pluginType}
                      </StatusBadge>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {item.pluginName}
                  </CardTitle>
                  <CardDescription className="text-gray-600 ">
                    {item.pluginDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
                    {item.output}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
