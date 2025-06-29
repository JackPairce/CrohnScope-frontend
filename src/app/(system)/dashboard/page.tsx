"use client";
//

import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";
import DashboardContent from "./DashboardContent";
import "./styles.scss";

export default function Page() {
  return (
    <ErrorBoundaryWrapper appName="HistoScope Dashboard">
      <DashboardContent />
    </ErrorBoundaryWrapper>
  );
}
