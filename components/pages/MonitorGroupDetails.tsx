"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { db } from "@/lib/helpers/service/db/db.service";
import { GroupForm } from "../forms/MonitorGroups";
import HexagonGridView from "../HexagonGridView";
import LoadingEventUI from "../LoadingUI";
import { webSocketService } from "@/lib/helpers/service/websocket.service";
import UserNotifications from "../forms/UserNotifications";

export const MonitorGroupDetails: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<MonitorGroup | null>(null);
  const [devices, setDevices] = useState<BaseMonitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditNotificationDialogOpen, setIsEditNotificationDialogOpen] =
    useState(true);

  useEffect(() => {
    const loadData = async () => {
      await db.initialize();
      const loadedGroup = await db.getGroup(id as string);
      if (!loadedGroup) {
        router.push("/console/groups");
        return;
      }
      setGroup(loadedGroup);

      const loadedDevices = await db.getDevicesByIds(loadedGroup.deviceIds);
      setDevices(loadedDevices);
      setIsLoading(false);
    };

    loadData();
    // Set up WebSocket listeners
    const unsubscribeGroupUpdated = webSocketService.subscribe(
      "groupUpdated",
      (updatedGroup: MonitorGroup) => {
        if (updatedGroup.id === id) {
          setGroup(updatedGroup);
          // Reload devices if device list changed
          if (
            JSON.stringify(updatedGroup.deviceIds) !==
            JSON.stringify(group?.deviceIds)
          ) {
            db.getDevicesByIds(updatedGroup.deviceIds).then(setDevices);
          }
        }
      }
    );

    const unsubscribeDeviceUpdated = webSocketService.subscribe(
      "deviceUpdate",
      (updatedDevice: NetworkDevice) => {
        if (group?.deviceIds.includes(updatedDevice.SystemMonitorId)) {
          setDevices((prev) =>
            prev.map((device) =>
              device.SystemMonitorId === updatedDevice.SystemMonitorId
                ? updatedDevice
                : device
            )
          );
        }
      }
    );

    return () => {
      unsubscribeGroupUpdated();
      unsubscribeDeviceUpdated();
    };
  }, [id, router, group?.deviceIds]);

  const handleDeleteGroup = async () => {
    if (!group) return;
    setIsDeleteDialogOpen(true);
    try {
      await db.deleteGroup(group.id);
      router.push("/console/groups");
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  const handleSuccess = async () => {
    if (!group) return;
    const loadedGroup = await db.getGroup(group.id);
    if (loadedGroup) {
      setGroup(loadedGroup);
      const loadedDevices = await db.getDevicesByIds(loadedGroup.deviceIds);
      setDevices(loadedDevices);
    }
    setIsEditDialogOpen(false);
  };

  if (isLoading || !group) {
    return (
      <div className="h-[calc(100dvh-150px)] w-full flex justify-center items-center">
        <LoadingEventUI />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-4 space-x-4">
        <div>
          <h1 className="font-bold inline-flex items-center gap-1.5">
            <p className="text-2xl">{group.name}</p>
            {group.description && (
              <div className="p-2.5 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground truncate">
                  {group.description}
                </p>
              </div>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            {group.deviceIds.length} devices
          </p>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Group
          </Button>
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete Group
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you absolutely sure you want to delete this group?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your group and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => setIsDeleteDialogOpen(!isDeleteDialogOpen)}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteGroup}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <HexagonGridView data={devices} />

      <Dialog
        open={isEditNotificationDialogOpen}
        onOpenChange={setIsEditNotificationDialogOpen}
      >
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Notification Group</DialogTitle>
          </DialogHeader>
          <UserNotifications />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
          </DialogHeader>
          <GroupForm
            groupId={group.id}
            onSuccess={handleSuccess}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
