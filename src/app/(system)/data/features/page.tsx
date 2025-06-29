//
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";
import FeaturesContent from "./FeaturesContent";

export const metadata = {
  title: "Feature Management",
  description:
    "View, create, update, and delete feature data for medical imaging",
};

export default function FeaturesPage() {
  return (
    <ErrorBoundaryWrapper
      appName="HistoScope Feature Management"
      showHelpLink={true}
    >
      <FeaturesContent />
    </ErrorBoundaryWrapper>
  );
}
