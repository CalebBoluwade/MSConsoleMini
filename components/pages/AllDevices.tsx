"use client";

import { db } from "@/lib/helpers/service/db/db.service";
import React, { useEffect, useState, useCallback } from "react";
import HexagonGridView from "../HexagonGridView";
import LoadingEventUI from "../LoadingUI";
import { webSocketService } from "@/lib/helpers/service/websocket.service";
import { toast } from "sonner";
import { WifiOff } from "lucide-react";
import { Card, CardTitle, CardHeader } from "@/components/ui/card";

const AllDevices = () => {
  const [devices, setDevices] = useState<BaseMonitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(webSocketService.isConnected);

  const updateDevices = useCallback(async () => {
    const loadedDevices = await db.getAllDevices();
    setDevices(loadedDevices);
  }, []);

  const handleConnectionChange = useCallback((connected: boolean) => {
    setIsConnected(connected);
    if (!connected) {
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
  }, []);

  useEffect(() => {
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
    const unsubscribeDeviceUpdate = webSocketService.subscribe('deviceUpdate', updateDevices);
    const unsubscribeDevicesUpdate = webSocketService.subscribe('devicesUpdate', updateDevices);
    
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    const unsubscribeConnection = webSocketService.subscribe('connectionChange', (data: any) => {
      handleConnectionChange(data.connected);
    });

    // Track connection state changes
    const checkConnection = () => {
      const currentConnection = webSocketService.isConnected;
      if (currentConnection !== isConnected) {
        handleConnectionChange(currentConnection);
      }
    };

    const connectionInterval = setInterval(checkConnection, 1000);

    return () => {
      unsubscribeDeviceUpdate();
      unsubscribeDevicesUpdate();
      unsubscribeConnection();
      clearInterval(connectionInterval);
    };
  }, [updateDevices, handleConnectionChange, isConnected]);

  if (isLoading) {
    return (
      <div className="h-[calc(100dvh-150px)] w-full flex justify-center items-center">
        <LoadingEventUI />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 mt-12">
      <Card className="p-3">
        <CardHeader className="px-2">
          <CardTitle className="flex justify-between items-center">
            <h1 className="text-neutral-800 dark:text-neutral-100 text-xl font-medium">
              Monitors ({(devices ?? []).length})
            </h1>

            <div
              className={`signal ${
                isConnected ? "active" : "inactive"
              } inline-flex items-center gap-2 p-1 rounded text-lg font-bold`}
            >
              <p className="uppercase italic">{`${isConnected ? "Online" : "Offline"}`}</p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <HexagonGridView data={devices} />
    </div>
  );
};

export default AllDevices;
