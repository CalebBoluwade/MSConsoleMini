"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ServiceManager from "../forms/ServiceManager";
import LoadingEventUI from "../LoadingUI";
import {
  useGetAllMonitorsQuery,
  useDeleteServiceMonitorMutation,
} from "@/lib/helpers/api/MonitorService";
import { toast } from "sonner";
import MonitorTable from "@/lib/helpers/tables/MonitoredServices";

const ServicesManagement = () => {
  const { data, isLoading, error, refetch } = useGetAllMonitorsQuery();
  const [deleteServiceMonitor] = useDeleteServiceMonitorMutation();

  const [serviceMonitors, setServiceMonitors] = useState<BaseMonitor[]>([]);

  useEffect(() => {
    if (data) {
      setServiceMonitors(data);
    }
  }, [data, serviceMonitors]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "CreatedAt", desc: true },
  ]);
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

  const {
    MonitorTableColumns,
    isEditDialogOpen,
    editingServiceId,
    setEditingServiceId,
    setIsEditDialogOpen,
  } = MonitorTable({
    handleDeleteService: handleDeleteService,
  });

  const columns = useMemo(() => MonitorTableColumns(), [MonitorTableColumns]);

  const table = useReactTable({
    data: serviceMonitors,
    columns: columns,
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
    return (
      <div className="h-[calc(100dvh-150px)] w-full flex justify-center items-center gap-3">
        Error loading data
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div className="space-y-7 space-x-1">
        {/* Table */}
        <Card className="border-0 py-0 px-1">
          {/* Header */}
          <CardHeader>
            <motion.div className="mt-4 space-y-6 rounded-lg px-6 py-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Monitor Manager
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Organize and monitor your entities
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="border-green-600 hover:bg-green-400 dark:text-white px-4 py-6 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Service Monitor
                </Button>
              </div>
            </motion.div>
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
