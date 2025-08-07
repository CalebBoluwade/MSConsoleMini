import ActionConfirmation from "@/components/ActionConfirmation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/lib/hooks/useStatusHooks";
import { createColumnHelper } from "@tanstack/react-table";
import { Edit, Eye, MoreHorizontal, Trash } from "lucide-react";
import { Card as TremorCard, SparkAreaChart } from "@tremor/react";
import { getIntervalLabel } from "../utils";
import { SortIcon } from "@/lib/hooks/useSort";
import Link from "next/link";

const columnHelper = createColumnHelper<BaseMonitor>();

export const MonitorTableColumns = (
  monitoredDialogOpen: boolean,
  setMonitoredDialogOpen: (value: React.SetStateAction<boolean>) => void,
  setEditingServiceId: (value: React.SetStateAction<string | null>) => void,
  setIsEditDialogOpen: (value: React.SetStateAction<boolean>) => void,
  isDeleteDialogOpen: boolean,
  setIsDeleteDialogOpen: (value: React.SetStateAction<boolean>) => void,
  handleDeleteService: (serviceId: string) => Promise<void>
) => [
  columnHelper.accessor("SystemMonitorId", {
    header: "Monitor ID",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        className="h-8 px-2 lg:px-3 flex items-center justify-center text-center text-sm text-muted-foreground"
      >
        {row.original.SystemMonitorId}
      </Button>
    ),
  }),
  columnHelper.accessor("ServiceName", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        Host Name
        {SortIcon(column.getIsSorted())}
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center text-center text-sm text-muted-foreground">
        {row.original.ServiceName}
      </div>
    ),
  }),
  columnHelper.accessor("IPAddress", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        IP
        {SortIcon(column.getIsSorted())}
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center text-center text-sm text-muted-foreground">
        {row.original.IPAddress}
      </div>
    ),
  }),
  columnHelper.accessor("Device", {
    header: "Device Type",
    cell: ({ row }) => (
      <div className="flex items-center justify-center text-center text-sm text-muted-foreground">
        {row.original.Device}
      </div>
    ),
  }),
  columnHelper.accessor("IsMonitored", {
    header: "Monitored",
    cell: ({ row }) => {
      return (
        <>
          <Switch
            checked={row.original.IsMonitored}
            id={row.original.SystemMonitorId}
            color={"green"}
            onCheckedChange={(d) => {
              console.log("Switch changed", d, row.original.SystemMonitorId);
              setMonitoredDialogOpen(true);
            }}
          />

          <ActionConfirmation
            triggerButtonLabel={""}
            triggerButtonIcon={<></>}
            dialogTitle={`Disable Monitoring For ${row.getValue(
              "ServiceName"
            )}`}
            dialogDescription="This action stops our Engine from performing health Checks on this Service"
            onConfirm={
              () => {}
              // handleDeleteService(Service.SystemMonitorId)
            }
            open={monitoredDialogOpen && row.original.IsMonitored}
            onOpenChange={setMonitoredDialogOpen}
            onCancel={() => {
              setMonitoredDialogOpen(false);
            }}
            customTrigger={<span></span>}
          />
        </>
      );
    },
  }),
  columnHelper.accessor("Plugins", {
    header: "Plugins",
    cell: ({ row }) => (
      <Badge className="px-2 py-3" variant="outline">
        {(row.original.Plugins ?? []).length}
      </Badge>
    ),
  }),
  columnHelper.accessor("CurrentHealthCheck", {
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge status={row.original.CurrentHealthCheck as StatusText}>
        {row.original.CurrentHealthCheck}
      </StatusBadge>
    ),
  }),
  columnHelper.accessor("checkInterval", {
    header: "Monitor Interval",
    cell: ({ row }) => (
      <div className="flex items-center justify-center text-center text-sm text-muted-foreground">
        {getIntervalLabel(row.original.checkInterval)}
      </div>
    ),
  }),

  columnHelper.accessor("Metrics", {
    header: "Overview",
    cell: ({ row }) => (
      <TremorCard className="bg-accent rounded flex max-w-lg items-center justify-between px-4 py-3.5">
        {(row.original.Metrics ?? []).length !== 0 ? (
          <>
            <SparkAreaChart
              data={row.original.Metrics.map((x, i) => ({
                timestamp: i,
                metric: x,
              }))}
              categories={["metric"]}
              index={"timestamp"}
              colors={["purple", "#ffcc33"]}
              className="h-7 w-16 sm:h-12 sm:w-32"
            />

            <div className="rounded bg-emerald-500 px-2 py-1 text-sm font-medium text-white">
              {(row.original.Metrics ?? []).length > 0
                ? (
                    row.original.Metrics.reduce(
                      (sum, value) => sum + value,
                      0
                    ) / row.original.Metrics.length
                  ).toFixed(2) + " %"
                : "N/A"}
            </div>
          </>
        ) : (
          <>No Recent Data</>
        )}
      </TremorCard>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const service = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="space-y-2 p-3">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(service.SystemMonitorId)
              }
            >
              Copy Monitor ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-1 w-full flex justify-between items-center">
              <Link href={`/console/monitors/${service.SystemMonitorId}`} className="p-2 flex justify-between items-center">
                <Eye className="h-4 w-4" />
                View Service
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-1 w-full flex justify-between items-center">
              <Button
                variant="ghost"
                // size="lg"
                className="text-amber-400"
                onClick={() => {
                  setEditingServiceId(service.SystemMonitorId);
                  setIsEditDialogOpen(true);
                }}
              >
                <Edit className="w-6 h-6" /> Edit Service
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ActionConfirmation
                triggerButtonLabel={`Delete ${service.ServiceName} Service`}
                triggerButtonIcon={<Trash className="w-6 h-6" />}
                dialogTitle="Are you absolutely sure you want to delete this service?"
                dialogDescription="This action cannot be undone. This will permanently delete your group and remove your data from our servers."
                onConfirm={() => handleDeleteService(service.SystemMonitorId)}
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
                    <Trash className="w-4 h-4" /> Delete Service
                  </Button>
                }
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  }),
];
