"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ApiImage } from "./api";
import { useData } from "./DataContext";
import EmptyState from "./empty";
import LayerState, { State } from "./LayerState";
import { LoadMasks } from "./MaskUtils";
import RenderTabNavigation from "./RenderTabNavigation";
import { Tab } from "./types";

export default function ClassifficationCanvas() {
  const { img } = useData();

  return (
    <QueryClientProvider client={new QueryClient()}>
      {img ? <Worspace image={img} /> : <EmptyState />}
    </QueryClientProvider>
  );
}

function Worspace({ image }: { image: ApiImage }) {
  const { img } = useData();
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [layerstate, setLaterState] = useState<State>("all");
  const healthyRef = useRef<HTMLCanvasElement>(null);
  const unhealthyRef = useRef<HTMLCanvasElement>(null);
  const coordinatesRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imgDim, setImgDim] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [selectedTab, setSelectedTab] = useState(NaN);

  useEffect(() => {
    LoadMasks(image, setIsLoading, setImgDim, setTabs, setSelectedTab);
  }, [image]);
  return (
    <>
      <LayerState stater={[layerstate, setLaterState]} />
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
        {layerstate ?? (
          <>
            {layerstate == "all" || layerstate === "healthy" ? (
              <canvas ref={healthyRef} />
            ) : (
              <></>
            )}
            {layerstate == "all" || layerstate === "unhealthy" ? (
              <canvas ref={unhealthyRef} />
            ) : (
              <></>
            )}
            {<canvas ref={coordinatesRef} />}
          </>
        )}
      </div>
    </>
  );
}
