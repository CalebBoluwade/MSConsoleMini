import axios, { AxiosRequestConfig, AxiosError } from "axios";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  //   withCredentials: true, // optional: enable if your API uses cookies
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // log or toast error here
    console.error("API error:", error.response?.data ?? error.message);
    return Promise.reject(new Error(error));
  }
);

// Shape of query args your base query will accept
interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  headers?: AxiosRequestConfig["headers"];
}

export const axiosBaseQuery =
    ({ baseUrl }: { baseUrl?: string } = { baseUrl: "" }): BaseQueryFn<
    AxiosBaseQueryArgs,
    unknown,
    unknown
  > =>
 async ({ url, method = "GET", data, params, headers }) => {
    try {
      const result = await axios({
        url: `${baseUrl}${url}`,
        method,
        data,
        params,
        headers,
      });
      return { data: result.data };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data ?? axiosError.message,
        },
      };
    }
  };