//
"use client";

import { getSystemMetrics } from "@/lib/api";
import { useEffect, useRef, useState } from "react";

const MAX_DATA_POINTS = 30;
const UPDATE_INTERVAL = 1000; // 1 second

interface AnalyticsData {
  systemMetrics: {
    labels: string[];
    cpu: number[];
    memory: number[];
    gpu: number[];
  };
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const metricsHistory = useRef({
    labels: [] as string[],
    cpu: [] as number[],
    memory: [] as number[],
    gpu: [] as number[],
  });

  useEffect(() => {
    const initializeData = () => {
      // Create labels like "-30s", "-25s", etc.
      const initialLabels = Array.from({ length: MAX_DATA_POINTS }, (_, i) => {
        const seconds = MAX_DATA_POINTS - 1 - i;
        return seconds > 0 ? `-${seconds}s` : "now";
      });

      metricsHistory.current = {
        labels: initialLabels,
        cpu: Array(MAX_DATA_POINTS).fill(0),
        memory: Array(MAX_DATA_POINTS).fill(0),
        gpu: Array(MAX_DATA_POINTS).fill(0),
      };

      setData({
        systemMetrics: { ...metricsHistory.current },
      });
      setIsLoading(false);
    };

    async function fetchMetrics() {
      try {
        const metrics = await getSystemMetrics();

        // Shift all data points to the left
        metricsHistory.current = {
          labels: [...metricsHistory.current.labels], // Keep the same labels
          cpu: [
            ...metricsHistory.current.cpu.slice(1),
            parseFloat(metrics.cpu.total_usage),
          ],
          memory: [
            ...metricsHistory.current.memory.slice(1),
            parseFloat(metrics.memory.percentage),
          ],
          gpu: [
            ...metricsHistory.current.gpu.slice(1),
            parseFloat(metrics.gpu?.memory_allocated || "0"),
          ],
        };

        setData({
          systemMetrics: { ...metricsHistory.current },
        });
      } catch (error) {
        setError(
          error instanceof Error ? error : new Error("Failed to fetch metrics")
        );
      }
    }

    // Initialize with empty data
    initializeData();

    // Fetch initial data
    fetchMetrics();

    // Set up interval for updates
    const intervalId = setInterval(fetchMetrics, UPDATE_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  return { data, isLoading, error };
}
