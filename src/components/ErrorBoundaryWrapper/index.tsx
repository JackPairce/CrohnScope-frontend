"use client";
//

import ErrorDisplay from "@/components/ErrorDisplay";
import { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  appName?: string;
  showHelpLink?: boolean;
  helpLinkUrl?: string;
}

/**
 * ErrorBoundaryWrapper - A component that wraps children in an error boundary
 * and renders the ErrorDisplay component when an error occurs.
 */
export default function ErrorBoundaryWrapper({
  children,
  appName = "HistoScope",
  showHelpLink = true,
  helpLinkUrl = "https://support.crohnscope.com",
}: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <ErrorDisplay
          error={error}
          onRetry={resetErrorBoundary}
          appName={appName}
          showHelpLink={showHelpLink}
          helpLinkUrl={helpLinkUrl}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
