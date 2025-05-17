import ClassifficationCanvas from "@/components/AnnotationCanvas/ClasssificationCanvas";
import Header from "@/components/Header";

export const metadata = {
  title: "Cell Lableling Canvas",
  description: "Cell Labeling Canvas for CrohnScope",
};

const CellLabelingCanvas = async () => {
  return (
    <>
      <Header title={metadata.title} />
      <ClassifficationCanvas />
    </>
  );
};

export default CellLabelingCanvas;
