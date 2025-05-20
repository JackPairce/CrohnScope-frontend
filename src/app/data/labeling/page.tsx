import AnnotationCanvas from "@/components/AnnotationCanvas";
import ClassifficationCanvas from "@/components/AnnotationCanvas/ClasssificationCanvas";

export const metadata = {
  title: "Cell Lableling Canvas",
  description: "Cell Labeling Canvas for CrohnScope",
};

const CellLabelingCanvas = async () => {
  return (
    <>
      <AnnotationCanvas>
        <ClassifficationCanvas />
      </AnnotationCanvas>
    </>
  );
};

export default CellLabelingCanvas;
