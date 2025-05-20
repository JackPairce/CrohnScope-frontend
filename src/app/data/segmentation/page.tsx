import AnnotationCanvas from "@/components/AnnotationCanvas";
import Header from "@/components/AnnotationCanvas/Header";
import DrawCanvas from "@/components/AnnotationCanvas/MaskDrawingCanvas";

export const metadata = {
  title: "Segmentation Canvas",
  description: "Segmentation Canvas for CrohnScope",
};

const SegmentationCanvas = async () => {
  return (
    <>
      <AnnotationCanvas>
        <Header title={metadata.title} />
        <DrawCanvas />
      </AnnotationCanvas>
    </>
  );
};

export default SegmentationCanvas;
