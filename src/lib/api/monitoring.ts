import apiClient from "./client";
import { components } from "./types";

// Types using OpenAPI schema
export type SystemResponse = components["schemas"]["SystemResponse"];
export type DataUsageResponse = components["schemas"]["DataUsageResponse"];
export type SystemMetrics = components["schemas"]["SystemMetrics"];

/**
 * Get real-time system metrics
 * @returns Promise with system metrics data
 */
export const getSystemMetrics = async (): Promise<SystemMetrics> => {
  const response = await apiClient.get<SystemMetrics>("/monitoring/metrics");
  return response.data;
};

/**
 * Get system information
 * @returns Promise with system information
 */
export const getSystemInfo = async (): Promise<SystemResponse> => {
  const response = await apiClient.get<SystemResponse>("/monitoring/system");
  return response.data;
};

/**
 * Get data usage statistics
 * @returns Promise with data usage information
 */
export const getDataUsage = async (): Promise<DataUsageResponse> => {
  const response = await apiClient.get<DataUsageResponse>(
    "/monitoring/data-usage"
  );
  return response.data;
};
