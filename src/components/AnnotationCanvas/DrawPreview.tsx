"use client";

import { MaskArray, Point, Shape } from "@/components/AnnotationCanvas/types";
import { useAnnotationContext } from "@/contexts/AnnotationContext";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { CanvasToMaskArray, drawMaskToCanvas } from "./MaskUtils";

const Red = "rgba(255, 0, 0, 1)";
const White = "rgba(255, 255, 255, 0)";

export function extractTargetMask(
  maskArray: MaskArray,
  featureId: number
  // value: number
): MaskArray {
  return (maskArray as Uint8Array[]).map(
    (row: Uint8Array) =>
      new Uint8Array(
        Array.from(row).map((value) => (value === featureId ? featureId : 0))
      )
  );
}

export function MergeMaskArrays(
  sourceMaskArray: MaskArray,
  overlayMaskArray: MaskArray
): MaskArray {
  if (!sourceMaskArray || !overlayMaskArray)
    return sourceMaskArray || overlayMaskArray;
  const UniqueValues = [
    ...new Set(overlayMaskArray.flatMap((row) => Array.from(row))),
  ];
  const currentId = Math.max(...UniqueValues);

  const merged = (sourceMaskArray as Uint8Array[]).map((row, i) => {
    const mergedRow = new Uint8Array(row.length);
    for (let j = 0; j < row.length; j++) {
      mergedRow[j] =
        row[j] != overlayMaskArray[i][j] && (row[j] == currentId || row[j] == 0)
          ? overlayMaskArray[i][j]
          : row[j];
    }
    return mergedRow;
  });

  return merged;
}

function isOverlaping(source: MaskArray, target: MaskArray): boolean {
  const height = source.length;
  const width = source[0].length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Generated by Copilot
      // Check if pixels overlap or if neighboring pixels have the same non-zero value
      if (source[y][x] && target[y][x] && source[y][x] !== target[y][x]) {
        console.log(
          `Overlapping pixel values: source=${source[y][x]}, target=${target[y][x]} at (${x},${y})`
        );
        return true;
      }

      // Check horizontal and vertical neighbors
      const neighbors = [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
        [-1, -1],
        [1, 1],
        [-1, 1],
        [1, -1],
      ];

      for (const [dx, dy] of neighbors) {
        const newX = x + dx;
        const newY = y + dy;
        if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
          if (
            source[newY][newX] &&
            source[y][x] &&
            source[newY][newX] !== source[y][x]
          ) {
            console.log(
              `Adjacent pixels with not same value: ${source[y][x]} at (${x},${y}) and ${source[newY][newX]} (${newX},${newY})`
            );
            return true;
          }
        }
      }
    }
  }
  return false;
}

type DrawingCanvasProps = {
  currentMask: MaskArray;
};

const DrawingCanvas = forwardRef<HTMLCanvasElement, DrawingCanvasProps>(
  ({ currentMask }, ref) => {
    const {
      states: {
        tabs,
        selectedTab,
        brushSize,
        mode,
        saveStatus,
        currentImage,
        imgDim,
        showOtherFeatures,
      },
      actions: { setSaveStatus, setMask },
    } = useAnnotationContext();
    if (!currentImage || !currentImage.mask) {
      console.warn(
        "No current image set, skipping drawing canvas initialization."
      );
      return null;
    }
    const drawPreviewCanvasRef = useRef<HTMLCanvasElement>(null);
    const previousCanvasRef = useRef<HTMLCanvasElement>(null);
    const eraserCanvasPreviewRef = useRef<HTMLCanvasElement>(null);
    useImperativeHandle(ref, () => drawPreviewCanvasRef.current!);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [mouseInCanvas, setMouseInCanvas] = useState(false);
    const [lastPoint, setLastPoint] = useState<Point | null>(null);
    let drawingPath: Point[] = [];

    const startDrawing = (e: React.MouseEvent) => {
      // Skip drawing action if in hand mode
      if (mode === "hand") {
        setIsMouseDown(true);
        return;
      }
      // allowing only left click to draw
      if (e.button !== 0) return;

      setIsDrawing(true);
      if (!saveStatus.isModified)
        setSaveStatus({
          isSaving: false,
          isModified: true,
          isMarkingDone: false,
        });
      if (!drawPreviewCanvasRef.current) return;
      const rect = drawPreviewCanvasRef.current.getBoundingClientRect();
      const scaleX = drawPreviewCanvasRef.current.width / rect.width;
      const scaleY = drawPreviewCanvasRef.current.height / rect.height;
      setLastPoint({
        x: (e.clientX - rect.left) * (mode == "draw" ? scaleX : 1),
        y: (e.clientY - rect.top) * (mode == "draw" ? scaleY : 1),
      });
    };

    const stopDrawing = async () => {
      if (mode === "hand") {
        if (!isMouseDown) return;
        setIsMouseDown(false);
        return;
      }
      if (!isDrawing) return;
      setIsDrawing(false);
      setLastPoint(null);
      const updated_mask = await CanvasToMaskArray(
        drawPreviewCanvasRef.current!,
        tabs[selectedTab].feature_id
      );
      setMask(MergeMaskArrays(currentImage.mask as MaskArray, updated_mask));
      drawingPath = [];
    };

    const BreakDrawing = () => {
      if (isDrawing) stopDrawing();
    };

    const addPoint = (e: React.MouseEvent) => {
      const rect = drawPreviewCanvasRef.current!.getBoundingClientRect();
      const scaleX = drawPreviewCanvasRef.current!.width / rect.width;
      const scaleY = drawPreviewCanvasRef.current!.height / rect.height;
      drawingPath.push({
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      });
    };
    const draw = (e: React.MouseEvent) => {
      // Skip drawing if in hand mode
      if (mode === "hand") return;

      if (mode === "erase" && mouseInCanvas) updateBrushPreview(e);
      if (!isDrawing) return;
      addPoint(e);
      renderCurrentPath(drawingPath);
    };

    const renderCurrentPath = (currentPath: Point[] = []) => {
      if (!drawPreviewCanvasRef.current) return;

      // Draw current one in progress
      if (currentPath.length > 1)
        drawShape(
          drawPreviewCanvasRef.current,
          { points: currentPath, mode } as Shape,
          mode === "draw" ? Red : White
        );
    };

    const drawShape = (
      canvas: HTMLCanvasElement,
      shape: Shape,
      fill: string
    ) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      if (shape.mode === "draw") {
        if (shape.points.length < 1) return;
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        shape.points.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
      } else {
        // Erase mode
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";

        if (shape.points.length === 0) {
          // Erase a circle
          ctx.beginPath();
          ctx.arc(lastPoint!.x, lastPoint!.y, brushSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = "black"; // Color is irrelevant in "destination-out"
          ctx.fill();
        } else {
          // Erase a line
          ctx.beginPath();
          shape.points.forEach((p, i, points) => {
            if (i < 2) return;
            ctx.moveTo(points[i - 2].x, points[i - 2].y);
            ctx.lineTo(p.x, p.y);
          });
          ctx.lineWidth = brushSize;

          // Fill the path to erase fully
          ctx.fillStyle = "black"; // Color is irrelevant
          ctx.fill();

          // Optionally stroke for more precision
          ctx.strokeStyle = "black"; // Color is irrelevant
          ctx.stroke();
        }

        ctx.restore();
      }
    };

    const updateBrushPreview = (e: React.MouseEvent) => {
      const canvas = eraserCanvasPreviewRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rect = canvas.getBoundingClientRect();
      const scaleX = drawPreviewCanvasRef.current!.width / rect.width;
      const scaleY = drawPreviewCanvasRef.current!.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const clearBrushPreview = () => {
      const canvas = eraserCanvasPreviewRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    useEffect(() => {
      if (!drawPreviewCanvasRef.current || !previousCanvasRef.current) return;
      if (!currentMask) {
        console.warn(
          "Current mask is null, skipping drawing preview canvas initialization."
        );
        return;
      }
      drawPreviewCanvasRef.current.width = imgDim.width;
      drawPreviewCanvasRef.current.height = imgDim.height;
      previousCanvasRef.current!.width = imgDim.width;
      previousCanvasRef.current!.height = imgDim.height;
      drawMaskToCanvas(
        currentImage.mask.map((row) =>
          new Uint8Array(row).map((px) =>
            px == tabs[selectedTab].feature_id ? 0 : px
          )
        ),
        previousCanvasRef.current
      );
      drawMaskToCanvas(currentMask, drawPreviewCanvasRef.current);
    }, [currentMask]);

    return (
      <>
        <canvas
          ref={drawPreviewCanvasRef}
          width={imgDim.width}
          height={imgDim.height}
          style={{
            zIndex: 2,
            cursor:
              mode === "erase" && mouseInCanvas
                ? "none"
                : mode === "hand"
                ? isMouseDown
                  ? "grabbing"
                  : "grab"
                : "crosshair",
            pointerEvents: "auto",
            filter:
              "brightness(0) saturate(100%) invert(13%) sepia(72%) saturate(6705%) hue-rotate(352deg) brightness(95%) contrast(87%)",
          }}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={draw}
          onMouseEnter={() => setMouseInCanvas(true)}
          onMouseLeave={() => {
            BreakDrawing();
            setMouseInCanvas(false);
            clearBrushPreview();
          }}
        />
        <canvas
          ref={previousCanvasRef}
          width={imgDim.width}
          height={imgDim.height}
          style={{
            zIndex: 1,
            pointerEvents: "none",
            visibility: showOtherFeatures ? "visible" : "hidden",
            filter:
              "brightness(0) saturate(100%) invert(80%) sepia(92%) saturate(345%) hue-rotate(341deg) brightness(104%) contrast(94%)",
          }}
        />
        <canvas
          ref={eraserCanvasPreviewRef}
          width={imgDim.width}
          height={imgDim.height}
          style={{
            zIndex: 3,
            pointerEvents: "none",
          }}
        />
      </>
    );
  }
);

export default DrawingCanvas;
