import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../axiosInstance";

export const RemoteMonitorsAPI = createApi({
  reducerPath: "Remote",
  baseQuery: axiosBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL + "/v1"
  }),
  tagTypes: ["RemoteMonitors"],
  endpoints: (builder) => ({
    diskData: builder.query<
      Array<{
        Drive: string;
        FreeSpaceFormatted: string;
        DiskSizeFormatted: string;
        FreeSpaceUnformatted: number;
        DiskSize: number;
        Used: number;
      }>,
      { AgentId: string | null }
    >({
      query: ({ AgentId }) => ({
        url: `/SystemData/disks?agent=${AgentId || "_"}`,
        method: "GET",
      }),
    }),

    SystemData: builder.query<
      Array<{
        timestamp: number;
        timestampMem: number;
        cpuUsage: number;
        memoryUsage: number;
      }>,
      {
        Entity: string;
        AgentId: string | null;
        startPeriod: number;
        endPeriod: number;
      }
    >({
      query: ({ Entity, AgentId, startPeriod, endPeriod }) => ({
        url: `/SystemData?agent=${AgentId || "_"}&Entity=${Entity}&startPeriod=${startPeriod}&endPeriod=${endPeriod}`,
        method: "GET"
      }),
    }),
  }),
});

export const { useDiskDataQuery, useSystemDataQuery } = RemoteMonitorsAPI;
