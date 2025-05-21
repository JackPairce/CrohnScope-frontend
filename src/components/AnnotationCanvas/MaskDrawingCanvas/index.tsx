"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiImage } from "../api";
import BaseCanvas from "../BaseCanvas";
import DrawPreview from "../DrawPreview";
import EmptyStatePage from "../EmptyStatePage";
import { useAnnotationCanvas } from "../hooks/useAnnotationCanvas";
import MaskDrawingToolbar from "../MaskDrawingToolbar";

export default function MaskDrawingCanvas({
  image,
}: {
  image: ApiImage | null;
}) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      {image ? <Workspace image={image} /> : <EmptyStatePage />}
    </QueryClientProvider>
  );
}

function Workspace({ image }: { image: ApiImage }) {
  const { state, refs, actions } = useAnnotationCanvas(image);

  // Toolbar handlers
  const saveMasks = async () => {
    // TODO: Implement save functionality
    console.log("Save masks");
    actions.setCanvasSaveStatus((prev) => ({
      ...prev,
      isModified: false,
    }));
  };

  const markAllDone = async () => {
    // TODO: Implement mark all done functionality
    console.log("Mark all done");
    actions.setCanvasSaveStatus((prev) => ({
      ...prev,
      isMarkingAllDone: true,
    }));
  };

  const isAllDone = state.tabs.every((tab) => tab.isDone);

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
        <MaskDrawingToolbar
          mode={state.mode}
          setMode={actions.setMode}
          brushSize={state.brushSize}
          setBrushSize={actions.setBrushSize}
          saveStatus={state.canvasSaveStatus}
          saveMasks={saveMasks}
          isAllDone={isAllDone}
          MarkAllDone={markAllDone}
        />
      }
    >
      <DrawPreview
        imageDim={state.imgDim}
        brushSize={state.brushSize}
        mode={state.mode}
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
