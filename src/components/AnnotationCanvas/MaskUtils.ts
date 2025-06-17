import type { Mask, MaskArray } from "./types";

export const colorMappingToUser = {
  "0,0,0": "0,0,0,0",
  "255,255,255": "255,0,0,255",
};

export const colorMappingToModel = Object.fromEntries(
  Object.entries(colorMappingToUser).map(([k, v]) => [v, k])
);

export const NewMaskArray = (width: number, height: number): MaskArray => {
  return Array.from({ length: height }, () => new Uint8Array(width));
};

export const CanvasToImageElement = (
  canvas: HTMLCanvasElement
): Promise<HTMLImageElement> => {
  const img = new Image();
  img.src = canvas.toDataURL();
  return new Promise((resolve) => {
    img.onload = () => {
      resolve(img);
    };
  });
};

export const CanvasToMaskArray = async (
  canvas: HTMLCanvasElement,
  id: number
): Promise<MaskArray> => {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const maskArray = NewMaskArray(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4;
      const a = imageData.data[index + 3]; // alpha channel
      maskArray[y][x] = a > 0 ? id : 0;
    }
  }
  return maskArray;
};

export function drawMaskToCanvas(mask: MaskArray, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!ctx) throw new Error("Failed to get canvas context");
  // get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < mask.length; y++) {
    for (let x = 0; x < mask[y].length; x++) {
      if (mask[y] === undefined || mask[y][x] === undefined) {
        console.warn(`Mask array is not defined for coordinates (${x}, ${y})`);
      }
      const index = (y * canvas.width + x) * 4;
      imageData.data[index + 0] = 255;
      imageData.data[index + 1] = 255;
      imageData.data[index + 2] = 255;
      imageData.data[index + 3] = mask[y][x] > 0 ? 255 : 0;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}
export function MaskToArray(mask: HTMLImageElement): (0 | 1)[][] {
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

export function CreateImageElementFromSrc(imageSrc: string) {
  const img = new Image();
  img.src = imageSrc;
  return new Promise<Mask>((resolve) => {
    img.onload = () => {
      resolve(img);
    };
  });
}

export function ArrayToImg(array: MaskArray) {
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

export function NdarrayToImgSrc(array: number[][][]): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  const width = array[0].length;
  const height = array.length;
  canvas.width = width;
  canvas.height = height;

  const imageData = ctx.createImageData(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      imageData.data[index + 0] = array[y][x][0]; // R
      imageData.data[index + 1] = array[y][x][1]; // G
      imageData.data[index + 2] = array[y][x][2]; // B
      imageData.data[index + 3] = 255; // A
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}
