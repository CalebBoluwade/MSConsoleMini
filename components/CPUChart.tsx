"use client";

import React, { useState } from "react";
import { AreaChart, CustomTooltipProps } from "@tremor/react";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Card, CardContent } from "@/components/ui/card";
import LoadingEventUI from "./LoadingUI";
import { useSystemDataQuery } from "@/lib/helpers/api/RemoteService";

const SystemChart = ({
  AgentId = "A001",
  Entity = "server",
}: {
  AgentId: string | null;
  Entity?: string;
  // onClickMore: () => void;
}) => {
  const [currentTs] = useState(Date.now());
  const chartConfig = {
    system: {
      label: "System Metrics",
    },
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    },
    mobile: {
      label: "Mobile",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const {
    data: sysinfo,
    isLoading: SysDataLoading,
    isError: SysDataError,
  } = useSystemDataQuery(
    {
      AgentId,
      Entity,
      startPeriod: 1708818569124,
      endPeriod: currentTs,
    },
    {
      pollingInterval: 5 * 60 * 1000,
      refetchOnMountOrArgChange: true,
    }
  );

  const dataFormatter = (value: number) => `${value}%`;

  let content;

  if ((sysinfo ?? []).length) {
    content = (
      <div className="relative h-64">
        {SysDataLoading || SysDataError ? <LoadingEventUI /> : <></>}
      </div>
    );
  }

  const customTooltip = (props: CustomTooltipProps) => {
    const { payload, active } = props;
    if (!active || !payload) return null;

    return (
      <div className="w-56 rounded-tremor-default border border-tremor-border bg-tremor-background p-2 text-tremor-default shadow-tremor-dropdown">
        {payload.map((category, idx: number) => (
          <div key={idx + 1} className="flex flex-1 space-x-2.5">
            <div
              className={`flex w-1 flex-col bg-${category.color}-500 rounded`}
            />
            <div className="space-y-1">
              <p className="text-tremor-content">
                {String(category.dataKey).includes("cpu") ? "CPU" : "Memory"}
              </p>
              <p className="font-medium text-tremor-content-emphasis">
                {category.value}%
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if ((sysinfo ?? []).length > 0) {
    content = (
      <Card className="my-4">
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart
              className="w-full h-96"
              data={(sysinfo! ?? [])}
              // index={["timestamp"]}
              index="timestamp"
              categories={["cpuUsage", "memoryUsage"]}
              colors={["indigo", "lime"]}
              // type="stacked"
              valueFormatter={dataFormatter}
              maxValue={100}
              // showYAxis={false}
              showLegend={false}
              enableLegendSlider
              startEndOnly={true}
              yAxisWidth={35}
              xAxisLabel="Time Period"
              yAxisLabel="Percentage Usage"
              onValueChange={(v) => console.log(v)}
              customTooltip={customTooltip}
              connectNulls={false}
            />
          </ChartContainer>
        </CardContent>

        {/* <p
          className="absolute bottom-4 right-5 font-medium text-right"
          onClick={() => onClickMore()}
        >
          View More
        </p> */}
      </Card>
    );
  }

  return content;
};

export default SystemChart;
