import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";
import ImagesContent from "./ImagesContent";

export default function ImageLibraryPage() {
  return (
    <ErrorBoundaryWrapper
      appName="HistoScope - Histology Library"
      showHelpLink={true}
    >
      <ImagesContent />
    </ErrorBoundaryWrapper>
  );
}
