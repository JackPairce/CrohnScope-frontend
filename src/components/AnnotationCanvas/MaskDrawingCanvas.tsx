"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import Loader from "../loader";
import { ApiImage, uploadMasks } from "./api";
import { useData } from "./DataContext";
import DrawPreview from "./DrawPreview";
import EmptyState from "./empty";
import { ExtractRealMask, LoadMasks } from "./MaskUtils";
import RenderTabNavigation from "./RenderTabNavigation";
import ToolBar from "./ToolBar";
import { Mode, SaveSatues, Tab } from "./types";

export default function renderMaskDrawingCanvas() {
  const { img } = useData();
  return (
    <QueryClientProvider client={new QueryClient()}>
      {img ? <MaskDrawingCanvas image={img} /> : <EmptyState />}
    </QueryClientProvider>
  );
}

function MaskDrawingCanvas({ image }: { image: ApiImage }) {
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [mode, setMode] = useState<Mode>("draw");
  const [brushSize, setBrushSize] = useState(15);
  const [canvasSaveStatus, setCanvasSaveStatus] = useState<SaveSatues>({
    isSaving: false,
    isModified: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [imgDim, setImgDim] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [selectedTab, setSelectedTab] = useState(NaN);

  useEffect(() => {
    LoadMasks(image, setIsLoading, setImgDim, setTabs, setSelectedTab);
  }, [image]);

  const setCurrentMask = (mask: HTMLImageElement) => {
    if (selectedTab === -1) return;
    setTabs((prev) => {
      prev[selectedTab].mask = mask;
      return [...prev];
    });
  };

  const saveMasks = async () => {
    if (selectedTab === -1) return;
    setCanvasSaveStatus((prev) => ({
      ...prev,
      isSaving: true,
    }));
    await uploadMasks(
      image.id,
      await Promise.all(
        tabs.map(async (tab) => ({
          id: tab.mask_id,
          cell_id: tab.cell_id,
          src: await ExtractRealMask(tab.mask.src),
        }))
      )
    );
    setCanvasSaveStatus({
      isSaving: false,
      isModified: false,
    });
  };

  const MarkAllDone = async () => {
    if (selectedTab === -1) return;
    // TODO: Add backend API call to mark all masks as done
    setTabs((prev) => {
      return prev.map((tab) => ({
        ...tab,
        isDone: true,
      }));
    });
  };
  if (isLoading || isNaN(selectedTab) || !imgDim) return <Loader />;

  return (
    <>
      <ToolBar
        mode={mode}
        setMode={setMode}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        saveMasks={saveMasks}
        saveStatus={canvasSaveStatus}
        isAllDone={tabs.every((tab) => tab.isDone)}
        MarkAllDone={MarkAllDone}
      />
      <RenderTabNavigation
        tabs={tabs}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        setTabs={setTabs}
        overlayRef={overlayRef}
      />
      <div className="canvas-container">
        <img
          src={image.src}
          alt={image.filename}
          style={{ position: "absolute", zIndex: 1 }}
        />
        <DrawPreview
          imageDim={imgDim}
          ref={overlayRef}
          brushSize={brushSize}
          mode={mode}
          mask={tabs[selectedTab].mask}
          setMask={setCurrentMask}
          stateSave={{
            value: canvasSaveStatus,
            setValue: setCanvasSaveStatus,
          }}
        />
      </div>
    </>
  );
}
