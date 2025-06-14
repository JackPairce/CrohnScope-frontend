"use client";
import {
  AnnotationProvider,
  useAnnotationContext,
} from "@/contexts/AnnotationContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import EmptyStatePage from "./EmptyStatePage";
import ImagesNav from "./ImagesNav";
import "./styles.scss";
import { process_type } from "@/lib/api";

const ClassificationCanvas = dynamic(() => import("./ClassificationCanvas"), {
  ssr: false,
});
const MaskDrawingCanvas = dynamic(() => import("./MaskDrawingCanvas"), {
  ssr: false,
});

interface Props {
  areaType: process_type;
}

export default function AnnotationCanvas({ areaType }: Props) {
  const queryClient = new QueryClient();

  return (
    <AnnotationProvider>
      <div className="workspace-container">
        <ImagesNav which={areaType} />
        <section className="workspace-content">
          <QueryClientProvider client={queryClient}>
            <AnnotationContent areaType={areaType} />
          </QueryClientProvider>
        </section>
      </div>
    </AnnotationProvider>
  );
}

function AnnotationContent({ areaType }: Props) {
  const { currentImage } = useAnnotationContext();

  return currentImage ? (
    <>
      {areaType === "segmentation" ? (
        <MaskDrawingCanvas image={currentImage} />
      ) : (
        <ClassificationCanvas image={currentImage} />
      )}
    </>
  ) : (
    <EmptyStatePage />
  );
}
