"use client";

import AnnotationCanvas from "@/components/AnnotationCanvas";
import Loader from "@/components/loader";
import { useEffect, useState } from "react";

export default function SegmentationContent() {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate loading the canvas data
    const initializeCanvas = async () => {
      try {
        // This would normally be fetching canvas configuration data or settings
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to initialize segmentation canvas")
        );
        setIsLoading(false);
      }
    };

    initializeCanvas();
  }, []);

  // Handle any errors by throwing them to be caught by the error boundary
  if (error) {
    throw error;
  }

  if (isLoading) {
    return <Loader message="Loading segmentation canvas..." />;
  }

  return <AnnotationCanvas />;
}
