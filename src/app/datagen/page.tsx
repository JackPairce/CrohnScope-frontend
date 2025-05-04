import SegmentationCanvas from "@/components/SegmentationCanvas";

export const metadata = {
  title: "Segmentation Canvas",
  description: "Segmentation Canvas for CrohnScope",
};

const Index = () => {
  return (
    <div>
      <SegmentationCanvas />
    </div>
  );
};

export default Index;
