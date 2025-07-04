//
"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  TooltipModel,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { twMerge } from "tailwind-merge";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type ChartThemeOptions = {
  type: "line" | "bar" | "doughnut";
};

// Create type-safe theme options
const getChartTheme = <T extends ChartThemeOptions>(
  options: T
): ChartOptions<typeof options.type> => ({
  responsive: true,
  maintainAspectRatio: false,
  color: "var(--foreground)",
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "var(--foreground)",
        font: {
          family: "var(--font-sans)",
          size: 12,
          weight: "normal",
        },
        usePointStyle: true,
        padding: 15,
      },
    },
    tooltip: {
      backgroundColor: "var(--card-bg)",
      titleColor: "var(--foreground)",
      bodyColor: "var(--foreground)",
      borderColor: "var(--card-border)",
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      usePointStyle: true,
      bodyFont: {
        family: "var(--font-sans)",
        size: 12,
        weight: "normal",
      },
      titleFont: {
        family: "var(--font-sans)",
        size: 13,
        weight: "bold",
      },
    },
  },
  scales:
    options.type !== "doughnut"
      ? {
          x: {
            border: {
              color: "var(--card-border)",
            },
            grid: {
              color: "var(--card-border)",
            },
            ticks: {
              color: "var(--foreground)",
              font: {
                family: "var(--font-sans)",
                size: 11,
              },
            },
            title: {
              color: "var(--foreground)",
              font: {
                family: "var(--font-sans)",
                size: 12,
                weight: "normal" as const,
              },
            },
          },
          y: {
            border: {
              color: "var(--card-border)",
            },
            grid: {
              color: "var(--card-border)",
            },
            ticks: {
              color: "var(--foreground)",
              font: {
                family: "var(--font-sans)",
                size: 11,
              },
            },
            title: {
              color: "var(--foreground)",
              font: {
                family: "var(--font-sans)",
                size: 12,
                weight: "normal",
              },
            },
          },
        }
      : undefined,
});
// Base chart theme using CSS variables
const baseChartConfig = {
  responsive: true,
  maintainAspectRatio: false,
  color: "var(--foreground)",
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        color: "var(--foreground)",
        font: {
          family: "var(--font-sans)",
          size: 12,
          weight: "normal" as const,
        },
        usePointStyle: true,
        padding: 15,
      },
    },
    tooltip: {
      backgroundColor: "var(--card-bg)",
      titleColor: "var(--foreground)",
      bodyColor: "var(--foreground)",
      borderColor: "var(--card-border)",
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      usePointStyle: true,
      bodyFont: {
        family: "var(--font-sans)",
        size: 12,
        weight: "normal" as const,
      },
      titleFont: {
        family: "var(--font-sans)",
        size: 13,
        weight: "bold" as const,
      },
    },
  },
  scales: {
    x: {
      border: {
        color: "var(--card-border)",
      },
      grid: {
        color: "var(--card-border)",
      },
      ticks: {
        color: "var(--foreground)",
        font: {
          family: "var(--font-sans)",
          size: 11,
        },
      },
      title: {
        color: "var(--foreground)",
        font: {
          family: "var(--font-sans)",
          size: 12,
          weight: "normal",
        },
      },
    },
    y: {
      border: {
        color: "var(--card-border)",
      },
      grid: {
        color: "var(--card-border)",
      },
      ticks: {
        color: "var(--foreground)",
        font: {
          family: "var(--font-sans)",
          size: 11,
        },
      },
      title: {
        color: "var(--foreground)",
        font: {
          family: "var(--font-sans)",
          size: 12,
          weight: "normal",
        },
      },
    },
  },
};

// Type-specific chart defaults
const getLineChartDefaults = (): ChartOptions<"line"> => ({
  ...baseChartConfig,
  plugins: {
    ...baseChartConfig.plugins,
    tooltip: {
      ...baseChartConfig.plugins.tooltip,
      callbacks: {
        label: function (this: TooltipModel<"line">, context) {
          const value =
            typeof context.parsed.y === "number"
              ? context.parsed.y.toFixed(1)
              : context.parsed.y;
          return ` ${context.dataset.label}: ${value}%`;
        },
      },
    },
  },
  scales: {
    x: {
      border: {
        color: "var(--card-border)",
      },
      grid: {
        color: "var(--card-border)",
      },
      ticks: {
        color: "var(--foreground)",
        font: {
          family: "var(--font-sans)",
          size: 11,
        },
      },
      title: {
        color: "var(--foreground)",
        font: {
          family: "var(--font-sans)",
          size: 12,
          weight: "normal" as const,
        },
      },
    },
    y: {
      border: {
        color: "var(--card-border)",
      },
      grid: {
        color: "var(--card-border)",
      },
      ticks: {
        color: "var(--foreground)",
        font: {
          family: "var(--font-sans)",
          size: 11,
        },
      },
      title: {
        color: "var(--foreground)",
        font: {
          family: "var(--font-sans)",
          size: 12,
          weight: "normal" as const,
        },
      },
    },
  },
});
const getBarChartDefaults = (): ChartOptions<"bar"> => ({
  ...baseChartConfig,
  plugins: {
    ...baseChartConfig.plugins,
    tooltip: {
      ...baseChartConfig.plugins.tooltip,
      callbacks: {
        label: function (this: TooltipModel<"bar">, context) {
          const value =
            typeof context.parsed.y === "number"
              ? context.parsed.y.toFixed(1)
              : context.parsed.y;
          return ` ${context.dataset.label}: ${value}`;
        },
      },
    },
  },
  scales: {
    x: {
      border: {
        color: "var(--card-border)",
      },
      grid: {
        color: "var(--card-border)",
      },
      ticks: {
        color: "var(--foreground)",
        font: {
          family: "var(--font-sans)",
          size: 11,
        },
      },
      title: {
        color: "var(--foreground)",
        font: {
          family: "var(--font-sans)",
          size: 12,
          weight: "normal" as const,
        },
      },
    },
    y: {
      border: {
        color: "var(--card-border)",
      },
      grid: {
        color: "var(--card-border)",
      },
      ticks: {
        color: "var(--foreground)",
        font: {
          family: "var(--font-sans)",
          size: 11,
        },
      },
      title: {
        color: "var(--foreground)",
        font: {
          family: "var(--font-sans)",
          size: 12,
          weight: "normal" as const,
        },
      },
    },
  },
});
const getDoughnutChartDefaults = (): ChartOptions<"doughnut"> => {
  //
  const { scales, ...configWithoutScales } = baseChartConfig;
  return {
    ...configWithoutScales,
    cutout: "65%",
    plugins: {
      ...baseChartConfig.plugins,
      tooltip: {
        ...baseChartConfig.plugins.tooltip,
        callbacks: {
          label: function (this: TooltipModel<"doughnut">, context) {
            const value = context.parsed;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return ` ${context.label}: ${percentage}%`;
          },
        },
      },
    },
  };
};

// Common chart theme using CSS variables
const getChartDefaults = (): ChartOptions<"line"> => ({
  responsive: true,
  maintainAspectRatio: false,
  color: "var(--foreground)", // Global text color
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        color: "var(--foreground)",
        font: {
          family: "var(--font-sans)",
          size: 12,
        },
        usePointStyle: true,
        padding: 15,
      },
    },
    tooltip: {
      backgroundColor: "var(--card-bg)",
      titleColor: "var(--foreground)",
      bodyColor: "var(--foreground)",
      borderColor: "var(--card-border)",
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      usePointStyle: true,
      bodyFont: {
        family: "var(--font-sans)",
        size: 12,
      },
      titleFont: {
        family: "var(--font-sans)",
        size: 13,
        weight: "bold",
      },
      callbacks: {
        label: function (this: TooltipModel<"line">, context) {
          const value =
            typeof context.parsed.y === "number"
              ? context.parsed.y.toFixed(1)
              : context.parsed.y;
          return ` ${context.dataset.label}: ${value}%`;
        },
      },
    },
  },
  scales: {
    x: {
      border: {
        color: "var(--card-border)",
      },
      grid: {
        color: "var(--card-border)",
      },
      ticks: {
        color: "var(--foreground)",
        font: {
          family: "var(--font-sans)",
          size: 11,
        },
      },
      title: {
        color: "var(--foreground)",
        font: {
          family: "var(--font-sans)",
          size: 12,
          weight: "normal",
        },
      },
    },
    y: {
      border: {
        color: "var(--card-border)",
      },
      grid: {
        color: "var(--card-border)",
      },
      ticks: {
        color: "var(--foreground)",
        font: {
          family: "var(--font-sans)",
          size: 11,
        },
      },
      title: {
        color: "var(--foreground)",
        font: {
          family: "var(--font-sans)",
          size: 12,
          weight: "normal",
        },
      },
    },
  },
});

const defaultOptions = getChartDefaults();

interface ChartCardProps {
  title: string;
  className?: string;
}

interface LineChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
}

interface LineChartProps extends ChartCardProps {
  labels: string[];
  data: number[] | LineChartDataset[];
  label?: string;
  borderColor?: string;
  backgroundColor?: string;
  options?: any;
}

interface BarChartProps extends ChartCardProps {
  labels: string[];
  data: number[];
  label: string;
  backgroundColor?: string[];
}

interface DoughnutChartProps extends ChartCardProps {
  labels: string[];
  data: number[];
  backgroundColor?: string[];
}

export function LineChart({
  title,
  labels,
  data,
  label,
  borderColor = "#3b82f6",
  backgroundColor = "#3b82f630",
  className,
  options = {},
}: LineChartProps) {
  const chartData = {
    labels,
    datasets:
      Array.isArray(data) && typeof data[0] === "object"
        ? (data as LineChartDataset[]).map((dataset) => ({
            ...dataset,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: dataset.borderColor,
            pointLabelFontColor: "#FFFFFF",
          }))
        : [
            {
              label,
              data: data as number[],
              borderColor,
              backgroundColor,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 5,
              pointBackgroundColor: borderColor,
              pointLabelFontColor: "#FFFFFF",
            },
          ],
  };

  const chartOptions: ChartOptions<"line"> = {
    ...getChartTheme({ type: "line" }),
    ...options,
  };

  return (
    <div
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--card-border)",
        color: "var(--foreground)",
      }}
      className={twMerge("p-6 rounded-lg shadow-sm border", className)}
    >
      {title && (
        <h3
          className="text-lg font-medium mb-4"
          style={{ color: "var(--foreground)" }}
        >
          {title}
        </h3>
      )}
      <div className="h-64">
        <Line options={chartOptions} data={chartData} />
      </div>
    </div>
  );
}

export function BarChart({
  title,
  labels,
  data,
  label,
  backgroundColor = ["rgba(59, 130, 246, 0.5)"],
  className,
}: BarChartProps) {
  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        backgroundColor,
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
    ...getBarChartDefaults(),
  };

  return (
    <div
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--card-border)",
        color: "var(--foreground)",
      }}
      className={twMerge("p-6 rounded-lg shadow-sm border", className)}
    >
      {title && (
        <h3
          className="text-lg font-medium mb-4"
          style={{ color: "var(--foreground)" }}
        >
          {title}
        </h3>
      )}
      <div className="h-64">
        <Bar options={chartOptions} data={chartData} />
      </div>
    </div>
  );
}

export function DoughnutChart({
  title,
  labels,
  data,
  backgroundColor = [
    "rgba(59, 130, 246, 0.8)",
    "rgba(99, 102, 241, 0.8)",
    "rgba(139, 92, 246, 0.8)",
    "rgba(168, 85, 247, 0.8)",
  ],
  className,
}: DoughnutChartProps) {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderColor: backgroundColor.map((color) => color.replace("0.8", "1")),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<"doughnut"> = {
    ...getChartTheme({ type: "doughnut" }),
    cutout: "65%",
  };

  return (
    <div
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--card-border)",
        color: "var(--foreground)",
      }}
      className={twMerge("p-6 rounded-lg shadow-sm border", className)}
    >
      {title && (
        <h3
          className="text-lg font-medium mb-4"
          style={{ color: "var(--foreground)" }}
        >
          {title}
        </h3>
      )}
      <div className="h-64">
        <Doughnut options={chartOptions} data={chartData} />
      </div>
    </div>
  );
}
