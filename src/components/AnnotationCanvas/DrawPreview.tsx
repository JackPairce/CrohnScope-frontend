"use client";

import { Mask, Mode, Point, Shape } from "@/components/AnnotationCanvas/types";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  CanvasToMask,
  colorMappingToUser,
  drawMaskToCanvas,
} from "./MaskUtils";

const Red = "rgba(255, 0, 0, 1)";
const White = "rgba(255, 255, 255, 0)";

const FolderID = "1AA8UCcJfSOo4h7wagO24ShEwJEVop43s";

type Props = {
  imageDim: { width: number; height: number };
  brushSize: number;
  mode: Mode;
  mask: Mask;
  setMask: (mask: Mask) => void;
};

const SegmentationCanvas = forwardRef<HTMLCanvasElement, Props>(
  (
    {
      brushSize,
      mode,
      mask: currentMask,
      setMask,
      imageDim: { height: ImgHeight, width: ImgWidth },
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
      const scaleX = drawPreviewCanvasRef.current.width / rect.width;
      const scaleY = drawPreviewCanvasRef.current.height / rect.height;
      setLastPoint({
        x: (e.clientX - rect.left) * (mode == "draw" ? scaleX : 1),
        y: (e.clientY - rect.top) * (mode == "draw" ? scaleY : 1),
      });
    };

    const stopDrawing = async () => {
      if (!isDrawing) return;
      setIsDrawing(false);
      setLastPoint(null);
      setMask(await CanvasToMask(drawPreviewCanvasRef.current!));
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
        x: (e.clientX - rect.left) * (mode == "draw" ? scaleX : 1),
        y: (e.clientY - rect.top) * (mode == "draw" ? scaleY : 1),
      });
    };

    const draw = (e: React.MouseEvent) => {
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

    const handleResize = () => {
      if (!drawPreviewCanvasRef.current || !eraserCanvasPreviewRef.current)
        return;

      const eraserPreviewRect =
        eraserCanvasPreviewRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      drawPreviewCanvasRef.current.width = eraserPreviewRect.width * dpr;
      drawPreviewCanvasRef.current.height = eraserPreviewRect.height * dpr;
      eraserCanvasPreviewRef.current.width = eraserPreviewRect.width * dpr;
      eraserCanvasPreviewRef.current.height = eraserPreviewRect.height * dpr;
      let ctx = drawPreviewCanvasRef.current.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx = eraserCanvasPreviewRef.current.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
    };

    // useEffect(() => {
    //   if (!drawPreviewCanvasRef.current || !eraserCanvasPreviewRef.current)
    //     return;
    //   // handleResize();
    //   drawPreviewCTX.current = drawPreviewCanvasRef.current.getContext("2d", {
    //     willReadFrequently: true,
    //   });
    //   eraserPreviewCTX.current = eraserCanvasPreviewRef.current.getContext(
    //     "2d",
    //     { willReadFrequently: true }
    //   );
    // }, [drawPreviewCanvasRef, eraserCanvasPreviewRef]);

    useEffect(() => {
      if (!drawPreviewCanvasRef.current) return;
      drawPreviewCanvasRef.current.width = ImgWidth;
      drawPreviewCanvasRef.current.height = ImgHeight;

      drawMaskToCanvas(
        currentMask,
        drawPreviewCanvasRef.current,
        colorMappingToUser
      );
    }, [currentMask]);

    return (
      <>
        <canvas
          ref={drawPreviewCanvasRef}
          width={ImgWidth}
          height={ImgHeight}
          style={{
            zIndex: 2,

            border: "1px solid black",
            cursor: mode === "erase" && mouseInCanvas ? "none" : "crosshair",
            opacity: ".5",
            // imageRendering: "pixelated",
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
          onResize={handleResize}
        />
        <canvas
          ref={eraserCanvasPreviewRef}
          width={ImgWidth}
          height={ImgHeight}
          style={{
            zIndex: 3,
            pointerEvents: "none",
            // imageRendering: "pixelated",
          }}
          onResize={handleResize}
        />
      </>
    );
  }
);

export default SegmentationCanvas;
