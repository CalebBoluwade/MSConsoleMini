import { createApi } from "@reduxjs/toolkit/query/react";
import { ServiceEntitySchema } from "../schema/service";
import { z } from "zod";
import { axiosBaseQuery } from "../axiosInstance";

export const isProd =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_PROD_URL!
    : process.env.NEXT_PUBLIC_DEV_URL!;

export const MonitorAPI = createApi({
  reducerPath: "Monitor",
  baseQuery: axiosBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL + "/v1",
  }),
  tagTypes: ["ServiceMonitors"],
  endpoints: (builder) => ({
    getAllMonitors: builder.query<BaseMonitor[], null | void>({
      query: () => ({
        url: "/systemmonitor",
      }),
    }),

    getSingleMonitor: builder.query<BaseMonitor, string>({
      query: (id) => ({
        url: `/systemmonitor/${id}`,
      }),
    }),

    getMonitorPlugins: builder.query<MonitorPlugin[], null | void>({
      query: () => ({
        url: "/Plugins",
      }),
    }),

    // GET /v1/MonitorResults
    getMonitoringServiceTracker: builder.query<
      Pick<BaseMonitor, "ServiceName" | "IPAddress" | "CurrentHealthCheck">[][],
      null
    >({
      query: () => ({
        url: `/MonitorResults`,
      }),
    }),

    // GET /v1/MonitorResults/:id
    getMonitoringResultsById: builder.query<MonitoringResult[], string>({
      query: (id) => ({
        url: `/MonitorResults/${id}`,
      }),
    }),

    // POST /systemmonitor
    createServiceMonitor: builder.mutation<
      unknown,
      z.infer<typeof ServiceEntitySchema>
    >({
      query: (data) => ({
        url: "/systemmonitor",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ServiceMonitors"],
    }),

    // PUT /systemmonitor/:id
    updateServiceMonitor: builder.mutation<
      unknown,
      { id: string; data: z.infer<typeof ServiceEntitySchema> }
    >({
      query: ({ id, data }) => ({
        url: `/systemmonitor/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ServiceMonitors"],
    }),

    // DELETE /systemmonitor/:id
    deleteServiceMonitor: builder.mutation<void, string>({
      query: (id) => ({
        url: `/systemmonitor/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ServiceMonitors"],
    }),

    // PUT /SystemMonitor/PluginConfigEdit/:id
    updatePluginConfiguration: builder.mutation<
      void,
      { monitorId: string; configuration: object }
    >({
      query: ({ monitorId, configuration }) => ({
        url: `/SystemMonitor/PluginConfigEdit/${monitorId}`,
        method: "PUT",
        body: configuration,
      }),
      invalidatesTags: ["ServiceMonitors"],
    }),
  }),
});

export const {
  useGetAllMonitorsQuery,
  useGetSingleMonitorQuery,
  useGetMonitorPluginsQuery,
  useGetMonitoringServiceTrackerQuery,
  useGetMonitoringResultsByIdQuery,
  useCreateServiceMonitorMutation,
  useUpdateServiceMonitorMutation,
  useDeleteServiceMonitorMutation,
  useUpdatePluginConfigurationMutation,
} = MonitorAPI;
