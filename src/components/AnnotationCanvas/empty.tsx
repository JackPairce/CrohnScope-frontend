"use client";
import { useData } from "@/components/AnnotationCanvas/DataContext";
import Loader from "@/components/loader";
import EmptyStatePage from "../EmptyStatePage";

export default function EmptyState() {
  const { isLoading, setIsLoading } = useData();
  if (isLoading) return <Loader className="h-screen" />;

  return <EmptyStatePage />;
}
