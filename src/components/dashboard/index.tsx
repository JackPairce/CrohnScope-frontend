//
import Image from "next/image";
import "./styles.scss";

export function MetricItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="">{label}</span>
      <span className="font-semibold text-gray-400">{value}</span>
    </div>
  );
}

export function HealthStatus({
  cpuUsage,
  memoryUsage,
  diskUsage,
  networkLatency,
}: {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
}) {
  return (
    <div className="dashboard-card">
      <Image
        src="/svgs/chart.svg"
        alt="System Health"
        width={48}
        height={48}
        className="dashboard-illustration"
      />
      <h3 className="text-lg font-semibold mb-4 text-center">System Health</h3>
      <div className="space-y-4">
        <MetricItem label="CPU Usage" value={`${cpuUsage}%`} />
        <MetricItem label="Memory Usage" value={`${memoryUsage}%`} />
        <MetricItem label="Disk Usage" value={`${diskUsage}%`} />
        <MetricItem label="Network Latency" value={`${networkLatency}ms`} />
      </div>
    </div>
  );
}

export function AnalyticsCard({
  processedImages,
  activeJobs,
  queuedTasks,
  lastProcessingTime,
}: {
  processedImages: number;
  activeJobs: number;
  queuedTasks: number;
  lastProcessingTime: number;
}) {
  return (
    <div className="dashboard-card">
      <Image
        src="/svgs/dataset.svg"
        alt="Analytics Overview"
        width={48}
        height={48}
        className="dashboard-illustration"
      />
      <h3 className="text-lg font-semibold mb-4 text-center">
        Analytics Overview
      </h3>
      <div className="space-y-4">
        <MetricItem label="Processed Images" value={processedImages} />
        <MetricItem label="Active Jobs" value={activeJobs} />
        <MetricItem label="Queued Tasks" value={queuedTasks} />
        <MetricItem
          label="Avg. Processing Time"
          value={`${lastProcessingTime}s`}
        />
      </div>
    </div>
  );
}

export function SystemCard({
  uptime,
  version,
  lastUpdate,
  operatingSystem,
}: {
  uptime: number;
  version: string;
  lastUpdate: Date;
  operatingSystem: string;
}) {
  // Format uptime as hours:minutes:seconds
  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };
  return (
    <div className="dashboard-card">
      <Image
        src="/svgs/info.svg"
        alt="System Information"
        width={48}
        height={48}
        className="dashboard-illustration"
      />
      <h3 className="text-lg font-semibold mb-4 text-center">
        System Information
      </h3>
      <div className="space-y-4">
        <MetricItem label="Uptime" value={formatUptime(uptime)} />
        <MetricItem label="Version" value={version} />
        <MetricItem
          label="Last Update"
          value={(() => {
            const diff = Date.now() - lastUpdate.getTime();
            if (diff < 1000) return "now";
            const seconds = Math.floor(diff / 1000);
            if (seconds < 60) return `${seconds}s ago`;
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `${minutes}m ago`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours}h ago`;
            const days = Math.floor(hours / 24);
            return `${days}d ago`;
          })()}
        />{" "}
        <MetricItem label="OS" value={operatingSystem} />
      </div>
    </div>
  );
}
//
