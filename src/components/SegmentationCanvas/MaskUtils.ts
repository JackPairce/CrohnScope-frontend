import type { Mask } from "./types";

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
  // draw mask on canvas
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

export async function ExtractRealMask(mask: Mask): Promise<Mask> {
  const canvas = document.createElement("canvas");
  canvas.width = mask.width;
  canvas.height = mask.height;

  drawMaskToCanvas(mask, canvas, colorMappingToModel);
  return await CanvasToMask(canvas);
}

export async function Mask2File(mask: Mask, filename: string): Promise<File> {
  return new Promise<File>((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = mask.width;
    canvas.height = mask.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");
    ctx.drawImage(mask, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], filename, { type: "image/png" });
        resolve(file);
      } else {
        reject(new Error("Failed to convert mask to blob"));
      }
    }, "image/png");
  });
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
