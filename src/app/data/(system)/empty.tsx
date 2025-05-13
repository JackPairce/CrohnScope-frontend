"use client";
import { useData } from "@/components/DrawCanvas/DataContext";
import Loader from "@/components/loader";

export default function EmptyState() {
  const { isLoading, setIsLoading } = useData();
  if (isLoading) return <Loader className="h-screen" />;

  return (
    <div className="empty-state">
      <h2>Select an image</h2>
      <p>Please select an image to start segmentation.</p>
    </div>
  );
}
