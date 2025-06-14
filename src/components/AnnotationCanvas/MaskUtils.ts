import { getCells, getMask } from "@/lib/api";
import { Dispatch, SetStateAction } from "react";
import type { DataProcessingMode, Mask, Tab } from "./types";

export const colorMappingToUser = {
  "0,0,0": "0,0,0,0",
  "255,255,255": "255,0,0,255",
};

export const colorMappingToModel = Object.fromEntries(
  Object.entries(colorMappingToUser).map(([k, v]) => [v, k])
);

export const NewMask = async (width: number, height: number): Promise<Mask> => {
  // black image
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  return await CanvasToMask(canvas);
};

export const CanvasToMask = (canvas: HTMLCanvasElement): Promise<Mask> => {
  const img = new Image();
  img.src = canvas.toDataURL();

  return new Promise((resolve) => {
    img.onload = () => {
      resolve(img);
    };
  });
};

export function drawMaskToCanvas(
  mask: Mask,
  canvas: HTMLCanvasElement,
  colorMap: { [value: string]: string }
) {
  const validateColorFormat = (key: string): boolean =>
    key.split(",").length >= 3 &&
    key.split(",").length <= 4 &&
    key.split(",").every((value) => !isNaN(Number(value))) &&
    key.split(",").every((value) => Number(value) >= 0 && Number(value) <= 255);
  // check if colorMap keys and values are valid
  const keysValid = Object.keys(colorMap).every(validateColorFormat);
  const valuesValid = Object.values(colorMap).every(validateColorFormat);
  if (!keysValid || !valuesValid) {
    throw new Error("Invalid colorMap format");
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (mask instanceof Promise) {
    mask.then((mask) => {
      drawMaskToCanvas(mask, canvas, colorMap);
    });
    return;
  }

  ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);

  if (!ctx) throw new Error("Failed to get canvas context");
  // get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  for (const [key, value] of Object.entries(colorMap)) {
    const [R_target, G_target, B_target, _] = key.split(",").map(Number);
    const [R_replace, G_replace, B_replace, A_replace] = value
      .split(",")
      .map(Number);

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        const r = imageData.data[index + 0];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        if (r === R_target && g === G_target && b === B_target) {
          imageData.data[index + 0] = R_replace;
          imageData.data[index + 1] = G_replace;
          imageData.data[index + 2] = B_replace;
          imageData.data[index + 3] = A_replace ?? 255; // default to 255 if not provided
        }
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}
type MaskArray = (0 | 1)[][];
export function MaskToArray(mask: HTMLImageElement): MaskArray {
  const canvas = document.createElement("canvas");
  const width = mask.naturalWidth;
  const height = mask.naturalHeight;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");
  ctx.drawImage(mask, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const array: (0 | 1)[][] = Array.from({ length: height }, () =>
    Array(width).fill(0)
  );
  for (let y = 0; y < mask.height; y++) {
    for (let x = 0; x < mask.width; x++) {
      const index = (y * mask.width + x) * 4;
      const a = imageData.data[index + 4]; // alpha channel
      if (a > 0) array[y][x] = 1;
    }
  }
  return array;
}

export function Img2Mask(imageSrc: string) {
  const img = new Image();
  img.src = imageSrc;
  return new Promise<Mask>((resolve) => {
    img.onload = () => {
      resolve(img);
    };
  });
}

export function ArrayToImg(array: (0 | 1 | 2)[][]) {
  const canvas = document.createElement("canvas");
  const width = array[0].length;
  const height = array.length;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  const imageData = ctx.createImageData(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      imageData.data[index + 0] = array[y][x] ? 255 : 0; // R
      imageData.data[index + 1] = array[y][x] ? 255 : 0; // G
      imageData.data[index + 2] = array[y][x] ? 255 : 0; // B
      imageData.data[index + 3] = array[y][x] ? 255 : 0; // A
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL();
}

export function LoadMasks(
  image: {
    id: number;
    filename: string;
    src: string;
    is_done: boolean;
  },
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  setImgDim: Dispatch<
    SetStateAction<{
      width: number;
      height: number;
    } | null>
  >,
  setTabs: Dispatch<SetStateAction<Tab[]>>,
  setSelectedTab: Dispatch<SetStateAction<number>>,
  DataTransformationMode: DataProcessingMode
) {
  setIsLoading(true);
  const img = new Image();
  img.src = image.src;
  img.onload = async () => {
    setImgDim({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
    const cells = await getCells(image.id);
    const masks = await getMask(image.id);
    const tabs = await Promise.all(
      cells.map(async (cell) => {
        const mask = masks.find((mask) => mask.cell_id === cell.id);
        let currentMask = mask
          ? await Img2Mask(mask.src)
          : await NewMask(img.naturalWidth, img.naturalHeight);
        currentMask =
          currentMask.width == img.naturalWidth &&
          currentMask.height == img.naturalHeight
            ? currentMask
            : await NewMask(img.naturalWidth, img.naturalHeight);
        return {
          mask_id: mask?.id,
          cell_id: cell.id,
          name: cell.name,
          isRename: false,
          mask: currentMask,
          isDone:
            DataTransformationMode === "segmentation"
              ? mask?.is_segmented
              : mask?.is_annotated,
        } as Tab;
      })
    );
    setTabs(tabs);
    setSelectedTab(tabs.length ? 0 : NaN);
    setIsLoading(false);
  };
}
