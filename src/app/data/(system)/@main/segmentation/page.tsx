import DrawCanvas from "@/components/AnnotationCanvas/MaskDrawingCanvas";
import Header from "@/components/Header";

export const metadata = {
  title: "Segmentation Canvas",
  description: "Segmentation Canvas for CrohnScope",
};

const SegmentationCanvas = async () => {
  return (
    <>
      <Header title={metadata.title} />
      <DrawCanvas />
    </>
  );
};

export default SegmentationCanvas;
