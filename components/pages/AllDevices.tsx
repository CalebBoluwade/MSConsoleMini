"use client";

import { db } from "@/lib/helpers/service/db/db.service";
import React, { useEffect, useState } from "react";
import HexagonGridView from "../HexagonGridView";
import LoadingEventUI from "../LoadingUI";
import { webSocketService } from "@/lib/helpers/service/websocket.service";
import { toast } from "sonner";
import { WifiOff } from "lucide-react";
import { Card, CardTitle, CardHeader } from "@/components/ui/card";
import LiveTrackerView from "../LiveTrackerView";

const AllDevices = () => {
  const [devices, setDevices] = useState<BaseMonitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // if (!webSocketService.isConnected) {
  //   toast("Dashboard is disconnected. Attempting to reconnect...", {
  //     action: {
  //       label: "Reconnect Now",
  //       onClick: () => webSocketService.handleReconnect(),
  //     },
  //     dismissible: webSocketService.isConnected,
  //     icon: <WifiOff color="red" />,

  //     duration: 315000,
  //   });
  // }

  useEffect(() => {
    if (!webSocketService.isConnected) {
      toast("Dashboard is disconnected. Attempting to reconnect...", {
        action: {
          label: "Reconnect Now",
          onClick: () => webSocketService.handleReconnect(),
        },
        dismissible: webSocketService.isConnected,
        icon: <WifiOff color="red" />,

        duration: 315000,
      });

      db.removeDevices();
    }

    const loadData = async () => {
      await db.initialize();

      const loadedDevices = await db.getAllDevices();
      console.log(loadedDevices);
      if (loadedDevices.length === 0) {
        toast("Dashboard has no data. Attempting to reconnect...", {
          action: {
            label: "Reconnect Now",
            onClick: () => webSocketService.handleReconnect(),
          },
          dismissible: false,
          icon: <WifiOff color="red" />,

          //duration: 15000,
        });
      } else {
        setDevices(loadedDevices);
      }
      setDevices(loadedDevices);
      setIsLoading(false);
    };

    loadData();
  }, []);

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
                webSocketService.isConnected ? "active" : "inactive"
              } inline-flex items-center gap-2 p-2 rounded text-lg font-bold`}
            >
              <p>
                Dashboard{" "}
                {`${webSocketService.isConnected ? "Online" : "Offline"}`}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <LiveTrackerView data={devices} />

      <HexagonGridView data={devices} />
    </div>
  );
};

export default AllDevices;
