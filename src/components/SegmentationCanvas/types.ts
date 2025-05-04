export type Point = { x: number; y: number };
export type Mode = "draw" | "erase";

export type Shape = {
  points: Point[];
  mode: Mode;
};

export type Mask = (0 | 1)[][];

export type Tab = {
  name: string;
  mask: Mask;
  isRename: boolean;
};
