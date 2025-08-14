"use client";

import React, { InputHTMLAttributes } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardDescription } from "@/components/ui/card";
import { HexStatusColor, StatusIcon } from "@/lib/hooks/useStatusHooks";

interface AddedProps<T> extends InputHTMLAttributes<HTMLDivElement> {
  icon?: React.JSX.Element;
  onClick?: () => object;
  data: Array<T & { selected?: boolean }>;
}

// Helper function to generate initials from service name
const generateInitials = (serviceName: string) => {
  if (!serviceName) return "?";

  // Split by common separators and filter out empty strings
  const words = serviceName
    .split(/[\s\-_\.]+/)
    .filter((word) => word.length > 0);

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

const HexagonGridView = <T extends BaseMonitor>({
  ...props
}: AddedProps<T>) => {
  const openInNewTab = (SystemMonitorId: string) => {
    const newWindow = window.open(
      `/console/monitors/${SystemMonitorId}`,
      "_blank",
      "noopener,noreferrer"
    );
    if (newWindow) newWindow.opener = null;
  };

  return (
    <Card className="relative py-3 h-[calc(100dvh-165px)]">
      <AnimatePresence>
        {props.data.length ? (
          <div className="rounded-lg relative hexGrid grid grid-cols-12 gap-1 md:grid-cols-18 lg:grid-cols-24 --mr-4">
            {(props.data ?? []).map((device, index) => (
              <TooltipProvider key={device.SystemMonitorId}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      key={device.SystemMonitorId}
                      layout
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ delay: index * 0.02, duration: 0.3 }}
                      className="relative hexagon-tile aspect-square cursor-pointer transition-transform duration-300 hover:opacity-80"
                      // style={{ position: "relative" }}
                      onClick={() => openInNewTab(device.SystemMonitorId)}
                    >
                      <svg viewBox="0 0 100 100" width="100%" height="100%">
                        <polygon
                          points="50,3 95,25 95,75 50,97 5,75 5,25"
                          fill="transparent"
                          stroke={HexStatusColor(device.CurrentHealthCheck)}
                          strokeWidth={8}
                        />

                        <text
                          x="50"
                          y="50"
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="21"
                          fontWeight="bold"
                          fill={HexStatusColor(device.CurrentHealthCheck)}
                          className="select-none font-mono"
                        >
                          {generateInitials(device.ServiceName || "Unknown")}
                        </text>

                        <circle
                          cx="50"
                          cy="50"
                          r="30"
                          fill="rgba(255, 255, 255, 0.1)"
                          stroke="none"
                        />
                      </svg>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent className="border border-gray-700 p-3 space-y-4 space-x-2">
                    <div className="flex justify-between items-center gap-3">
                      <p>Service</p>

                      <p className="--text-neutral-500 --dark:text-neutral-400 text-sm font-mono">
                        {device.ServiceName}
                      </p>
                    </div>

                    <div className="flex justify-between items-center gap-3">
                      <p>IP Address</p>

                      <p className="--text-neutral-500 --dark:text-neutral-400 text-sm font-mono">
                        {device.IPAddress}
                      </p>
                    </div>

                    <div className="flex justify-between items-center gap-3">
                      <p>Node Health</p>

                      <div className="inline-flex items-center gap-2">
                        <p>{device.CurrentHealthCheck}</p>
                        <span>{StatusIcon(device.CurrentHealthCheck)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-3">
                      <p>Checked</p>

                      <p className="text-sm font-mono">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(device.Metadata.LastCheckTime as any).Time ?? (device as any).LastCheckTime}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        ) : (
          <CardDescription className="text-gray-500 font-extrabold text-2xl text-center">
            No Data Available
          </CardDescription>
        )}
      </AnimatePresence>

      {/* <SyntheticActionModal<T>
        activeTile={activeTile}
        setActiveTile={setActiveTile}
      /> */}
    </Card>
  );
};

export default HexagonGridView;
