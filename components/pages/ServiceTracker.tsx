"use client";

import React from "react";
import { StatusEmoji, TremorColor } from "@/lib/hooks/useStatusHooks";
import { Tracker } from "@tremor/react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CheckCircle2Icon } from "lucide-react";
import { useGetMonitoringServiceTrackerQuery } from "@/lib/helpers/api/MonitorService";
import LoadingEventUI from "../LoadingUI";
import { Button } from "../ui/button";

const ServiceTracker = () => {
  const { data, isLoading, error, refetch } =
    useGetMonitoringServiceTrackerQuery(null, {
      pollingInterval: 5 * 60 * 5000,
      refetchOnMountOrArgChange: true,
    });

  const AvailabilityCounter = (results: BaseMonitor[]): number => {
    const total = results.length;
    if (total === 0) return 0;

    const healthyCount = (Array.isArray(results) ? results : []).filter(
      (r) => r.CurrentHealthCheck === "Healthy"
    ).length;

    const availability = (healthyCount / total) * 100;
    return Math.round(availability * 100) / 100;
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100dvh-150px)] w-full flex justify-center items-center">
        <LoadingEventUI />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-[calc(100dvh-150px)] w-full flex justify-center items-center">
        Error loading data
        <Button
          variant={"outline"}
          onClick={() => {
            refetch();
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 space-y-3">
      {/* Optional: group header */}
      {(data ?? []).length > 0
        ? data.map((group, groupIndex) => {
            const firstService = group[0]; // representative for the group

            return (
              <Card key={groupIndex + 1} className="py-3 text-base gap-3 mb-3">
                <div className="px-6">
                  <CardHeader className="px-0 flex items-center justify-between">
                    <CardTitle className="font-semibold">
                      {firstService?.ServiceName ?? "Unknown Service"}
                    </CardTitle>

                    <span
                      tabIndex={-1}
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm text-foreground ring-1 ring-inset ring-ring dark:text-dark-content-emphasis dark:ring-secondary-foreground"
                    >
                      <span
                        className={`-ml-0.5 size-2 rounded-full bg-${TremorColor(
                          firstService?.CurrentHealthCheck ?? "UnknownStatus"
                        )}-500`}
                      />
                      {firstService?.CurrentHealthCheck ?? "UnknownStatus"}
                    </span>
                  </CardHeader>

                  <div className="mt-1 w-full flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2Icon
                        className="size-5 shrink-0 rounded-full text-emerald-500"
                        aria-hidden={true}
                      />
                      <p className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                        {firstService?.IPAddress ?? "Unknown IP"}
                      </p>
                    </div>
                    <p className="text-card-foreground text-sm font-medium">
                      {AvailabilityCounter(group as unknown as BaseMonitor[])}%
                      uptime
                    </p>
                  </div>
                </div>

                <CardContent>
                  <Tracker
                    data={group.map((item, idx) => ({
                      key: idx.toString(),
                      tooltip: `${(
                        item.CurrentHealthCheck ?? ""
                      ).toUpperCase()} ${StatusEmoji(item.CurrentHealthCheck)}`,
                      color: TremorColor(item.CurrentHealthCheck),
                      entity: item.IPAddress,
                    }))}
                    className="mt-1 h-7 flex w-full text-base font-semibold gap-0.5 rounded"
                  />
                </CardContent>
              </Card>
            );
          })
        : null}
    </div>
  );
};

export default ServiceTracker;
