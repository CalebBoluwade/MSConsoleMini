// lib-client.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types you already have in your codebase
// import type { 
//   MonitoringRule, 
//   CreateRuleRequest, 
//   UpdateRuleRequest, 
//   RuleQueryParameters, 
//   RuleConflict, 
//   ApiResponse, 
//   PagedResult 
// } from '@/types';

export const RulesAPI = createApi({
  reducerPath: 'Rules',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL + "/v1",
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Rules'],
  endpoints: (builder) => ({
    getAllRules: builder.query<APIResponse<PagedResult<MonitoringRule>>, RuleQueryParameters | null>({
      query: (params) => ({
        url: '/rules',
        params: params ?? undefined,
      }),
      providesTags: ['Rules'],
    }),
    getRule: builder.query<ApiResponse<MonitoringRule>, string>({
      query: (id) => `/rules/${id}`,
      providesTags: (result, error, id) => [{ type: 'Rules', id }],
    }),
    createRule: builder.mutation<ApiResponse<MonitoringRule>, CreateRuleRequest>({
      query: (rule) => ({
        url: '/rules',
        method: 'POST',
        body: rule,
      }),
      invalidatesTags: ['Rules'],
    }),
    updateRule: builder.mutation<ApiResponse<MonitoringRule>, { id: string; rule: UpdateRuleRequest }>({
      query: ({ id, rule }) => ({
        url: `/rules/${id}`,
        method: 'PUT',
        body: rule,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Rules', id }],
    }),
    deleteRule: builder.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({
        url: `/rules/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Rules'],
    }),
    getRuleConflicts: builder.query<RuleConflict[], string>({
      query: (id) => `/rules/${id}/conflicts`,
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
} = RulesAPI;
