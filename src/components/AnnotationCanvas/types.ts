export type Point = { x: number; y: number };
// export type Mode = "draw" | "erase";
export const modes = ["draw", "erase"] as const;
export type Mode = (typeof modes)[number];

export type Shape = {
  points: Point[];
  mode: Mode;
};

export type Mask = HTMLImageElement;

export type SaveSatues = {
  isSaving: boolean;
  isModified: boolean;
};

export type Tab = {
  mask_id: number;
  cell_id: number;
  name: string;
  mask: Mask;
  isRename: boolean;
  isDone: boolean;
};

export enum CellsNames {
  "Cryptes",
  "Granulom",
}

export type DatasetSchema = {
  image_id: string;
  cell_id: string;
  cell_state: "healthy" | "unhealthy";
  cell_name: CellsNames;
  mask_path: string;
};

export type labelMaskPairs = {
  [label: string]: Mask;
};

export type DataProcessingMode = "segmentation" | "classification";
