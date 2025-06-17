"use client";
import type { DataType } from "./types";

interface DataHeaderProps {
  type: DataType;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddNew: () => void;
}

export default function DataHeader({
  type,
  searchQuery,
  onSearchChange,
  onAddNew,
}: DataHeaderProps) {
  const title = type === "feature" ? "Features" : "Diseases";
  const description =
    type === "feature"
      ? "Manage your features for image analysis and classification."
      : "Manage diseases and their associated characteristics for diagnosis.";

  const iconMap = {
    feature: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.67 18.95L7.6 15.64C8.39 15.11 9.53 15.17 10.24 15.78L10.57 16.07C11.35 16.74 12.61 16.74 13.39 16.07L17.55 12.5C18.33 11.83 19.59 11.83 20.37 12.5L22 13.9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    disease: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8.5 19H8C4 19 2 18 2 13V8C2 4 4 2 8 2H16C20 2 22 4 22 8V13C22 17 20 19 16 19H15.5C15.19 19 14.89 19.15 14.7 19.4L13.2 21.4C12.54 22.28 11.46 22.28 10.8 21.4L9.3 19.4C9.14 19.18 8.77 19 8.5 19Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.9965 11H16.0054"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.9955 11H12.0045"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.99451 11H8.00349"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
        <div className="flex items-start">
          <div
            className="p-3 rounded-xl mr-4 flex-shrink-0"
            style={{
              background: "var(--color-accent-subtle)",
              color: "var(--color-accent-fg)",
            }}
          >
            {iconMap[type]}
          </div>
          <div>
            <h1
              className="text-2xl font-bold leading-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              {title}
            </h1>
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddNew}
          className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium shadow-sm transition-all duration-150 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto self-start"
          style={{
            background: "var(--color-button-primary-bg)",
            color: "var(--color-button-primary-text)",
            borderColor: "var(--color-button-primary-border)",
            boxShadow: "var(--shadow-button)",
          }}
        >
          <svg
            className="w-5 h-5 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 8V16M8 12H16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Add {type}
        </button>
      </div>

      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="h-5 w-5"
            style={{ color: "var(--color-icon-secondary)" }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full rounded-lg pl-10 pr-3 py-3 text-sm transition-all duration-150 focus:ring-2 focus:ring-offset-1 border"
          style={{
            background: "var(--color-input-bg)",
            color: "var(--color-input-text)",
            borderColor: "var(--color-input-border)",
            boxShadow: "var(--shadow-input)",
          }}
          placeholder={`Search ${type}s...`}
        />
      </div>
    </div>
  );
}
