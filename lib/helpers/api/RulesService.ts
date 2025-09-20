// lib-client.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../axiosInstance";

export const RulesAPI = createApi({
  reducerPath: "Rules",
  baseQuery: axiosBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL + "/v1",
  }),
  tagTypes: ["Rules"],
  endpoints: (builder) => ({
    getAllRules: builder.query<
      APIResponse<PagedResult<MonitoringRule>>,
      RuleQueryParameters | null
    >({
      query: (params) => ({
        url: "/rules",
        params: params ?? undefined,
      }),
      providesTags: ["Rules"],
    }),
    getRule: builder.query<ApiResponse<MonitoringRule>, string>({
      query: (id) => ({ url: `/rules/${id}` }),
      providesTags: (result, error, id) => [{ type: "Rules", id }],
    }),
    createRule: builder.mutation<
      ApiResponse<MonitoringRule>,
      CreateRuleRequest
    >({
      query: (rule) => ({
        url: "/rules",
        method: "POST",
        data: rule,
        headers: {
          "Content-Type": "application/json", // Ensure proper content type
        },
      }),
      invalidatesTags: ["Rules"],
    }),
    updateRule: builder.mutation<
      ApiResponse<MonitoringRule>,
      { id: string; rule: UpdateRuleRequest }
    >({
      query: ({ id, rule }) => ({
        url: `/rules/${id}`,
        method: "PUT",
        data: rule,
        headers: {
          "Content-Type": "application/json", // Ensure proper content type
        },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Rules", id }],
    }),
    deleteRule: builder.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({
        url: `/rules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Rules"],
    }),
    getRuleConflicts: builder.query<RuleConflict[], string>({
      query: (id) => ({ url: `/rules/${id}/conflicts` }),
    }),
    checkRuleConflicts: builder.mutation<
      { conflicts: RuleConflict[] },
      { metricName: string; threshold: number; serviceId?: string; excludeRuleId?: string }
    >({
      query: (params) => ({
        url: "/rules/check-conflicts",
        method: "POST",
        data: params,
      }),
    }),
  }),
});

// Export hooks for React components
export const {
  useGetAllRulesQuery,
  useGetRuleQuery,
  useCreateRuleMutation,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
  useGetRuleConflictsQuery,
  useCheckRuleConflictsMutation,
} = RulesAPI;
