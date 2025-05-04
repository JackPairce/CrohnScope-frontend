import type { Mask } from "./types";

export const updateMask = (
  // shape: Shape,
  ctx: CanvasRenderingContext2D | null,
  currentMask: Mask
  // canvas: HTMLCanvasElement
  // drawShape: (
  //   ctx: CanvasRenderingContext2D | null,
  //   shape: Shape,
  //   fill: string
  // ) => void
) => {
  // const offscreen = document.createElement("canvas");
  // const width = currentMask[0].length;
  // const height = currentMask.length;
  // if (width === 0 || height === 0) return currentMask;
  // offscreen.width = width;
  // offscreen.height = height;
  // const ctx = offscreen.getContext("2d");
  // Draw the shape
  // drawShape(ctx, shape, "white");

  const width = currentMask[0].length; // offscreen.width;
  const height = currentMask.length; // offscreen.height;
  if (!ctx || width === 0 || height === 0) return currentMask;
  let once = false;
  // Get pixel data
  const data = ctx.getImageData(0, 0, width, height);
  const newMask: Mask = [...currentMask.map((row) => [...row])]; // deep copy
  for (let i = 0; i < width * height; i++) {
    const r = data.data[i * 4]; // Red channel
    const g = data.data[i * 4 + 1]; // Green channel
    const b = data.data[i * 4 + 2]; // Blue channel

    // if (!once) {
    //   console.log("r", r, "g", g, "b", b);
    //   console.log("i", i);
    //   console.log("width", width);
    //   console.log("height", height);
    //   console.log(
    //     "data",
    //     data.data[i * 4],
    //     data.data[i * 4 + 1],
    //     data.data[i * 4 + 2]
    //   );
    //   console.log("newMask", newMask);
    //   once = true;
    // }
    const x = i % width;
    const y = Math.floor(i / width);
    newMask[y][x] = r > 0 && g === 0 && b === 0 ? 1 : 0;
  }
  return newMask;
};

export function drawMaskToCanvas(
  mask: Mask,
  ctx: CanvasRenderingContext2D | null,
  colorMap?: { 0: number[]; 1: number[] }
) {
  const height = mask.length;
  if (height === 0) return;
  const width = mask[0].length;

  if (!ctx) return;
  const imageData = ctx.createImageData(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const value = mask[y][x];
      if (colorMap) {
        imageData.data[index + 0] = colorMap[value][0];
        imageData.data[index + 1] = colorMap[value][1];
        imageData.data[index + 2] = colorMap[value][2];
        imageData.data[index + 3] =
          colorMap[value][3] == undefined ? 255 : colorMap[value][3]; // Alpha channel
      } else {
        imageData.data[index + 0] = value * 255; // Red channel
        imageData.data[index + 1] = value * 255; // Green channel
        imageData.data[index + 2] = value * 255; // Blue channel
        imageData.data[index + 3] = 255; // Alpha (fully opaque)
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

export async function matrix2File(mask: Mask, filename: string) {
  const canvas = document.createElement("canvas");
  canvas.width = mask[0].length;
  canvas.height = mask.length;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");
  drawMaskToCanvas(mask, ctx);
  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error("Failed to convert canvas to blob");
      const file = new File([blob], filename, { type: "image/png" });
      resolve(file);
    });
  });
}
