import AnnotationCanvas from "@/components/AnnotationCanvas";
import DrawCanvas from "@/components/AnnotationCanvas/MaskDrawingCanvas";

export const metadata = {
  title: "Segmentation Canvas",
  description: "Segmentation Canvas for CrohnScope",
};

const SegmentationCanvas = async () => {
  return (
    <>
      <AnnotationCanvas>
        <DrawCanvas />
      </AnnotationCanvas>
    </>
  );
};

export default SegmentationCanvas;
