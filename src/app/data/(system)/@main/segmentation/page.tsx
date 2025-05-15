import DrawCanvas from "@/components/AnnotationCanvas/MaskDrawingCanvas";

export const metadata = {
  title: "Segmentation Canvas",
  description: "Segmentation Canvas for CrohnScope",
};

const SegmentationCanvas = async () => {
  return (
    <>
      <header>{metadata.title}</header>
      <DrawCanvas />
    </>
  );
};

export default SegmentationCanvas;
