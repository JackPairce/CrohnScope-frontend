"use client";
import { useAnnotationContext } from "@/contexts/AnnotationContext";
import { ApiImage, setMaskDone } from "@/lib/api";
import { useState } from "react";
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
  };  const markAllDone = async () => {
    // Update status to show marking as done
    // Use setSaveStatus from the context we already obtained at the component level
    setSaveStatus((prev) => ({
      ...prev,
      isMarkingAllDone: true,
    }));

    try {
      // Call API to mark all masks as done
      await Promise.all(state.tabs.map((tab) => setMaskDone(tab.mask_id)));

      // Mark all tabs as done
      actions.setTabs((prev) => prev.map((tab) => ({ ...tab, isDone: true })));      // Now all masks are done, so we need to:
      // 1. Update image status in context to mark it as completed
      // 2. Trigger a refetch of the images lists to move this image to the done list
      
      // Notify the ImagesNav component to update its lists
      if (image && image.id) {
        // Mark the current image as completed in our app state
        const updatedImage = { ...image, is_done: true };
        
        // Define the type for our custom event
        interface ImageCompletedEventDetail {
          imageId: number;
          image: ApiImage;
        }
        
        // Dispatch a custom event to notify ImagesNav to update its lists
        const event = new CustomEvent<ImageCompletedEventDetail>('imageCompleted', { 
          detail: { 
            imageId: image.id,
            image: updatedImage 
          }
        });
        window.dispatchEvent(event);
      }
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
