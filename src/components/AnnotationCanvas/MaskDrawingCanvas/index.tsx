"use client";
import { useAnnotationContext } from "@/contexts/AnnotationContext";
import { ApiImage, generateMask } from "@/lib/api";
import { useState } from "react";
import BaseCanvas from "../BaseCanvas";
import { useAnnotationCanvas } from "../hooks/useAnnotationCanvas";
import { CanvasActionsHandler } from "../hooks/useCanvasActions";
import { ArrayToImg, Img2Mask } from "../MaskUtils";
import ToolBar from "../ToolBar";
import { DrawModes } from "../types";
import DrawPreview from "./DrawPreview";
import MaskDrawingToolbar from "./ToolBar";

export default function MaskDrawingCanvas({ image }: { image: ApiImage }) {
  const { state, refs, actions } = useAnnotationCanvas(image, "segmentation");
  const { setSaveStatus, saveCurrent, setCurrentImage } =
    useAnnotationContext();
  const [mode, setMode] = useState<DrawModes>("hand");
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
    "segmentation",
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
      state={{ ...state, mode }}
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
          generateWithAI={async () => {
            const generated_masks = await generateMask(image.id);

            // Process masks outside of setState and then update all at once
            const updatedTabs = [...state.tabs];
            const processedTabs = await Promise.all(
              updatedTabs.map(async (tab) => {
                const foundMask = generated_masks.find(
                  (mask) => mask.cell_id === tab.cell_id
                );

                if (foundMask) {
                  tab.mask = await Img2Mask(ArrayToImg(foundMask.data));
                } else {
                  console.warn(
                    `No generated mask found for tab ${tab.cell_id}`
                  );
                }

                return tab;
              })
            );

            // Update state with processed results
            actions.setTabs(processedTabs);
            // Set canvas save status to modified
            actions.setCanvasSaveStatus((prev) => ({
              ...prev,
              isModified: true,
            }));
            return true;
          }}
          setTabs={actions.setTabs}
        >
          {" "}
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
            imgDim={state.imgDim}
            onMaskUpdate={(mask) => {
              if (state.selectedTab !== -1) {
                actions.setTabs((prev) => {
                  prev[state.selectedTab].mask = mask;
                  return [...prev];
                });
                actions.setCanvasSaveStatus((prev) => ({
                  ...prev,
                  isModified: true,
                }));
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
