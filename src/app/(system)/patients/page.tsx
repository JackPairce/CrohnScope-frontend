"use client";
//

import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";
import PatientsContent from "./PatientsContent";

export default function Page() {
  return (
    <ErrorBoundaryWrapper appName="HistoScope - Patients">
      <PatientsContent />
    </ErrorBoundaryWrapper>
  );
}
