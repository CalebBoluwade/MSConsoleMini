import { createApi } from "@reduxjs/toolkit/query/react";
import { DeployAgentRequestPayload } from "../schema/agent";
import { axiosBaseQuery } from "../axiosInstance";

export const AgentAPI = createApi({
  reducerPath: "Agent",
  baseQuery: axiosBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL + "/v1/agents",
  }),
  tagTypes: ["Agent"],
  endpoints: (builder) => ({
    createAndDeployAgent: builder.mutation<
      {
        success: boolean;
        message: string;
        output?: string;
        error?: string;
        agentId?: string;
      },
      DeployAgentRequestPayload
    >({
      query: (payload) => ({
        url: "/deploy",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Agent"],
    }),

    validateSSHConnection: builder.mutation<
      { success: boolean; message: string },
      { host: string; port: number; username: string; password: string }
    >({
      query: (payload) => ({
        url: "/validate-ssh",
        method: "POST",
        body: payload,
      }),
    }),

    getAvailableVersions: builder.query<{ versions: string[] }, void>({
      query: () => ({
        url: "/versions",
      }),
      providesTags: ["Agent"],
    }),
  }),
});

export const {
  useCreateAndDeployAgentMutation,
  useValidateSSHConnectionMutation,
  useGetAvailableVersionsQuery,
} = AgentAPI;
