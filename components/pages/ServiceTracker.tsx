"use client";

import React from "react";
import { StatusEmoji, TremorColor } from "@/lib/hooks/useStatusHooks";
import { Tracker } from "@tremor/react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CheckCircle2Icon } from "lucide-react";
import { useGetMonitoringServiceTrackerQuery } from "@/lib/helpers/api/MonitorService";
import LoadingEventUI from "../LoadingUI";

const ServiceTracker = () => {
  const { data, isLoading, error } = useGetMonitoringServiceTrackerQuery(null, {
    pollingInterval: 5 * 60 * 5000,
    refetchOnMountOrArgChange: true,
  });

  const AvailabilityCounter = (results: BaseMonitor[]): number => {
    const total = results.length;
    if (total === 0) return 0;

    const healthyCount = results.filter(
      (r) => r.CurrentHealthCheck === "Healthy"
    ).length;

    const availability = (healthyCount / total) * 100;
    return Math.round(availability * 100) / 100;
  };

  //   const AvailabilityCounter = ({ results }: { results: BaseMonitor[] }) => {
  //   const availability = useMemo(() => {
  //     const total = results.length;
  //     if (total === 0) return 0;

  //     const healthyCount = results.filter(
  //       (r) => r.CurrentHealthCheck === "Healthy"
  //     ).length;

  //     const availability = (healthyCount / total) * 100;
  //     return Math.round(availability * 100) / 100;
  //   }, [results]);

  //   return <span>{availability}%</span>;
  // };

  if (isLoading) {
    return (
      <div className="h-[calc(100dvh-150px)] w-full flex justify-center items-center">
        <LoadingEventUI />
      </div>
    );
  }

  if (error || !data) {
    return <p>Error loading data</p>;
  }

  return (
    <div className="p-2 space-y-3">
      ServiceTracker
      {(data ?? []).length > 0 ? (
        data.map((svc, i) => (
          <Card key={i + 1}>
            <div className="px-6 py-2">
              <CardHeader className="px-0 flex items-center justify-between">
                <CardTitle className="font-semibold">
                  {svc.at(i)?.ServiceName}
                </CardTitle>

                <span
                  tabIndex={-1}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm text-foreground ring-1 ring-inset ring-ring dark:text-dark-content-emphasis dark:ring-secondary-foreground"
                >
                  <span className="-ml-0.5 size-2 rounded-full bg-emerald-500" />
                  Operational
                </span>
              </CardHeader>

              <div className="mt-1 w-full flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2Icon
                    className="size-5 shrink-0 rounded-full text-emerald-500"
                    aria-hidden={true}
                  />
                  <p className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                    {svc.at(i)?.IPAddress}
                  </p>
                </div>
                <p className="text-card-foreground text-sm font-medium">
                  {AvailabilityCounter(svc as unknown as BaseMonitor[])}% uptime
                </p>
              </div>
            </div>

            <CardContent>
              <Tracker
                data={(svc ?? []).map((item, _) => ({
                  key: _.toString(),
                  tooltip: `${(item.CurrentHealthCheck ?? "").toUpperCase()} ${StatusEmoji(
                    item.CurrentHealthCheck
                  )}`,
                  color: TremorColor(item.CurrentHealthCheck),
                  entity: item.IPAddress,
                }))}
                className="mt-1 flex w-full text-xl text-indigo-600 font-semibold gap-0.5 rounded"
                // hoverEffect={true}
              />
            </CardContent>
          </Card>
        ))
      ) : (
        <></>
      )}
    </div>
  );
};

export default ServiceTracker;
