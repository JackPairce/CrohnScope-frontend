"use client";

import {
  Mask,
  Mode,
  Point,
  Shape,
} from "@/components/SegmentationCanvas/types";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { drawMaskToCanvas, updateMask } from "./MaskUtils";

const Red = "rgba(255, 0, 0, 1)";
const White = "rgba(255, 255, 255, 0)";

const FolderID = "1AA8UCcJfSOo4h7wagO24ShEwJEVop43s";

type Props = {
  brushSize: number;
  mode: Mode;
  mask: Mask;
  setMask: (mask: Mask) => void;
  toggleupdate: boolean;
  setToggleUpdate: (toggle: boolean) => void;
};

const SegmentationCanvas = forwardRef<HTMLCanvasElement, Props>(
  (
    {
      brushSize,
      mode,
      mask: currentMask,
      setMask,
      toggleupdate,
      setToggleUpdate,
    },
    ref
  ) => {
    const drawPreviewCanvasRef = useRef<HTMLCanvasElement>(null);
    const eraserCanvasPreviewRef = useRef<HTMLCanvasElement>(null);
    const drawPreviewCTX = useRef<CanvasRenderingContext2D | null>(null);
    const eraserPreviewCTX = useRef<CanvasRenderingContext2D | null>(null);
    useImperativeHandle(ref, () => drawPreviewCanvasRef.current!);
    const [isDrawing, setIsDrawing] = useState(false);
    const [mouseInCanvas, setMouseInCanvas] = useState(false);
    const [lastPoint, setLastPoint] = useState<Point | null>(null);
    let drawingPath: Point[] = [];

    const startDrawing = (e: React.MouseEvent) => {
      setIsDrawing(true);
      if (!drawPreviewCanvasRef.current) return;
      const rect = drawPreviewCanvasRef.current.getBoundingClientRect();
      setLastPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const stopDrawing = () => {
      if (!isDrawing) return;
      setIsDrawing(false);
      setLastPoint(null);
      setMask(
        updateMask(
          // {
          //   points: drawingPath,
          //   mode,
          // },
          drawPreviewCTX.current,
          currentMask
          // drawPreviewCanvasRef.current!
          // drawShape
        )
      );
      drawingPath = [];
    };

    const BreakDrawing = () => {
      if (isDrawing) stopDrawing();
    };

    const addPoint = (e: React.MouseEvent) => {
      const rect = drawPreviewCanvasRef.current!.getBoundingClientRect();
      drawingPath.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      // get last one pushed
      // const lastPoint = drawingPath[drawingPath.length - 1];
      // console.log("lastPoint", lastPoint);
    };

    const draw = (e: React.MouseEvent) => {
      if (mode === "erase" && mouseInCanvas) updateBrushPreview(e);
      if (!isDrawing) return;
      addPoint(e);
      renderCurrentPath(drawingPath);
      // each 10ms update the mask
      // if (!toggleupdate && mode === "erase") {
      //   setToggleUpdate(true);
      //   setTimeout(() => {
      //     setToggleUpdate(false);
      //     setMask(
      //       updateMask(
      //         {
      //           points: drawingPath,
      //           mode,
      //         },
      //         currentMask,
      //         drawShape
      //       )
      //     );
      //   }, 10);
      // }
    };

    const renderCurrentPath = (currentPath: Point[] = []) => {
      if (!drawPreviewCTX.current || !drawPreviewCanvasRef.current) return;

      // Draw current one in progress
      if (currentPath.length > 1)
        drawShape(
          drawPreviewCTX.current,
          { points: currentPath, mode } as Shape,
          mode === "draw" ? Red : White
        );
    };

    const drawShape = (
      ctx: CanvasRenderingContext2D | null,
      shape: Shape,
      fill: string
    ) => {
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
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
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
      if (!drawPreviewCanvasRef.current || !eraserCanvasPreviewRef.current)
        return;
      const drawPreviewRect =
        drawPreviewCanvasRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      drawPreviewCanvasRef.current.width = drawPreviewRect.width * dpr;
      drawPreviewCanvasRef.current.height = drawPreviewRect.height * dpr;
      eraserCanvasPreviewRef.current.width = drawPreviewRect.width * dpr;
      eraserCanvasPreviewRef.current.height = drawPreviewRect.height * dpr;
      let ctx = drawPreviewCanvasRef.current.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx = eraserCanvasPreviewRef.current.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);

      drawPreviewCTX.current = drawPreviewCanvasRef.current.getContext("2d", {
        willReadFrequently: true,
      });
      eraserPreviewCTX.current = eraserCanvasPreviewRef.current.getContext(
        "2d",
        { willReadFrequently: true }
      );
    }, [drawPreviewCanvasRef, eraserCanvasPreviewRef]);

    useEffect(() => {
      if (!drawPreviewCanvasRef.current) return;
      drawMaskToCanvas(currentMask, drawPreviewCTX.current, {
        0: [255, 255, 255, 0],
        1: [255, 0, 0, 255],
      });
    }, [currentMask, toggleupdate]);

    if (currentMask.length === 0) return null;

    return (
      <>
        <canvas
          ref={drawPreviewCanvasRef}
          width={currentMask[0].length}
          height={currentMask.length}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 2,

            border: "1px solid black",
            // cursor: "crosshair",
            cursor: mode === "erase" && mouseInCanvas ? "none" : "crosshair",
            opacity: ".5",
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
          ref={eraserCanvasPreviewRef}
          width={currentMask[0].length}
          height={currentMask.length}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 3,
            pointerEvents: "none",
          }}
        />
      </>
    );
  }
);

export default SegmentationCanvas;
