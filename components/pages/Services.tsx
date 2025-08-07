"use client";

import React, { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash,
  Edit,
  ChevronLeft,
  ChevronsLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Card as TremorCard, SparkAreaChart } from "@tremor/react";
import {
  useGetAllMonitorsQuery,
  useDeleteServiceMonitorMutation,
} from "@/lib/helpers/api/MonitorService";
import { Switch } from "../ui/switch";
import ActionConfirmation from "../ActionConfirmation";
import { toast } from "sonner";
import { getIntervalLabel } from "@/lib/helpers/utils";
import { Input } from "../ui/input";
import {
  MonitorTableColumns
} from "@/lib/helpers/tables/MonitoredServices";

const ServicesManagement = () => {
  const { data, isLoading, error, refetch } = useGetAllMonitorsQuery();
  const [deleteServiceMonitor] = useDeleteServiceMonitorMutation();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [acknowledgeServiceDialogOpen, setAcknowledgeServiceDialogOpen] =
    useState(false);
  const [monitoredDialogOpen, setMonitoredDialogOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (data) {
      setServiceMonitors(data);
    }
  }, [data]);
  
  const chartdata = [
    {
      month: "Jan 21",
      Performance: 4000,
    },
    {
      month: "Feb 21",
      Performance: 3000,
    },
    {
      month: "Mar 21",
      Performance: 2000,
    },
    {
      month: "Apr 21",
      Performance: 2780,
    },
    {
      month: "May 21",
      Performance: 1890,
    },
  ];
  
  const [serviceMonitors, setServiceMonitors] = useState<BaseMonitor[]>([]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");


    const handleDeleteService = async (serviceId: string) => {
    try {
      await deleteServiceMonitor(serviceId)
        .unwrap()
        .then(() =>
          setServiceMonitors(
            serviceMonitors.filter(
              (service) => service.SystemMonitorId !== serviceId
            )
          )
        );

      toast("Service has been deleted");
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  // const columns = useMemo(
  //   () =>
  //     MonitorTableColumns(
  //       monitoredDialogOpen,
  //       setMonitoredDialogOpen,
  //       setEditingServiceId,
  //       setIsEditDialogOpen,
  //       isDeleteDialogOpen, setIsDeleteDialogOpen,
  //       handleDeleteService
  //     ),
  //   []
  // );

  const table = useReactTable({
    data: serviceMonitors,
    columns:  MonitorTableColumns(
        monitoredDialogOpen,
        setMonitoredDialogOpen,
        setEditingServiceId,
        setIsEditDialogOpen,
        isDeleteDialogOpen, setIsDeleteDialogOpen,
        handleDeleteService
      ),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  const handleSuccess = async () => {
    refetch();

    setIsEditDialogOpen(false);
    setEditingServiceId(null);
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100dvh-150px)] w-full flex justify-center items-center">
        <LoadingEventUI />
      </div>
    );
  }

  if (error) {
    return <p>Error loading data</p>;
  }

  return (
    <AnimatePresence>
      <motion.div className="space-y-5 space-x-2">
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
              onClick={() => setIsEditDialogOpen(true)}
              className="border-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Service Monitor
            </Button>
          </div>
        </motion.div>

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Monitors</CardTitle>
              {/* <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(true)}
                  className="border-green-600 hover:bg-green-700 --text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Service Monitor
                </Button>
              </div> */}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={serviceMonitors.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Rows per page</p>
                  <select
                    title="pagination"
                    onChange={(e) => {
                      table.setPageSize(Number(e.target.value));
                    }}
                    value={table.getState().pagination.pageSize}
                    className="h-8 w-[70px] rounded border border-input bg-background px-2 py-1 text-sm"
                  >
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <option key={pageSize} value={pageSize}>
                        {pageSize}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    className="hidden h-8 w-8 p-0 lg:flex"
                  >
                    <span className="sr-only">Go to first page</span>
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => table.previousPage()}
                    variant="outline"
                    className="h-8 w-8 p-0"
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    className="h-8 w-8 p-0"
                    variant="outline"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Go to next page</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    variant="outline"
                  >
                    <span className="sr-only">Go to last page</span>
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {(serviceMonitors ?? []).length > 0 ? (
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
                  <TableHead>Overview</TableHead>
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
                        color={"green"}
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
                      <TremorCard className="bg-accent rounded flex max-w-lg items-center justify-between px-4 py-3.5">
                        <SparkAreaChart
                          data={chartdata}
                          categories={["Performance"]}
                          index={"month"}
                          colors={["purple", "#ffcc33"]}
                          className="h-7 w-16 sm:h-12 sm:w-32"
                        />

                        <div className="rounded bg-emerald-500 px-2 py-1 text-sm font-medium text-white">
                          {(Service.Metrics ?? []).length > 0
                            ? (
                                Service.Metrics.reduce(
                                  (sum, value) => sum + value,
                                  0
                                ) / Service.Metrics.length
                              ).toFixed(2) + " %"
                            : "N/A"}
                        </div>
                      </TremorCard>
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

                    <TableCell>
                      <Button
                        variant="ghost"
                        // size="lg"
                        onClick={() => {
                          setEditingServiceId(Service.SystemMonitorId);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-6 h-6" />
                      </Button>

                      <ActionConfirmation
                        triggerButtonLabel={`Delete ${Service.ServiceName} Service`}
                        triggerButtonIcon={<Trash className="w-6 h-6" />}
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
            <Button onClick={() => setIsEditDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Service
            </Button>
          </div>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                setEditingServiceId(null);
                setIsEditDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </motion.div>
    </AnimatePresence>
  );
};

export default ServicesManagement;
