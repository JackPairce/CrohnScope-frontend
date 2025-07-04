"use client";
//

import {
  AnalyticsCard,
  HealthStatus,
  SystemCard,
} from "@/components/dashboard";
import Loader from "@/components/loader";
import { components } from "@/lib/api/types";
import { useEffect, useState } from "react";
import { useMonitoringData } from "./useMonitoringData";

type ConnectionStatusType = "connected" | "connecting" | "disconnected";
// Use explicit types from API definition
type SystemMetrics = components["schemas"]["SystemMetrics"];

// RealTimeMetrics component for displaying real-time system information
function RealTimeMetrics({
  metrics,
  stale,
}: {
  metrics: SystemMetrics | null;
  stale: boolean;
}) {
  if (!metrics) return null;

  // Helper function to get status color
  const getStatusColor = (
    value: number,
    thresholds: { warning: number; critical: number }
  ) => {
    if (value >= thresholds.critical) return "text-red-400";
    if (value >= thresholds.warning) return "text-yellow-400";
    return "text-green-400";
  };

  // Helper function to format value with unit
  const formatValue = (value: string | number, unit: string) => {
    return `${value}${unit}`;
  };

  const cpuUsage = parseFloat(metrics.cpu.total_usage);
  const memoryUsage = parseFloat(metrics.memory.percentage);

  return (
    <div
      className={`dashboard-card transition-opacity duration-300 ${
        stale ? "opacity-50" : ""
      }`}
      style={{ marginBottom: "1.5rem", borderBottom: "none" }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* You can add illustrations or metrics here as needed, using the dashboard-illustration class for icons */}
          {/* ...existing RealTimeMetrics content... */}
        </div>
      </div>
    </div>
  );
}

function ConnectionStatus({
  status,
  timeAgo,
}: {
  status: ConnectionStatusType;
  timeAgo: string;
}) {
  const statusData = {
    connected: {
      color: "text-green-400",
      bg: "bg-green-400",
      text: "Connected",
    },
    connecting: {
      color: "text-yellow-400",
      bg: "bg-yellow-400",
      text: "Connecting...",
    },
    disconnected: {
      color: "text-red-400",
      bg: "bg-red-400",
      text: "Disconnected",
    },
  };

  const currentStatus = statusData[status];

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${currentStatus.bg}`}></div>
      <span className={currentStatus.color}>{currentStatus.text}</span>
      {status === "connected" && (
        <span className="text-gray-500">• Updated {timeAgo}</span>
      )}
    </div>
  );
}

export default function DashboardContent() {
  // Only destructure what we use

  const {
    metrics,
    connectionStatus,
    isLoading,
    error,
    lastUpdate,
    systemInfo,
  } = useMonitoringData();

  const [timeAgo, setTimeAgo] = useState("just now");
  const [isStale, setIsStale] = useState(false);
  const [dashboardError, setDashboardError] = useState<Error | null>(null);

  // Update the "time ago" display and stale status
  useEffect(() => {
    function updateTimeAgo() {
      const now = new Date();
      const diff = now.getTime() - lastUpdate.getTime();

      // Mark data as stale if it's more than 5 seconds old
      setIsStale(diff > 5000);

      // Update time ago text
      if (diff < 5000) {
        setTimeAgo("just now");
      } else if (diff < 60000) {
        setTimeAgo(`${Math.round(diff / 1000)}s ago`);
      } else if (diff < 3600000) {
        setTimeAgo(`${Math.round(diff / 60000)}m ago`);
      } else {
        setTimeAgo(`${Math.round(diff / 3600000)}h ago`);
      }
    }

    const timer = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(timer);
  }, [lastUpdate]);

  // Check for API errors
  useEffect(() => {
    if (error) {
      // Enhanced error with connectivity context
      if (connectionStatus === "disconnected") {
        const errorWithContext = new Error(
          "Connection to the dashboard service was lost. The server might be unavailable."
        );
        errorWithContext.name = "ConnectionError";
        setDashboardError(errorWithContext);
      } else {
        // Use the original error
        setDashboardError(error);
      }
    }
  }, [error, connectionStatus]);

  // Add timeout detection
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (isLoading) {
      timeoutId = setTimeout(() => {
        const timeoutError = new Error(
          "Request timed out while loading dashboard data. The server may be unavailable."
        );
        timeoutError.name = "DashboardLoadingTimeout";
        setDashboardError(timeoutError);
      }, 45000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading]);

  // Throw any errors to be caught by the error boundary
  if (dashboardError) {
    throw dashboardError;
  }

  // Show loading state while data is being fetched
  if (isLoading) {
    return <Loader message="Loading dashboard data..." />;
  }

  // Fallback for missing metrics

  const safeMetrics = {
    cpu: { total_usage: metrics?.cpu?.total_usage || "0" },
    memory: { percentage: metrics?.memory?.percentage || "0" },
    disk: { usage_percentage: 0 },
    network: { latency: 0 },
    analytics: {
      processed_images: 0,
      active_jobs: 0,
      queued_tasks: 0,
      avg_processing_time: 0,
    },
    system: {
      uptime: 0,
      version: "N/A",
      os: "N/A",
    },
    recent_activities: [],
  };

  return (
    <div className="dashboard-root">
      <div className="dashboard-main">
        {/* Connection status */}
        <div className="dashboard-status">
          <ConnectionStatus status={connectionStatus} timeAgo={timeAgo} />
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* System Health Status */}
          <HealthStatus
            cpuUsage={parseFloat(metrics?.cpu?.total_usage || "0")}
            memoryUsage={parseFloat(metrics?.memory?.percentage || "0")}
            diskUsage={parseFloat(systemInfo?.disk?.percentage || "0")}
            networkLatency={
              Date.now() - new Date(metrics?.timestamp || 0).getTime()
            }
          />

          {/* Analytics Overview */}
          <AnalyticsCard
            processedImages={safeMetrics.analytics.processed_images}
            activeJobs={safeMetrics.analytics.active_jobs}
            queuedTasks={safeMetrics.analytics.queued_tasks}
            lastProcessingTime={safeMetrics.analytics.avg_processing_time}
          />

          {/* System Information */}
          <SystemCard
            uptime={safeMetrics.system.uptime}
            version={safeMetrics.system.version}
            lastUpdate={lastUpdate}
            operatingSystem={safeMetrics.system.os}
          />
        </div>

        {/* Recent Activity Feed */}
        <div className="dashboard-activity">
          <h2 className="dashboard-activity-title">Recent Activity</h2>
          {safeMetrics.recent_activities &&
          safeMetrics.recent_activities.length > 0 ? (
            <div className="dashboard-activity-list">
              {safeMetrics.recent_activities.map(
                (activity: any, index: number) => (
                  <div
                    key={activity.id || index}
                    className="dashboard-activity-item"
                  >
                    <div className="dashboard-activity-meta">
                      <span className="dashboard-activity-type">
                        {activity.type}
                      </span>
                      <span className="dashboard-activity-desc">
                        {activity.description}
                      </span>
                    </div>
                    <span className="dashboard-activity-time">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="dashboard-activity-empty">
              No recent activity to display
            </p>
          )}
        </div>
      </div>
    </div>
  );
} //
