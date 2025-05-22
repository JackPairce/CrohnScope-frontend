"use client";
import { useAnnotationContext } from "@/contexts/AnnotationContext";
import { useState } from "react";
import { ApiImage } from "../api";
import BaseCanvas from "../BaseCanvas";
import { useAnnotationCanvas } from "../hooks/useAnnotationCanvas";
import ToolBar from "../ToolBar";
import { Mode } from "../types";
import DrawPreview from "./DrawPreview";
import MaskDrawingToolbar from "./ToolBar";

export default function MaskDrawingCanvas({ image }: { image: ApiImage }) {
  const { state, refs, actions } = useAnnotationCanvas(image);
  const { saveCurrent, setSaveStatus } = useAnnotationContext();
  const [mode, setMode] = useState<Mode>("draw");
  const [brushSize, setBrushSize] = useState<number>(15);

  // Toolbar handlers
  const saveMasks = async () => {
    // Save current annotations using context's saveCurrent function
    try {
      await saveCurrent();
      // The saveCurrent function in the context will handle setting all the status flags
    } catch (error) {
      console.error("Failed to save masks:", error);
      // Reset saving state on error
      setSaveStatus((prev) => ({
        ...prev,
        isSaving: false,
      }));
    }
  };
  const markAllDone = async () => {
    // Update status to show marking as done
    // Use setSaveStatus from the context we already obtained at the component level
    setSaveStatus((prev) => ({
      ...prev,
      isMarkingAllDone: true,
    }));

    try {
      // TODO: Implement API call to mark all masks as done
      console.log("Mark all done for image:", image?.id);

      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Mark all tabs as done
      actions.setTabs((prev) => prev.map((tab) => ({ ...tab, isDone: true })));
    } catch (error) {
      console.error("Failed to mark all done:", error);
    } finally {
      setSaveStatus((prev) => ({
        isSaving: false,
        isMarkingAllDone: false,
        isModified: false,
      }));
    }
  };

  if (
    state.isLoading ||
    !state.imgDim ||
    state.selectedTab === -1 ||
    !state.tabs?.[state.selectedTab]
  ) {
    return null;
  }

  return (
    <BaseCanvas
      image={image}
      state={state}
      refs={refs}
      actions={actions}
      toolbar={
        <ToolBar
          saveStatus={state.canvasSaveStatus}
          saveMasks={saveMasks}
          isAllDone={state.isAllDone}
          MarkAllDone={markAllDone}
        >
          <MaskDrawingToolbar
            mode={mode}
            setMode={setMode}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            saveStatus={state.canvasSaveStatus}
            saveMasks={saveMasks}
            isAllDone={state.isAllDone}
            MarkAllDone={markAllDone}
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
        ref={refs.overlayRef}
      />
    </BaseCanvas>
  );
}
