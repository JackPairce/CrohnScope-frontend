//
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";
import SegmentationContent from "./SegmentationContent";

export const metadata = {
  title: "Segmentation Canvas",
  description: "Segmentation Canvas for HistoScope",
};

export default function SegmentationCanvas() {
  return (
    <ErrorBoundaryWrapper
      appName="HistoScope - Segmentation"
      showHelpLink={true}
    >
      <SegmentationContent />
    </ErrorBoundaryWrapper>
  );
}
