// GroupForm.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash, X } from "lucide-react";
import { db } from "@/lib/helpers/service/db/db.service";
import { GroupFormSchema } from "@/lib/helpers/schema/groups";
import LoadingEventUI from "../LoadingUI";
import useDebouncedSearch from "@/lib/hooks/useDebouncedSearch";
import { StatusBadge } from "@/lib/hooks/useStatusHooks";
import { useGetAllMonitorsQuery } from "@/lib/helpers/api/MonitorService";

interface GroupFormProps {
  groupId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const GroupForm: React.FC<GroupFormProps> = ({
  groupId,
  onSuccess,
  onCancel,
}) => {
  const [devices, setDevices] = useState<BaseMonitor[]>([]);
  const [availableMonitors, setAvailableMonitors] = useState<BaseMonitor[]>([]);
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);

   const { data, isLoading } = useGetAllMonitorsQuery();

  const form = useForm<z.infer<typeof GroupFormSchema>>({
    resolver: zodResolver(GroupFormSchema),
    defaultValues: {
      name: "",
      description: "",
      deviceIds: [],
    },
  });

  useEffect(() => {
    const initialize = async () => {
      await db.initialize();

      // Load mock devices if none exist

      if (!data || data?.length) {
        await db.addDevices(data!)
      }

      const monitors = await db.getAllDevices();

      setAvailableMonitors(monitors);

      if (groupId) {
        const group = await db.getGroup(groupId);
        if (group) {
          form.reset({
            name: group.name,
            description: group.description,
            deviceIds: group.deviceIds,
          });
          const groupDevices = await db.getDevicesByIds(group.deviceIds);
          setDevices(groupDevices);
        }
      }
    };

    initialize();
  }, [groupId, data, form]);

  const onSubmit = async (values: z.infer<typeof GroupFormSchema>) => {
    try {
      if (groupId) {
        const existingGroup = await db.getGroup(groupId);
        if (existingGroup) {
          await db.updateGroup({
            ...existingGroup,
            ...values,
            deviceIds: values.deviceIds || [],
          });
        }
      } else {
        await db.addGroup({
          name: values.name,

          description: values.description ?? "",
          deviceIds: values.deviceIds ?? [],
        });
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error saving group:", error);
    }
  };

  const handleAddDevices = (deviceIds: string[]) => {
    const currentDeviceIds = form.getValues("deviceIds") || [];
    const newDeviceIds = [...new Set([...currentDeviceIds, ...deviceIds])];
    form.setValue("deviceIds", newDeviceIds);

    // Update displayed devices
    const addedDevices = availableMonitors.filter(
      (device) =>
        deviceIds.includes(device.SystemMonitorId) &&
        !currentDeviceIds.includes(device.SystemMonitorId)
    );
    setDevices((prev) => [...prev, ...addedDevices]);
    setShowDeviceSelector(false);
  };

  const handleRemoveDevice = (deviceId: string) => {
    const currentDeviceIds = form.getValues("deviceIds") || [];
    const newDeviceIds = currentDeviceIds.filter((id) => id !== deviceId);
    form.setValue("deviceIds", newDeviceIds);
    setDevices((prev) =>
      prev.filter((device) => device.SystemMonitorId !== deviceId)
    );
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100dvh-150px)] w-full flex justify-center items-center">
        <LoadingEventUI />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter group name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter group description"
                    // className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <div className="flex justify-between items-center mb-2">
              <FormLabel>Devices</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDeviceSelector(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Service Monitors
              </Button>
            </div>

            <AnimatePresence>
              {devices.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={
                    devices.length > 10
                      ? "grid grid-cols-2 gap-3 space-y-2 overflow-scroll"
                      : "flex flex-wrap gap-3 items-center space-y-2"
                  }
                >
                  {devices.map((device) => (
                    <motion.div
                      key={device.SystemMonitorId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className={
                        "flex items-center justify-between p-3 border rounded-lg"
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <span>{device.ServiceName}</span>
                        <span className="inline-flex gap-2">
                          <Badge variant="outline">{device.Device}</Badge>
                          <StatusBadge
                            status={device.CurrentHealthCheck as StatusText}
                          />
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() =>
                          handleRemoveDevice(device.SystemMonitorId)
                        }
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg"
                >
                  <p className="text-muted-foreground">No devices added</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {groupId ? "Update Group" : "Create Group"}
            </Button>
          </div>
        </form>
      </Form>

      <AnimatePresence>
        {showDeviceSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeviceSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Add Service Monitors</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeviceSelector(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-4 overflow-y-auto flex-grow">
                <DeviceSelector
                  availableDevices={availableMonitors}
                  selectedDeviceIds={form.getValues("deviceIds") || []}
                  onAddDevices={handleAddDevices}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface DeviceSelectorProps {
  availableDevices: BaseMonitor[];
  selectedDeviceIds: string[];
  onAddDevices: (deviceIds: string[]) => void;
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  availableDevices,
  selectedDeviceIds,
  onAddDevices,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchTerm = useDebouncedSearch(searchInput, 300);

  const filteredDevices = (availableDevices ?? []).filter(
    (device) =>
      !selectedDeviceIds.includes(device.SystemMonitorId) &&
      (device.ServiceName.toLowerCase().includes(
        debouncedSearchTerm.toLowerCase()
      ) ||
        device.IPAddress.toLowerCase().includes(
          debouncedSearchTerm.toLowerCase()
        ))
  );

  const toggleDevice = (deviceId: string) => {
    setSelected((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const handleAddSelected = () => {
    onAddDevices(selected);
    setSelected([]);
  };

  return (
    <div className="space-y-4 overflow-scroll">
      <Input
        placeholder="Search devices..."
        value={debouncedSearchTerm}
        onChange={(e) => setSearchInput(e.target.value)}
      />

      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {filteredDevices.length > 0 ? (
          filteredDevices.map((device) => (
            <div
              key={device.SystemMonitorId}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                selected.includes(device.SystemMonitorId)
                  ? "bg-primary/10 border-primary"
                  : "hover:bg-accent"
              }`}
              onClick={() => toggleDevice(device.SystemMonitorId)}
            >
              <Checkbox
                checked={selected.includes(device.SystemMonitorId)}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{device.ServiceName}</span>
                  <span className="inline-flex gap-2">
                    <Badge variant="outline">{device.Device}</Badge>
                    <StatusBadge
                      status={device.CurrentHealthCheck as StatusText}
                    />
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {device.IPAddress}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No devices found
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          disabled={selected.length === 0}
          onClick={handleAddSelected}
        >
          Add Selected ({selected.length})
        </Button>
      </div>
    </div>
  );
};
