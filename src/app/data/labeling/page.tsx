import AnnotationCanvas from "@/components/AnnotationCanvas";
import ClassifficationCanvas from "@/components/AnnotationCanvas/ClassificationCanvas";

export const metadata = {
  title: "Cell Lableling Canvas",
  description: "Cell Labeling Canvas for CrohnScope",
};

const CellLabelingCanvas = async () => {
  return (
    <>
      <AnnotationCanvas>
        {/* @ts-ignore */}
        <ClassifficationCanvas />
      </AnnotationCanvas>
    </>
  );
};

export default CellLabelingCanvas;
