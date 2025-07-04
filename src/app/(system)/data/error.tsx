"use client";
//

import ErrorDisplay from "@/components/ErrorDisplay";
import { useEffect } from "react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Data page error:", error);
  }, [error]);

  return (
    <ErrorDisplay
      error={error}
      onRetry={reset}
      showHelpLink={true}
      appName="HistoScope - Data"
    />
  );
}
