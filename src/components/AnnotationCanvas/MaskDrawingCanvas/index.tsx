"use client";
import { useAnnotationContext } from "@/contexts/AnnotationContext";
import { ApiImage } from "@/lib/api";
import { useState } from "react";
import BaseCanvas from "../BaseCanvas";
import { useAnnotationCanvas } from "../hooks/useAnnotationCanvas";
import { CanvasActionsHandler } from "../hooks/useCanvasActions";
import ToolBar from "../ToolBar";
import { Mode } from "../types";
import DrawPreview from "./DrawPreview";
import MaskDrawingToolbar from "./ToolBar";

export default function MaskDrawingCanvas({ image }: { image: ApiImage }) {
  const { state, refs, actions } = useAnnotationCanvas(image);
  const { setSaveStatus, saveCurrent, setCurrentImage } =
    useAnnotationContext();
  const [mode, setMode] = useState<Mode>("draw");
  const [brushSize, setBrushSize] = useState<number>(15);

  const canvasActionsWithCurrent = {
    ...actions,
    setCurrentImage,
  };

  // Initialize CanvasActionsHandler
  const canvasActions = new CanvasActionsHandler(
    state,
    canvasActionsWithCurrent,
    setSaveStatus,
    image,
    {
      saveCurrent: async () => {
        try {
          await saveCurrent();
        } catch (error) {
          console.error("Failed to save masks:", error);
          setSaveStatus((prev) => ({
            ...prev,
            isSaving: false,
          }));
        }
      },
    }
  );

  if (
    state.isLoading ||
    !state.imgDim ||
    state.selectedTab === -1 ||
    !state.tabs?.[state.selectedTab]
  ) {
    return null;
  }

  const isAllDone = state.tabs.every((tab) => tab.isDone);

  return (
    <BaseCanvas
      image={image}
      state={state}
      refs={refs}
      actions={actions}
      toolbar={
        <ToolBar
          saveStatus={state.canvasSaveStatus}
          saveMasks={() => canvasActions.saveMasks()}
          isAllDone={isAllDone}
          MarkAllDone={async () => {
            await canvasActions.markAllDone();
            if (isAllDone) {
              await setCurrentImage(null);
            }
          }}
          markCurrentMask={async () => {
            await canvasActions.markCurrentMask();
            if (state.tabs.every((tab) => tab.isDone)) {
              await setCurrentImage(null);
            }
          }}
          saveAll={() => canvasActions.saveMasks()}
          saveAndMark={async () => {
            await canvasActions.saveAndMark();
            if (isAllDone) {
              await setCurrentImage(null);
            }
          }}
          state={state}
        >
          <MaskDrawingToolbar
            mode={mode}
            setMode={setMode}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            saveStatus={state.canvasSaveStatus}
            saveMasks={() => canvasActions.saveMasks()}
            isAllDone={isAllDone}
            MarkAllDone={async () => {
              await canvasActions.markAllDone();
              if (isAllDone) {
                await setCurrentImage(null);
              }
            }}
          />
        </ToolBar>
      }
    >
      <DrawPreview
        imageDim={state.imgDim}
        brushSize={brushSize}
        mode={mode}
        mask={state.tabs[state.selectedTab].mask}
        setMask={(mask) => {
          actions.setTabs((prev) => {
            prev[state.selectedTab].mask = mask;
            return [...prev];
          });
          actions.setCanvasSaveStatus((prev) => ({
            ...prev,
            isModified: true,
          }));
        }}
        stateSave={{
          value: state.canvasSaveStatus,
          setValue: actions.setCanvasSaveStatus,
        }}
      />
    </BaseCanvas>
  );
}
