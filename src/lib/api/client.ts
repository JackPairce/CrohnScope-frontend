import axios, { AxiosInstance, AxiosRequestHeaders } from "axios";
import { redirect } from "next/navigation";
import { authCookies } from "../utils/cookies";

/**
 * Base API client for making HTTP requests
 */
const API_URL = "/backend";

/**
 * Create and configure the axios client
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor for adding auth token or handling requests
 */
apiClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      // get token from cookies using the cookie utility
      const token = authCookies.getToken();
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token || ""}`,
      } as AxiosRequestHeaders;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor for handling errors globally
 */
//
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling if needed
    console.error("API Error:", error);

    // Redirect to login page if unauthorized (401)
    if (error.response && error.response.status === 401) {
      // clear auth cookies
      authCookies.clearToken();
      // Redirect to auth page
      redirect("/auth");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
