// filepath: d:\Vault\Coding\02_Projects\AI_Dev\HistoScope\frontend\src\app\data\images\page.tsx
//
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";
import ImagesContent from "./ImagesContent";

export default function ImageLibraryPage() {
  return (
    <ErrorBoundaryWrapper
      appName="HistoScope - Image Library"
      showHelpLink={true}
    >
      <ImagesContent />
    </ErrorBoundaryWrapper>
  );
}
