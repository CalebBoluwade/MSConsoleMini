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
  VisibilityState,
  getFacetedRowModel,
  getFacetedUniqueValues,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ChevronLeft,
  ChevronsLeft,
  ChevronRight,
  ChevronsRight,
  Download,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import Header from "../Header";
import AuthRequired from "@/lib/hooks/useAuthRequired";
import { PageNameEnum } from "@/lib/config/site-map";
import { exportToExcel, exportToPDF } from "@/lib/helpers/exportUtils";
import ActionConfirmation from "../ActionConfirmation";

const ServicesManagement = () => {
  const { data, isLoading, error, refetch } = useGetAllMonitorsQuery();
  const [deleteServiceMonitor] = useDeleteServiceMonitorMutation();

  const [serviceMonitors, setServiceMonitors] = useState<BaseMonitor[]>([]);
  const [exportConfirmOpen, setExportConfirmOpen] = useState(false);
  const [exportType, setExportType] = useState<"excel" | "pdf">("excel");

  useEffect(() => {
    if (data) {
      setServiceMonitors(data);
    }
  }, [data, serviceMonitors]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "CreatedAt", desc: true },
  ]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [globalFilter, setGlobalFilter] = useState("");

  const handleDeleteService = async (serviceId: string) => {
    try {
      await deleteServiceMonitor(serviceId)
        .unwrap()
        .then(() => {
          setServiceMonitors(
            serviceMonitors.filter(
              (service) => service.SystemMonitorId !== serviceId
            )
          );

          toast.success("Service monitor deleted successfully");
        });
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  const selectedRows = Object.keys(rowSelection);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkExportOpen, setBulkExportOpen] = useState(false);

  const handleBulkDelete = async () => {
    await Promise.all(selectedRows.map((id) => deleteServiceMonitor(id).unwrap()));
    setRowSelection({});
    refetch();
    toast.success(`${selectedRows.length} services deleted`);
    setBulkDeleteOpen(false);
  };

  const handleBulkExport = () => {
    const selectedMonitors = serviceMonitors.filter((m) =>
      selectedRows.includes(m.SystemMonitorId)
    );
    exportToExcel({ serviceMonitors: selectedMonitors });
    toast.success(`${selectedRows.length} services exported`);
    setBulkExportOpen(false);
  };

  const handleExportClick = (type: "excel" | "pdf") => {
    setExportType(type);
    setExportConfirmOpen(true);
  };

  const handleExportConfirm = () => {
    if (exportType === "excel") {
      exportToExcel({ serviceMonitors });
      toast("Excel export completed");
    } else {
      exportToPDF({ serviceMonitors });
      toast("PDF export initiated");
    }
    setExportConfirmOpen(false);
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
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    getRowId: (row) => row.SystemMonitorId.toString(),
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
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
      <div className="min-h-[calc(100dvh-150px)] w-full flex justify-center items-center gap-3">
        Error loading data
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div className="space-y-6 space-x-1">
        <Card className="border-0 py-0 px-1">
          <CardHeader>
            <Header
              title="Monitor Manager"
              subTitle="Get To The Fundamentals"
              subTitle2="Organize and monitor your entities"
              image="Programmer"
              ctaButton={
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-blue-600 hover:bg-blue-400 dark:text-white px-4 py-6 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Inventory
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleExportClick("excel")}
                        className="px-4 py-3"
                      >
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Export as Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExportClick("pdf")}
                        className="px-4 py-3"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Export as PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(true)}
                    className="border-green-600 hover:bg-green-400 dark:text-white px-4 py-6 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Service Monitor
                  </Button>
                </div>
              }
            />
          </CardHeader>

          <CardContent>
            {selectedRows.length > 0 && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">{selectedRows.length} selected</span>
                <Button className="px-4 py-6 border-red-400 hover:border-red-600 dark:text-white" size="sm" variant="outline" onClick={() => setBulkDeleteOpen(true)}>
                  Delete Selected
                </Button>
                <Button className="px-4 py-6 border-blue-400 hover:border-blue-600 dark:text-white" size="sm" variant="outline" onClick={() => setBulkExportOpen(true)}>
                  Export Selected
                </Button>
              </div>
            )}
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
                        colSpan={columns.length}
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

        <ActionConfirmation
          open={exportConfirmOpen}
          onOpenChange={setExportConfirmOpen}
          triggerButtonLabel=""
          dialogTitle="Export Confirmation"
          dialogDescription={`Are you sure you want to export ${serviceMonitors.length} service monitors as ${exportType.toUpperCase()}? This will download the application inventory report to your device.`}
          actionButtonLabel="Export"
          onConfirm={handleExportConfirm}
          onCancel={() => setExportConfirmOpen(false)}
          customTrigger={<></>}
        />

        <ActionConfirmation
          open={bulkDeleteOpen}
          onOpenChange={setBulkDeleteOpen}
          triggerButtonLabel=""
          dialogTitle="Delete Selected Services"
          dialogDescription={`Are you sure you want to delete ${selectedRows.length} selected services? This action cannot be undone.`}
          actionButtonLabel="Delete"
          onConfirm={handleBulkDelete}
          onCancel={() => setBulkDeleteOpen(false)}
          customTrigger={<></>}
        />

        <ActionConfirmation
          open={bulkExportOpen}
          onOpenChange={setBulkExportOpen}
          triggerButtonLabel=""
          dialogTitle="Export Selected Services"
          dialogDescription={`Export ${selectedRows.length} selected services to Excel format?`}
          actionButtonLabel="Export"
          onConfirm={handleBulkExport}
          onCancel={() => setBulkExportOpen(false)}
          customTrigger={<></>}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthRequired(PageNameEnum.SERVICE_MONITOR)(ServicesManagement);