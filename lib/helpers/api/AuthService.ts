import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../axiosInstance";

export const AuthAPI = createApi({
  reducerPath: "Auth",
  baseQuery: axiosBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL + "/v1/auth",
  }),
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    loginUser: builder.mutation<
      UserAuthLoginResponse,
      {
        username: string;
        password: string;
      }
    >({
      query: (payload) => ({
        url: "/AuthenticateUserAD",
        method: "POST",
        data: payload,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const { useLoginUserMutation } = AuthAPI;
