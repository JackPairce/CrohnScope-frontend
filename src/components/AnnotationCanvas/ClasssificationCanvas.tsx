"use client";
import { useEffect, useRef, useState } from "react";
import { useData } from "./DataContext";
import RenderTabNavigation from "./RenderTabNavigation";
import { ApiImage } from "./api";
import { Tab } from "./types";

export default function ClassifficationCanvas({ image }: { image: ApiImage }) {
  const { img, isLoading, setIsLoading } = useData();
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const healthyRef = useRef<HTMLCanvasElement>(null);
  const unhealthyRef = useRef<HTMLCanvasElement>(null);
  const coordinatesRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // get masks and set tabs
  }, [image]);
  return (
    <>
      <RenderTabNavigation
        tabs={tabs}
        selectedTab={0}
        setSelectedTab={() => {}}
        setTabs={setTabs}
        overlayRef={coordinatesRef}
      />
      <div className="canvas-container">
        <img
          src={image.src}
          alt={image.filename}
          style={{ position: "absolute", zIndex: 1 }}
        />
        <canvas ref={healthyRef} />
        <canvas ref={unhealthyRef} />
        <canvas ref={coordinatesRef} />
      </div>
    </>
  );
}
