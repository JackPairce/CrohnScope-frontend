"use client";
import {
  AnnotationProvider,
  useAnnotationContext,
} from "@/contexts/AnnotationContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EmptyStatePage from "./EmptyStatePage";
import ImagesNav from "./ImagesNav";
import "./styles.scss";
import BaseCanvas from "./BaseCanvas";

export default function AnnotationCanvas() {
  const queryClient = new QueryClient();

  return (
    <AnnotationProvider>
      <div className="workspace-container">
        <ImagesNav />
        <section className="workspace-content">
          <QueryClientProvider client={queryClient}>
            <AnnotationContent />
          </QueryClientProvider>
        </section>
      </div>
    </AnnotationProvider>
  );
}

function AnnotationContent() {
  const {
    states: { currentImage },
  } = useAnnotationContext();

  return currentImage ? <BaseCanvas /> : <EmptyStatePage />;
}
