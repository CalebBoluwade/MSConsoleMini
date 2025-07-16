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

const HexagonGridView = <T extends BaseMonitor>({
  ...props
}: AddedProps<T>) => {
  // const [activeTile, setActiveTile] = useState<T | null>(null);

  const openInNewTab = (SystemMonitorId: string) => {
    const newWindow = window.open(
      `/console/monitors/${SystemMonitorId}`,
      "_blank",
      "noopener,noreferrer"
    );
    if (newWindow) newWindow.opener = null;
  };

  return (
    <Card className="relative py-2 h-[calc(100dvh-120px)]">
      <AnimatePresence>
        {props.data.length ? (
          <div className="rounded-lg relative hexGrid grid grid-cols-12 gap-1 md:grid-cols-18 lg:grid-cols-24 mr-4">
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
                          strokeWidth={12}
                        />
                      </svg>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black border border-gray-700 p-3 w-64">
                       <p className="text-neutral-500 dark:text-neutral-400 text-sm font-mono">
                        {device.ServiceName}
                      </p>
                    <div className="text-neutral-800 dark:text-neutral-100 space-y-2">
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm font-mono">
                        {device.IPAddress}
                      </p>
                      <div className="flex justify-between items-center">
                        <div>Health Score</div>
                        <span>{StatusIcon(device.CurrentHealthCheck)}</span>
                        <p
                          className={`font-bold px-2 py-1 rounded ${
                            device.CurrentHealthCheck === "" ? "active" : "inactive"
                          }`}
                        >
                          {device.CurrentHealthCheck}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p>Last Seen</p>
                        <p className="text-gray-400">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(device as any).LastCheckTime}
                        </p>
                      </div>
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
