import AnnotationCanvas from "@/components/AnnotationCanvas";
import DrawCanvas from "@/components/AnnotationCanvas/MaskDrawingCanvas";

export const metadata = {
  title: "Segmentation Canvas",
  description: "Segmentation Canvas for CrohnScope",
};

const SegmentationCanvas = async () => {
  // simulate a slow network request
  // await new Promise((resolve) => setTimeout(resolve, 10000));
  return (
    <>
      <AnnotationCanvas>
        {/* @ts-ignore */}
        <DrawCanvas />
      </AnnotationCanvas>
    </>
  );
};

export default SegmentationCanvas;
