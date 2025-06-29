//
import {
  DataUsageResponse,
  getDataUsage,
  getImageStatus,
  getSystemInfo,
  getSystemMetrics,
  ImageStatus,
  SystemMetrics,
  SystemResponse,
} from "@/lib/api";
import { useEffect, useState } from "react";

// Constants
const METRICS_INTERVAL = 1000; // 1 second
const MONITORING_INTERVAL = 60000; // 1 minute
const CONNECTION_TIMEOUT = 3000; // 3 seconds

type ConnectionStatus = "connected" | "connecting" | "disconnected";

type MonitoringData = {
  imageStatus: ImageStatus | null;
  systemInfo: SystemResponse | null;
  dataUsage: DataUsageResponse | null;
  metrics: SystemMetrics | null;
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
  error: Error | null;
  lastUpdate: Date;
};

export function useMonitoringData(): MonitoringData {
  const [data, setData] = useState<MonitoringData>({
    imageStatus: null,
    systemInfo: null,
    dataUsage: null,
    metrics: null,
    connectionStatus: "connecting",
    isLoading: true,
    error: null,
    lastUpdate: new Date(),
  });

  // Handle real-time metrics
  useEffect(() => {
    let metricsTimer: NodeJS.Timeout;
    let connectionTimer: NodeJS.Timeout;
    async function fetchMetrics() {
      try {
        // Start connection timer
        connectionTimer = setTimeout(() => {
          setData((prev) => ({
            ...prev,
            connectionStatus: "disconnected",
          }));
        }, CONNECTION_TIMEOUT);

        const metrics = await getSystemMetrics();

        // Clear connection timer as we got a response
        clearTimeout(connectionTimer);

        setData((prev) => ({
          ...prev,
          metrics,
          connectionStatus: "connected",
          lastUpdate: new Date(),
          error: null,
        }));
      } catch (error) {
        clearTimeout(connectionTimer);
        setData((prev) => ({
          ...prev,
          connectionStatus: "disconnected",
          error:
            error instanceof Error
              ? error
              : new Error("Failed to fetch metrics"),
        }));
      }
    }

    // Initial fetch
    fetchMetrics();

    // Set up interval for metrics
    metricsTimer = setInterval(fetchMetrics, METRICS_INTERVAL);

    return () => {
      clearInterval(metricsTimer);
      clearTimeout(connectionTimer);
    };
  }, []);

  // Handle regular monitoring data
  useEffect(() => {
    async function fetchMonitoringData() {
      try {
        const [imageStatus, systemInfo, dataUsage] = await Promise.all([
          getImageStatus(),
          getSystemInfo(),
          getDataUsage(),
        ]);

        setData((prev) => ({
          ...prev,
          imageStatus,
          systemInfo,
          dataUsage,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        setData((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error
              ? error
              : new Error("Failed to fetch monitoring data"),
        }));
      }
    }

    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, MONITORING_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return data;
}
