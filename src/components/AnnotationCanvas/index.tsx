"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useDriveDelete, UseDriveList, useDriveUpload } from "./api";
import DrawPreview from "./DrawPreview";
import { ExtractRealMask, Img2Mask, Mask2File, NewMask } from "./MaskUtils";
import ToolBar from "./ToolBar";
import { CellsNames, labelMaskPairs, Mode, Tab } from "./types";

import { DriveFileData } from "@/app/_lib/googledrive";
import { redirect } from "next/navigation";
import Loader from "../loader";
import { useData } from "./DataContext";
import RenderTabNavigation from "./RenderTabNavigation";
import "./styles.scss";

// TODO: Use env variable
const FolderID = "1AA8UCcJfSOo4h7wagO24ShEwJEVop43s";

const imagesFolder = "images";
const masksFolder = "masks";
const datasetSchemaFile = "dataset.json";
const datasetMetadataFile = "metadata.csv";

const queryClient = new QueryClient();

export default function SegmentationCanvas({
  loadedMasks,
  subMasksFolderId,
}: {
  loadedMasks: { [key: string]: string };
  subMasksFolderId: string | null;
}) {
  const { img, isLoading, setIsLoading } = useData();

  const [processedMasks, setProcessedMasks] = useState<labelMaskPairs>({});

  useEffect(() => {
    (async () => {
      const masks: labelMaskPairs = {};
      for (const [label, src] of Object.entries(loadedMasks)) {
        masks[label] = await Img2Mask(src);
      }
      setProcessedMasks(masks);
      setIsLoading(false);
    })();
  }, [loadedMasks]);

  if (!img) redirect(document.location.pathname);

  return (
    <QueryClientProvider client={queryClient}>
      {img && loadedMasks && !isLoading ? (
        <MaskDrawingCanvas
          image={img}
          maskFolderId={subMasksFolderId}
          loadedMasks={processedMasks}
        />
      ) : (
        <Loader />
      )}
    </QueryClientProvider>
  );
}
function MaskDrawingCanvas({
  image,
  maskFolderId,
  loadedMasks,
}: {
  image: DriveFileData;
  maskFolderId: string | null;
  loadedMasks: labelMaskPairs;
}) {
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [mode, setMode] = useState<Mode>("draw");
  const [brushSize, setBrushSize] = useState(15);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedTab, setSelectedTab] = useState(-1);
  const driveList = new UseDriveList();
  const { mutateAsync: listFilesDrive } = driveList.listDriveFiles();
  const { mutateAsync: uploadFile } = useDriveUpload();
  const { mutateAsync: deleteFile } = useDriveDelete();
  useEffect(() => {
    console.log("loadedMasks Effect", loadedMasks);

    const img = new Image();
    img.src = image.src;
    img.onload = () => {
      // set mask
      setTabs(
        Object.values(CellsNames)
          .filter((v) => typeof v === "string")
          .map((name) => ({
            name,
            isRename: false,
            mask:
              loadedMasks[name] ?? NewMask(img.naturalWidth, img.naturalHeight),
          }))
      );
      setSelectedTab(0);
    };
  }, [image]);

  const setCurrentMask = (mask: HTMLImageElement) => {
    if (selectedTab === -1) return;
    setTabs((prev) => {
      prev[selectedTab].mask = mask;
      return [...prev];
    });
  };

  const saveMasks = async () => {
    if (selectedTab === -1 || !maskFolderId) return;
    setIsSaving(true);
    // TODO: Move the job to the backend
    // get file in the folder
    const filestodelete = await listFilesDrive(maskFolderId);
    // delete all files in the folder
    await Promise.all(
      filestodelete.map(async (file) => {
        await deleteFile(file.id!);
      })
    );
    await Promise.all(
      tabs.map(async (tab) => {
        await uploadFile({
          file: await Mask2File(await ExtractRealMask(tab.mask), tab.name),
          inFolderId: maskFolderId,
        });
      })
    );
    setIsSaving(false);
  };

  if (tabs.length === 0 || selectedTab == -1 || !image) return null;

  return (
    <>
      <ToolBar
        mode={mode}
        setMode={setMode}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        saveMasks={saveMasks}
        isSaving={isSaving}
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
          alt={image.name}
          style={{ position: "absolute", zIndex: 1 }}
        />
        <DrawPreview
          ref={overlayRef}
          brushSize={brushSize}
          mode={mode}
          mask={tabs[selectedTab].mask}
          setMask={setCurrentMask}
        />
      </div>
    </>
  );
}

function ClassifficationCanvas({ image }: { image: DriveFileData }) {
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
          alt={image.name}
          style={{ position: "absolute", zIndex: 1 }}
        />
        <canvas ref={healthyRef} />
        <canvas ref={unhealthyRef} />
        <canvas ref={coordinatesRef} />
      </div>
    </>
  );
}
