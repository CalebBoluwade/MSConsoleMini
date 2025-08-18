"use client";

import { db } from "@/lib/helpers/service/db/db.service";
import React, { useEffect, useState, useCallback } from "react";
import HexagonGridView from "../HexagonGridView";
import LoadingEventUI from "../LoadingUI";
import { webSocketService } from "@/lib/helpers/service/websocket.service";
import { toast } from "sonner";
import { WifiOff } from "lucide-react";
import { connected } from "process";

const AllDevices = () => {
  const [devices, setDevices] = useState<BaseMonitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionAttempts, setConnectionAttempts] = useState(
    webSocketService.connectionAttempts
  );

  const updateDevices = useCallback(async () => {
    const loadedDevices = await db.getAllDevices();
    setDevices(loadedDevices);
  }, []);

  useEffect(() => {
    setConnectionAttempts(webSocketService.connectionAttempts);

    const loadData = async () => {
      await db.initialize();
      const loadedDevices = await db.getAllDevices();

      if (loadedDevices.length === 0 && !webSocketService.isConnected) {
        toast("Dashboard has no data. Attempting to reconnect...", {
          action: {
            label: "Reconnect Now",
            onClick: () => webSocketService.handleReconnect(),
          },
          dismissible: false,
          icon: <WifiOff color="red" />,
        });
      }

      setDevices(loadedDevices);
      setIsLoading(false);
    };

    loadData();

    // Subscribe to real-time updates
    const unsubscribeDeviceUpdate = webSocketService.subscribe(
      "deviceUpdate",
      updateDevices
    );
    const unsubscribeDevicesUpdate = webSocketService.subscribe(
      "devicesUpdate",
      updateDevices
    );

    console.log(connectionAttempts);
    if (!connected && connectionAttempts > 4) {
      toast("Dashboard is disconnected. Attempting to reconnect...", {
        action: {
          label: "Reconnect Now",
          onClick: () => webSocketService.handleReconnect(),
        },
        dismissible: false,
        icon: <WifiOff color="red" />,
        duration: 315000,
      });
    }

    return () => {
      unsubscribeDeviceUpdate();
      unsubscribeDevicesUpdate();
    };
  }, [updateDevices, connectionAttempts]);

  if (isLoading) {
    return (
      <div className="h-[calc(100dvh-150px)] w-full flex justify-center items-center">
        <LoadingEventUI />
      </div>
    );
  }

  return (
    <div className="mt-16 py-4 px-4 --space-y-6">
      <HexagonGridView className="py-4 px-4 --space-y-6" data={devices} />
    </div>
  );
};

export default AllDevices;
