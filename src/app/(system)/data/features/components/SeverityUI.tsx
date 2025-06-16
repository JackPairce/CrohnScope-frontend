import React from "react";

interface SeverityUIProps {
  current: number;
  max: number;
  width?: string | number;
  height?: string | number;
  className?: string;
}

const SeverityUI: React.FC<SeverityUIProps> = ({
  current,
  max,
  width = "100%",
  height = "20px",
  className = "",
}) => {
  // Ensure current is within bounds
  const normalizedCurrent = Math.min(Math.max(current, 0), max);

  // Always show at least 10% of the bar for visibility
  const percentage =
    normalizedCurrent === 0
      ? 10
      : Math.max(10, (normalizedCurrent / max) * 100);

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        backgroundColor: "var(--card-bg)",
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(to right, #4caf50, #ffeb3b, #f44336)",
          borderRadius: "4px",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: `${100 - percentage}%`,
          height: "100%",
          backgroundColor: "var(--card-bg)",
          transition: "width 0.3s ease",
        }}
      />
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <span className="px-2 py-0.5 bg-gray-800 bg-opacity-40 rounded-full text-white text-xs font-semibold">
          {normalizedCurrent}
        </span>
      </div>
    </div>
  );
};

export default SeverityUI;
