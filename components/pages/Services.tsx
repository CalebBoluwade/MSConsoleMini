"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import ServiceManager from "../forms/ServiceManager";
import LoadingEventUI from "../LoadingUI";
import {
  deleteServiceMonitor,
  getAllMonitors,
} from "@/lib/helpers/api/systemMonitorService";
import { Switch } from "../ui/switch";
import ActionConfirmation from "../ActionConfirmation";
import { toast } from "sonner";
import { getIntervalLabel } from "@/lib/helpers/utils";
import { Input } from "../ui/input";

const ServicesManagement = () => {
  const [serviceMonitors, setServiceMonitors] = useState<BaseMonitor[]>([]);

  useEffect(() => {
    getAllMonitors().then(setServiceMonitors);
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [acknowledgeServiceDialogOpen, setAcknowledgeServiceDialogOpen] =
    useState(false);
  const [monitoredDialogOpen, setMonitoredDialogOpen] = useState(false);

  const router = useRouter();

  const handleSuccess = async () => {
    // const loadedGroups = await db.getAllGroups();
    getAllMonitors().then(setServiceMonitors);

    setIsDialogOpen(false);
    setEditingServiceId(null);
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100dvh-150px)] w-full flex justify-center items-center">
        <LoadingEventUI />
      </div>
    );
  }

  const handleDeleteService = async (serviceId: string) => {
    try {
      setIsLoading(true);
      //   await db.deleteGroup(groupId);
      await deleteServiceMonitor(serviceId).then(() =>
        setServiceMonitors(
          serviceMonitors.filter(
            (service) => service.SystemMonitorId !== serviceId
          )
        )
      );

      toast("Service has been deleted");
    } catch (error) {
      console.error("Error deleting group:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div>
        {/* Header */}
        <motion.div className="bg-white dark:bg-gray-800 space-y-6 rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Services Manager
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Organize and monitor your entities
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
              className="border-green-600 hover:bg-green-700 --text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Service Monitor
            </Button>
          </div>
        </motion.div>

        {serviceMonitors.length > 0 ? (
          <AnimatePresence>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>T</TableHead>
                  <TableHead>Monitor</TableHead>
                  <TableHead>Plugins</TableHead>
                  <TableHead>Monitor Interval</TableHead>
                  <TableHead>Acknowledge</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceMonitors.map((Service) => (
                  <TableRow key={Service.SystemMonitorId}>
                    <TableCell className="font-medium">
                      {Service.ServiceName}
                    </TableCell>
                    <TableCell className="text-muted-foreground truncate">
                      {Service.Description ?? "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground truncate">
                      {Service.IPAddress || "-"}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {Service.Device || "-"}
                    </TableCell>

                    <TableCell>
                      <Switch
                        checked={Service.IsMonitored}
                        id={Service.SystemMonitorId}
                        // color={"indigo"}
                        // tooltip="Enable Monitoring"
                        onCheckedChange={(d) => {
                          console.log(
                            "Switch changed",
                            d,
                            Service.SystemMonitorId
                          );
                          setMonitoredDialogOpen(true);
                        }}
                      />

                      <ActionConfirmation
                        triggerButtonLabel={""}
                        triggerButtonIcon={<></>}
                        dialogTitle={`Disable Monitoring For ${Service.ServiceName}`}
                        dialogDescription="This action stops our Engine from performing health Checks on this Service"
                        onConfirm={
                          () => {}
                          // handleDeleteService(Service.SystemMonitorId)
                        }
                        open={monitoredDialogOpen && Service.IsMonitored}
                        onOpenChange={setMonitoredDialogOpen}
                        onCancel={() => {
                          setMonitoredDialogOpen(false);
                        }}
                        customTrigger={<span></span>}
                      />
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">
                        {(Service.Plugins ?? []).length}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {getIntervalLabel(Service.checkInterval)}
                    </TableCell>

                    <TableCell>
                      <Switch
                        checked={Service.IsServiceIssueAcknowledged}
                        id={Service.SystemMonitorId}
                        // color={"green"}
                        // tooltip="Enable Monitoring"
                        onCheckedChange={(d) => {
                          console.log(
                            "Switch changed: IsServiceIssueAcknowledged",
                            d,
                            Service.SystemMonitorId
                          );
                          setAcknowledgeServiceDialogOpen(true);
                        }}
                      />

                      <ActionConfirmation
                        triggerButtonLabel={`Acknowledge / Snooze ${Service.ServiceName} Service Issue`}
                        triggerButtonIcon={<></>}
                        dialogTitle="Are you absolutely sure you want to snooze this service?"
                        dialogDescription="This action cannot be undone. This will permanently delete your group and remove your data from our servers."
                        onConfirm={
                          () => {}
                          // handleDeleteService(Service.SystemMonitorId)
                        }
                        open={acknowledgeServiceDialogOpen}
                        onOpenChange={setAcknowledgeServiceDialogOpen}
                        onCancel={() => {
                          setAcknowledgeServiceDialogOpen(false);
                        }}
                        customTrigger={<span></span>}
                        additionalContent={
                          <div>
                            <p>Snooze Until</p>
                            <Input
                              className="w-52 text-sm"
                              type="datetime-local"
                              min={new Date().toISOString().slice(0, 16)}
                            />
                          </div>
                        }
                      />
                    </TableCell>

                    <TableCell className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingServiceId(Service.SystemMonitorId);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <ActionConfirmation
                        triggerButtonLabel={`Delete ${Service.ServiceName} Service`}
                        triggerButtonIcon={<Trash className="w-4 h-4" />}
                        dialogTitle="Are you absolutely sure you want to delete this service?"
                        dialogDescription="This action cannot be undone. This will permanently delete your group and remove your data from our servers."
                        onConfirm={() =>
                          handleDeleteService(Service.SystemMonitorId)
                        }
                        open={isDeleteDialogOpen}
                        onOpenChange={setIsDeleteDialogOpen}
                        onCancel={() => setIsDeleteDialogOpen(false)}
                        customTrigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setIsDeleteDialogOpen(true)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        }
                      />

                      <Button
                        variant="link"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/console/monitors/${Service.SystemMonitorId}`
                          )
                        }
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">
              No Services created yet
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Service
            </Button>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>
                {editingServiceId ? "Edit Service" : "Create New Service"}
              </DialogTitle>
            </DialogHeader>
            <ServiceManager
              editServiceId={editingServiceId ?? undefined}
              onSuccess={handleSuccess}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingServiceId(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </motion.div>
    </AnimatePresence>
  );
};

export default ServicesManagement;
