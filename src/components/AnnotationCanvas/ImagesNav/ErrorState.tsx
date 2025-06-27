export interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
      <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
        <svg
          className="w-6 h-6 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3
        className="text-lg font-semibold"
        style={{ color: "var(--foreground)" }}
      >
        Error Loading Images
      </h3>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        {error}
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 rounded-md transition-all duration-200 space-x-2 hover:opacity-90"
        style={{
          background: "var(--button-primary)",
          color: "white",
        }}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span>Try Again</span>
      </button>
    </div>
  );
}
