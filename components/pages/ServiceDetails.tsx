import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PluginEditor } from "../forms/PluginManager";
import {
  getMonitoringResultsById,
  getSingleMonitor,
} from "@/lib/helpers/api/systemMonitorService";
import LoadingEventUI from "../LoadingUI";
import { Button } from "../ui/button";
import {
  Activity,
  AppWindowMac,
  BellRingIcon,
  CheckCircle,
  ChevronRight,
  Clock,
  Edit,
  MenuIcon,
  RefreshCw,
} from "lucide-react";
import ServiceManager from "../forms/ServiceManager";
import {
  StatusBadge,
  StatusColor,
  StatusIcon,
  useGroupedMonitorResults,
} from "@/lib/hooks/useStatusHooks";
import { formatDateTime } from "@/lib/helpers/utils";
import { Timeline } from "../Timeline";

const ServiceDetails: React.FC = () => {
  const { SystemMonitorId } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [selectedMonitor, setSelectedMonitor] = useState<BaseMonitor>();
  const [selectedMonitorResult, setSelectedMonitorResult] =
    useState<MonitoringResult | null>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [monitoringResults, setMonitoringResults] = useState<
    MonitoringResult[]
  >([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const uniqueMonitorResults = useGroupedMonitorResults(monitoringResults);
  const healthyCount = uniqueMonitorResults.filter(
    (m) => m.status.toLowerCase() === "healthy"
  ).length;
  const totalCount = uniqueMonitorResults.length;

  const loadData = async () => {
    try {
      const [monitor, results] = await Promise.all([
        getSingleMonitor(SystemMonitorId!.toString()),
        getMonitoringResultsById(SystemMonitorId!.toString()),
      ]);

      const isResultsInvalid = !Array.isArray(results) || results.length === 0;

      console.log(monitor, isResultsInvalid);
      if (!monitor) {
        router.push("/console/monitors");
        return;
      }

      setSelectedMonitor(monitor);
      setMonitoringResults(results);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (SystemMonitorId) {
      loadData();
    }

    return () => {};
  }, [SystemMonitorId, router]);

  const fetchData = async () => {
    setIsLoading(true);

    await loadData();

    setTimeout(() => {
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1000);
  };

  const handleSuccess = async () => {
    setIsDialogOpen(false);
    setEditingServiceId(null);
  };

  const openPluginModal = (monitor: MonitoringResult) => {
    setSelectedMonitorResult(monitor);
    setIsModalOpen(true);
  };

  const closePluginModal = () => {
    setSelectedMonitorResult(null);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100dvh-150px)] w-full flex justify-center items-center">
        <LoadingEventUI />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-6 p-6 rounded-lg shadow-sm border">
        <div className="flex justify-end items-center">
          {/* <h1 className="text-3xl font-bold text-gray-900">Service Details</h1> */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingServiceId(SystemMonitorId!.toString());
                    setIsDialogOpen(true);
                  }}
                >
                  <MenuIcon className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="text-2xl w-72" align="end">
                <DropdownMenuLabel>Service Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setEditingServiceId(SystemMonitorId!.toString());
                    setIsDialogOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                  Edit Service
                </DropdownMenuItem>
                          <DropdownMenuItem
                  onClick={() => {
                    setEditingServiceId(SystemMonitorId!.toString());
                    setIsDialogOpen(true);
                  }}
                >
                  <BellRingIcon className="w-4 h-4" />
                  Configure Notification Receipients
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setEditingServiceId(SystemMonitorId!.toString());
                    setIsDialogOpen(true);
                  }}
                >
                  <AppWindowMac className="w-4 h-4" />
                  Deploy Agent
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={fetchData}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-3 max-md:grid-cols-1 grid-flow-col items-center gap-6">
          <Card className="py-2">
            <CardHeader>
              <CardTitle className="text-3xl font-bold --text-gray-900">
                Service Details
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <CardDescription>
                Service: {selectedMonitor?.ServiceName}
              </CardDescription>
              <CardDescription>
                Service Device: {selectedMonitor?.Device}
              </CardDescription>
              <CardDescription>
                IPAddress: {selectedMonitor?.IPAddress}
              </CardDescription>
              <CardDescription>
                Created: {selectedMonitor?.Port}
              </CardDescription>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-3 col-span-2 gap-6">
            <Card className="py-2 border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Service Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-600">
                    {healthyCount}/{totalCount}
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-sm text-gray-600 mt-1">Systems Online</p>
              </CardContent>
            </Card>

            <Card className="py-2 border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Checks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-blue-600">
                    {monitoringResults.length}
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-sm text-gray-600 mt-1">Health Checks Run</p>
              </CardContent>
            </Card>

            <Card className="py-2 border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Uptime
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-purple-600">
                    99.9%
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  System Availability
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <section className="items-center gap-3 grid grid-cols-1 lg:grid-cols-5">
        {/* System Monitor Historical Data */}
        <Card className="w-full h-full lg:col-span-2 py-2">
          <CardHeader className="py-2">
            {/* <div className="flex items-center gap-3">
              {StatusIcon(uniqueMonitorResults.at(0)!.status)} */}

            <CardTitle className="text-xl font-bold text-gray-900">
              Recent Monitor Check History
            </CardTitle>
            <CardDescription className="mt-1">
              System Health Checks from newest to oldest (Last 10)
            </CardDescription>

            {/* </div> */}
          </CardHeader>
          <CardContent className="space-y-2">
            {monitoringResults.length ? (
              monitoringResults
                .toSorted(
                  (a, b) =>
                    new Date(b.checkedAt).getTime() -
                    new Date(a.checkedAt).getTime()
                )
                .slice(0, 7)
                .map((monitor, index) => (
                  <Card className="py-1" key={`${monitor.id}-${index}`}>
                    <div className="flex items-center justify-between py-4 px-3 dark:bg-black-700/75 rounded-lg">
                      <div className="flex items-center gap-3">
                        {StatusIcon(monitor.status)}

                        <StatusBadge status={monitor.status}>
                          {monitor.status}
                        </StatusBadge>

                        <CardTitle className="text-sm font-medium text-gray-500">
                          {monitor.message}
                        </CardTitle>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500 lg:truncate lg:w-42">
                          {formatDateTime(monitor.checkedAt)}
                        </span>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPluginModal(monitor)}
                          className={StatusColor(monitor.status)}
                        >
                          <ChevronRight />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
            ) : (
              <CardDescription className="text-gray-500 text-center">
                No Data Available
              </CardDescription>
            )}
          </CardContent>
        </Card>

        <AnimatePresence>
          <motion.div
            className="h-full w-full lg:col-span-3"
            key={"PluginEditor"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PluginEditor selectedMonitor={selectedMonitor!} />
          </motion.div>
        </AnimatePresence>
      </section>

      <AnimatePresence>
        {/* Plugin Results Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          {selectedMonitorResult && (
            <DialogContent className="--max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader></DialogHeader>

              <div className="space-y-6">
                {/* System Overview */}
                <Card className="py-2">
                  <CardHeader className="pt-2 flex justify-between items-center">
                    <CardTitle className="text-base flex items-center gap-2">
                      {StatusIcon(selectedMonitorResult.status)}
                      Plugin Results Overview
                    </CardTitle>
                    <CardDescription className="px-0">
                      <StatusBadge status={selectedMonitorResult.status}>
                        {selectedMonitorResult.status}
                      </StatusBadge>
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Plugin Results */}
                {selectedMonitorResult.pluginResults &&
                  selectedMonitorResult.pluginResults.length > 0 && (
                    <div className="space-y-2">
                      {/* {selectedMonitorResult.pluginResults.map(
                        (plugin, index) => (
                          <Card
                            key={index + 1}
                            className="rounded-lg p-2 border"
                          >
                            <CardHeader className="px-2 flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {StatusIcon(plugin.status)}
                                <CardTitle className="font-medium">
                                  {plugin.servicePluginId ?? "Default Plugin"}
                                </CardTitle>
                              </div>
                              <StatusBadge status={plugin.status}>
                                {plugin.status}
                              </StatusBadge>
                            </CardHeader>
                            <CardContent>
                              <CardDescription className="px-2 text-sm text-gray-700 mb-2">
                                {plugin.output}
                              </CardDescription>
                              <p className="text-xs text-gray-500">
                                Checked at: {formatDateTime(plugin.checkedAt)}
                              </p>
                            </CardContent>
                          </Card>
                        )
                      )} */}

                      <Timeline items={selectedMonitorResult.pluginResults} />
                    </div>
                  )}
                {/* <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Plugin Results ({selectedMonitor.pluginResults?.length || 0})
                  </h3>
                  
                  {selectedMonitor.pluginResults && selectedMonitor.pluginResults.length > 0 ? (
                    <div className="grid gap-4">
                      {selectedMonitor.pluginResults.map((plugin, index) => (
                        <Card key={index} className="border-l-4 border-l-blue-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base flex items-center gap-2">
                                {getStatusIcon(plugin.status)}
                                {plugin.pluginName || `Plugin ${index + 1}`}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(plugin.status)}>
                                  {plugin.status}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  #{index + 1}
                                </span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-2">Output</p>
                              <div className="bg-gray-50 rounded-lg p-3 border">
                                <p className="text-sm text-gray-900 font-mono whitespace-pre-wrap">
                                  {plugin.output}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                              <div>
                                <p className="text-xs font-medium text-gray-600">Plugin Name</p>
                                <p className="text-sm text-gray-900">
                                  {plugin.pluginName || 'Default Plugin'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-600">Checked At</p>
                                <p className="text-sm text-gray-900">
                                  {formatDateTime(plugin.checkedAt)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No plugin results available</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div> */}

                {/* Actions */}
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={closePluginModal} variant="outline">
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>

        <Dialog
          key={"EditService"}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        >
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>
                {editingServiceId ? "Edit Service" : "Create New Service"}
              </DialogTitle>
            </DialogHeader>
            <ServiceManager
              editServiceId={editingServiceId ?? undefined}
              existingPlugins={
                selectedMonitor ? selectedMonitor.PluginDetails : []
              }
              onSuccess={handleSuccess}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingServiceId(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </AnimatePresence>
    </div>
  );
};

export default ServiceDetails;
