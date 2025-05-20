import AnnotationCanvas from "@/components/AnnotationCanvas";
import ClassifficationCanvas from "@/components/AnnotationCanvas/ClasssificationCanvas";
import Header from "@/components/AnnotationCanvas/Header";

export const metadata = {
  title: "Cell Lableling Canvas",
  description: "Cell Labeling Canvas for CrohnScope",
};

const CellLabelingCanvas = async () => {
  return (
    <>
      <AnnotationCanvas>
        <Header title={metadata.title} />
        <ClassifficationCanvas />
      </AnnotationCanvas>
    </>
  );
};

export default CellLabelingCanvas;
