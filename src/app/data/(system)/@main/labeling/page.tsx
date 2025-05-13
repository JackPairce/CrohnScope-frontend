import EmptyState from "../../empty";

export const metadata = {
  title: "Cell Lableling Canvas",
  description: "Cell Labeling Canvas for CrohnScope",
};

const CellLabelingCanvas = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) => {
  return (
    <>
      <header>{metadata.title}</header>

      {searchParams.id ? <div>Cell Labeling Canvas</div> : <EmptyState />}
    </>
  );
};

export default CellLabelingCanvas;
