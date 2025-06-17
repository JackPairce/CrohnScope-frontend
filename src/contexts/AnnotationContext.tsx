"use client";

import { CreateImageElementFromSrc } from "@/components/AnnotationCanvas/MaskUtils";
import {
  MaskArray,
  Modes,
  SaveSatues,
  Tab,
} from "@/components/AnnotationCanvas/types";
import ConfirmDialog, { DialogAction } from "@/components/ConfirmDialog";
import {
  ApiImage,
  getFeatures,
  getMask,
  saveMask,
  setMaskDone,
} from "@/lib/api"; // Import the components type from API
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type ImageSwitchChoice = "stay" | "continue-without-save" | "save-and-continue";

type StainViewType = "original" | "inorm" | "hematoxylin" | "eosin";

export type ImageMask = Pretify<Omit<ApiImage, "mask"> & { mask: MaskArray }>;

interface AnnotationContextState {
  states: {
    mode: Modes;
    brushSize: number;
    currentImage: ImageMask | null;
    imgDim: { width: number; height: number };
    isLoading: boolean;
    filters: {
      original: string;
      inorm: string;
      hematoxylin: string;
      eosin: string;
    };
    currentStainView: StainViewType | null;
    showOtherFeatures: boolean;
    triggerMaskReset: number;

    tabs: Tab[];
    selectedTab: number;
    saveStatus: SaveSatues;
  };

  actions: {
    setMode: Dispatch<SetStateAction<Modes>>;
    setBrushSize: Dispatch<SetStateAction<number>>;
    setCurrentImage: (image: ApiImage | null) => Promise<boolean>;
    setMask: (mask: MaskArray) => void;
    setImgDim: Dispatch<SetStateAction<{ width: number; height: number }>>;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
    setShowOtherFeatures: Dispatch<SetStateAction<boolean>>;
    triggerMaskReset: (reset?: boolean) => void;

    setTabs: Dispatch<SetStateAction<Tab[]>>;
    setSelectedTab: Dispatch<SetStateAction<number>>;
    setSaveStatus: Dispatch<SetStateAction<SaveSatues>>;
    generateWithAI: () => Promise<void>;
    setCurrentStainView: Dispatch<SetStateAction<StainViewType | null>>;

    defaultActions: {
      saveMask: (image: ImageMask) => Promise<void>;
      markDone: (id: number) => Promise<void>;
    };
  };
}
const initialAnnotationContext: AnnotationContextState = {
  states: {
    mode: "hand", // Default mode
    brushSize: 15, // Default brush size
    currentImage: null,
    saveStatus: {
      isSaving: false,
      isModified: false,
      isMarkingDone: false,
    },
    showOtherFeatures: false,
    tabs: [],
    selectedTab: 0,
    imgDim: { width: 0, height: 0 },
    isLoading: false,
    filters: {
      original: "",
      inorm: "",
      hematoxylin: "",
      eosin: "",
    },
    currentStainView: "original",
    triggerMaskReset: 0,
  },
  actions: {
    setMode: () => {},
    setBrushSize: () => {},
    setCurrentImage: async () => {
      return false;
    },
    setMask: () => {},
    setShowOtherFeatures: () => {},
    setSaveStatus: () => {},
    setTabs: () => {},
    setSelectedTab: () => {},
    setImgDim: () => {},
    setIsLoading: () => {},
    generateWithAI: async () => {},
    setCurrentStainView: () => {},
    triggerMaskReset: () => {},

    defaultActions: {
      saveMask: async (image: ImageMask) => {
        await saveMask({
          image_id: image.id,
          data: image.mask.map((row) => Array.from(row)),
        });
      },
      markDone: async (id: number) => {
        await setMaskDone(id);
      },
    },
  },
};

const AnnotationContext = createContext<AnnotationContextState>(
  initialAnnotationContext
);

export function AnnotationProvider({ children }: { children: ReactNode }) {
  const [currentImage, setCurrentImageState] = useState<ImageMask | null>(
    initialAnnotationContext.states.currentImage
  );
  const [saveStatus, setSaveStatus] = useState<SaveSatues>(
    initialAnnotationContext.states.saveStatus
  );
  const [tabs, setTabs] = useState<Tab[]>(initialAnnotationContext.states.tabs);
  const [selectedTab, setSelectedTab] = useState(
    initialAnnotationContext.states.selectedTab
  );
  const [mode, setMode] = useState<Modes>("hand");
  const [brushSize, setBrushSize] = useState<number>(15);
  const [imgDim, setImgDim] = useState<{
    width: number;
    height: number;
  }>(initialAnnotationContext.states.imgDim);
  const [isLoading, setIsLoading] = useState(
    initialAnnotationContext.states.isLoading
  );

  // Stain normalization view states
  const [currentStainView, setCurrentStainView] =
    useState<StainViewType | null>("original");
  const [stainViews, setStainViews] = useState<Record<StainViewType, string>>(
    initialAnnotationContext.states.filters
  );

  // other masks of feature
  const [showOtherFeatures, setShowOtherFeatures] = useState(false);
  const [triggerMaskReset, setTriggerMaskReset] = useState(
    initialAnnotationContext.states.triggerMaskReset
  );
  // private states
  const [showDialog, setShowDialog] = useState(false);
  const [dialogActions, setDialogActions] = useState<
    DialogAction<ImageSwitchChoice>[]
  >([]);

  const confirmImageSwitch = (): Promise<ImageSwitchChoice> => {
    return new Promise((resolve) => {
      setDialogActions([
        {
          label: "Continue Working",
          value: "stay",
          type: "default",
          autoFocus: true,
        },
        {
          label: "Continue Without Saving",
          value: "continue-without-save",
          type: "warning",
        },
        {
          label: "Save and Continue",
          value: "save-and-continue",
          type: "primary",
        },
      ]);

      // Store the resolve function to call it when dialog closes
      dialogResolveRef.current = resolve;
      setShowDialog(true);
    });
  };

  // Reference to store the resolve function
  const dialogResolveRef = useRef<(value: ImageSwitchChoice) => void>(() => {});

  // Dialog close handler
  const handleDialogClose = (value: ImageSwitchChoice) => {
    setShowDialog(false);
    if (dialogResolveRef.current) {
      dialogResolveRef.current(value);
    }
  };

  const handleImageSwitch = async (
    newImage: ApiImage | null
  ): Promise<boolean> => {
    try {
      // If there are unsaved changes
      if (saveStatus.isModified) {
        // Show dialog and wait for response
        const choice = await confirmImageSwitch();

        switch (choice) {
          case "stay":
            return false; // Just stay on the current image
          case "save-and-continue":
            try {
              if (currentImage)
                await initialAnnotationContext.actions.defaultActions.saveMask(
                  currentImage
                );
            } catch (error) {
              console.error("Error saving:", error);
              throw error;
            }
            break;
          case "continue-without-save":
            setSaveStatus(initialAnnotationContext.states.saveStatus);
            // Just continue without saving
            break;
        }
      }

      if (!newImage) return true;
      // set image dimensions
      setIsLoading(true);

      const { naturalHeight, naturalWidth } = await CreateImageElementFromSrc(
        newImage.src
      );
      setImgDim({
        width: naturalWidth,
        height: naturalHeight,
      });
      const mask = await getMask(newImage.id);
      setCurrentImageState({
        ...newImage,
        mask: mask.data as unknown as MaskArray,
      });
      setSelectedTab(0);
      setIsLoading(false);

      // try {
      //   setCurrentStainView(null);
      //   const views = await getStainNormalizationImage(newImage.id);
      //   setStainViews({
      //     original: newImage.src, // Always use the provided image src for original
      //     inorm: NdarrayToImgSrc(views.inorm),
      //     hematoxylin: NdarrayToImgSrc(views.hematoxylin),
      //     eosin: NdarrayToImgSrc(views.eosin),
      //   });
      // } catch (error) {
      //   console.error("Failed to load stain normalization views:", error);
      //   // Fallback to original image for all views
      let defaultvalues = initialAnnotationContext.states.filters;
      defaultvalues.original = newImage.src;
      setStainViews(defaultvalues);
      // } finally {
      //   setCurrentStainView(initialAnnotationContext.states.currentStainView);
      // }

      return true;
    } catch (error) {
      console.error("Error switching image:", error);
      throw new Error("Failed to switch image");
    }
  };

  useEffect(() => {
    // initialize the tabs
    getFeatures().then(async (features) => {
      setTabs(
        features.map((feature) => ({
          feature_id: feature.id,
          name: feature.name,
          isRename: false,
        }))
      );
    });
  }, []);

  const contextValue: AnnotationContextState = {
    states: {
      mode,
      brushSize,
      currentImage,
      imgDim,
      isLoading,
      tabs,
      selectedTab,
      saveStatus,
      filters: stainViews,
      currentStainView,
      showOtherFeatures,
      triggerMaskReset,
    },
    actions: {
      setMode,
      setBrushSize,
      setImgDim,
      setIsLoading,
      setTabs,
      setSelectedTab,
      setSaveStatus,
      setShowOtherFeatures,
      setCurrentImage: handleImageSwitch,
      triggerMaskReset: (reset?: boolean) => {
        if (reset) setTriggerMaskReset(0);
        else setTriggerMaskReset((prev) => prev + 1);
      },
      setMask: (mask: MaskArray) => {
        if (!currentImage) {
          console.warn("No current image to set mask for.");
          return;
        }
        setCurrentImageState((prevImage) => {
          if (!prevImage) {
            console.warn("No current image to set mask for.");
            return null;
          }
          return {
            ...prevImage,
            mask,
          };
        });
      },
      generateWithAI: async () => {
        if (!currentImage) {
          console.warn("No current image to generate masks for.");
          return;
        }
        // const generated_masks = await generateMask(currentImage.id);

        // Update state with processed results
        // setTabs(updatedTabs);
        // Set canvas save status to modified
        setSaveStatus((prev) => ({
          ...prev,
          isModified: true,
        }));
      },
      setCurrentStainView,
      defaultActions: initialAnnotationContext.actions.defaultActions,
    },
  };

  return (
    <AnnotationContext.Provider value={contextValue}>
      {children}
      {showDialog && (
        <ConfirmDialog
          isOpen={showDialog}
          title="Unsaved Changes"
          message="You have unsaved changes. What would you like to do?"
          dialogType="warning"
          actions={dialogActions}
          onClose={handleDialogClose}
        />
      )}
    </AnnotationContext.Provider>
  );
}

export function useAnnotationContext() {
  const context = useContext(AnnotationContext);
  if (context === undefined) {
    throw new Error(
      "useAnnotationContext must be used within an AnnotationProvider"
    );
  }
  return context;
}
