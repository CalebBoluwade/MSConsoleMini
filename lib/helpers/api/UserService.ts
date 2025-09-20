import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../axiosInstance";

export const UsersAPI = createApi({
  reducerPath: "User",
  baseQuery: axiosBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL + "/v1/users",
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    users: builder.query<
      Array<User>,
      {
        page: number;
        pageSize: number;
      }
    >({
      query: ({page, pageSize}) => ({
        url: `?page=${page}&pageSize=${pageSize}`,
        method: "GET",
      }),
      // invalidatesTags: ["User"],
    }),

    allUsers: builder.query<
      Array<User>,
      {
        page: number;
        pageSize: number;
      }
    >({
      query: ({page, pageSize}) => ({
        url: `/all?page=${page}&pageSize=${pageSize}`,
        method: "GET",
      }),
      // invalidatesTags: ["User"],
    }),
  }),
});

export const { useUsersQuery, useAllUsersQuery } = UsersAPI;
