"use client";

import React, { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent } from "@/components/ui/card";
import LoadingEventUI from "./LoadingUI";
import { useSystemDataQuery } from "@/lib/helpers/api/RemoteService";
import { useLookupTime } from "@/lib/hooks/useLookupTime";

const SystemChart = ({
  AgentId = "A001",
  Entity = "server",
}: {
  AgentId: string | null;
  Entity?: string;
  // onClickMore: () => void;
}) => {
  const [currentTs] = useState(Date.now());
  const { lookupTime } = useLookupTime();

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
      startPeriod: lookupTime ?? 0,
      endPeriod: currentTs,
    },
    {
      pollingInterval: 5 * 60 * 1000,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true
    }
  );

  let content;

  if ((sysinfo ?? []).length) {
    content = (
      <div className="relative h-64">
        {SysDataLoading || SysDataError ? <LoadingEventUI /> : <></>}
      </div>
    );
  }

  if ((sysinfo ?? []).length > 0) {
    content = (
      <Card className="my-4">
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={sysinfo! ?? []}>
              <defs>
                <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-desktop)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-desktop)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-mobile)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-mobile)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                // strokeDasharray="3 3"
              />

              <XAxis
                dataKey="timestamp"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />

              <ChartTooltipContent
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
                indicator="dot"
              />

              <Area
                dataKey="cpuUsage"
                type="natural"
                fill="url(#fillMobile)"
                stroke="var(--color-mobile)"
                stackId="a"
              />

              <Area
                dataKey="desktop"
                type="natural"
                fill="url(#fillDesktop)"
                stroke="var(--color-desktop)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>

            {/* <AreaChart
              className="w-full h-[420px]"
              data={(sysinfo! ?? [])}
              // index={["timestamp"]}
              index="timestamp"
              categories={["cpuUsage", "memoryUsage"]}
              colors={["purple", "green"]}
              // type="stacked"
              valueFormatter={dataFormatter}
              maxValue={100}
              // showYAxis={false}
              showLegend={true}
              showGradient={true}
              enableLegendSlider
              startEndOnly={true}
              yAxisWidth={35}
              showAnimation={true}
              xAxisLabel="Time Period"
              yAxisLabel="Percentage Usage"
              onValueChange={(v) => console.log(v)}
              customTooltip={customTooltip}
              connectNulls={false}
            /> */}
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
