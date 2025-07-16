import axios from "axios";

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

export default axiosInstance;
