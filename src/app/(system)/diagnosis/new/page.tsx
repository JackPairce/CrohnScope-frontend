// Generated by Copilot
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";
import DiagnosisContent from "./DiagnosisContent";

export default function NewDiagnosisPage() {
  return (
    <ErrorBoundaryWrapper appName="CrohnScope Diagnosis" showHelpLink={true}>
      <DiagnosisContent />
    </ErrorBoundaryWrapper>
  );
}
