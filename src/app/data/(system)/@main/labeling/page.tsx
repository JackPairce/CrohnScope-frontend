import EmptyState from "@/components/AnnotationCanvas/empty";

export const metadata = {
  title: "Cell Lableling Canvas",
  description: "Cell Labeling Canvas for CrohnScope",
};

const CellLabelingCanvas = async () => {
  return (
    <>
      <header>{metadata.title}</header>

      <EmptyState />
    </>
  );
};

export default CellLabelingCanvas;
