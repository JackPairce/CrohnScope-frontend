//
"use client";

import Loader from "@/components/loader";
import Image from "next/image";
import { LineChart } from "./components";
import { useAnalytics } from "./useAnalytics";

const METRICS_CONFIG = {
  cpu: {
    title: "CPU Usage",
    color: "#3b82f6", // Blue
    icon: "/svgs/cpu.svg",
  },
  memory: {
    title: "Memory Usage",
    color: "#10b981", // Green
    icon: "/svgs/ram.svg",
  },
  gpu: {
    title: "GPU Usage",
    color: "#8b5cf6", // Purple
    icon: "/svgs/gpu.svg",
  },
};

export default function AnalyticsPage() {
  const { data, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader message="Loading analytics data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--foreground)" }}
          >
            Error Loading Data
          </h2>
          <p style={{ color: "var(--text-muted)" }}>{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const metrics = [
    {
      key: "cpu",
      value: data.systemMetrics.cpu[data.systemMetrics.cpu.length - 1],
      ...METRICS_CONFIG.cpu,
    },
    {
      key: "memory",
      value: data.systemMetrics.memory[data.systemMetrics.memory.length - 1],
      ...METRICS_CONFIG.memory,
    },
    {
      key: "gpu",
      value: data.systemMetrics.gpu[data.systemMetrics.gpu.length - 1],
      ...METRICS_CONFIG.gpu,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--foreground)" }}
        >
          Analytics Dashboard
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Monitor system performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {metrics.map((metric) => (
          <div
            key={metric.key}
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--card-border)",
              color: "var(--foreground)",
            }}
            className="rounded-lg shadow-sm p-6 border"
          >
            <div className="flex items-center">
              <div
                className="rounded-lg p-3"
                style={{ backgroundColor: metric.color }}
              >
                <Image
                  src={metric.icon}
                  alt={metric.title}
                  width={24}
                  height={24}
                  className="svg-icon"
                />
              </div>
              <div className="ml-4">
                <h3
                  style={{ color: "var(--text-muted)" }}
                  className="text-sm font-medium"
                >
                  {metric.title}
                </h3>
                <p
                  style={{ color: "var(--foreground)" }}
                  className="text-2xl font-semibold"
                >
                  {metric.value.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Metrics Chart */}
      <LineChart
        title="System Resource Usage"
        labels={data.systemMetrics.labels}
        data={[
          {
            label: "CPU Usage",
            data: data.systemMetrics.cpu,
            borderColor: METRICS_CONFIG.cpu.color,
            backgroundColor: `${METRICS_CONFIG.cpu.color}20`,
          },
          {
            label: "Memory Usage",
            data: data.systemMetrics.memory,
            borderColor: METRICS_CONFIG.memory.color,
            backgroundColor: `${METRICS_CONFIG.memory.color}20`,
          },
          {
            label: "GPU Usage",
            data: data.systemMetrics.gpu,
            borderColor: METRICS_CONFIG.gpu.color,
            backgroundColor: `${METRICS_CONFIG.gpu.color}20`,
          },
        ]}
        options={{
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                color: "white",
                display: true,
                text: "Usage %",
              },
              ticks: {
                color: "white",
              },
            },
            x: {
              display: false, // Hide x-axis completely
            },
          },
          animation: {
            duration: 0, // Disable animations for smoother updates
          },
        }}
      />
    </div>
  );
}
