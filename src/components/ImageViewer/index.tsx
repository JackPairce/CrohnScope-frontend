"use client";

import { ApiFeature, ApiImage } from "@/lib/api";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { drawMaskToCanvas } from "../AnnotationCanvas/MaskUtils";

interface ImageViewerProps {
  image: Omit<ApiImage, "is_done"> & { is_done?: boolean };
  onClose: () => void;
  onDelete: (id: number, filename: string) => Promise<boolean>;
  features?: ApiFeature[];
  sidePanel?: React.JSX.Element;
}
type ViewMode = "None" | "HeatMap" | "Features";

export default function ImageViewer({
  image,
  onClose,
  onDelete,
  sidePanel,
  features,
}: ImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const RedCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const GreenCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const ContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(
    features ? "HeatMap" : "None"
  );

  // Ref array for feature canvases
  const featureCanvasRefs = React.useRef<(HTMLCanvasElement | null)[]>([]);

  function getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 80%, 60%)`;
  }

  useEffect(() => {
    const mask = image.mask;
    if (!RedCanvasRef.current || !mask || !ContainerRef.current) return;

    // Calculate aspect ratios
    const imgAspect = mask[0].length / mask.length;
    const containerRect = ContainerRef.current.getBoundingClientRect();
    const containerAspect = containerRect.width / containerRect.height;

    let displayWidth = containerRect.width;
    let displayHeight = containerRect.height;

    // Adjust dimensions to fit image inside container while preserving aspect ratio
    if (imgAspect > containerAspect) {
      // Image is wider than container
      displayWidth = containerRect.width;
      displayHeight = displayWidth / imgAspect;
    } else {
      // Image is taller than container
      displayHeight = containerRect.height;
      displayWidth = displayHeight * imgAspect;
    }

    // Set ContainerRef size to match the displayed image dimensions
    const imageContainer = ContainerRef.current;
    imageContainer.style.width = `${displayWidth}px`;
    imageContainer.style.height = `${displayHeight}px`;

    // Center the image in the container
    setPosition({
      x: (containerRect.width - ContainerRef.current.clientWidth) / 2,
      y: (containerRect.height - ContainerRef.current.clientHeight) / 2,
    });

    if (features) {
      const redFeatures = features
        .filter((f) => f.diseases.length > 0)
        .map((f) => f.id);
      const greenFeatures = features
        .filter((f) => f.diseases.length === 0)
        .map((f) => f.id);

      // Draw mask with features
      // Draw mask for red features (features with diseases)
      drawMaskToCanvas(
        mask.map((row, y) =>
          Uint8Array.from(
            row.map((value, x) =>
              // Check if any redFeature covers this pixel
              redFeatures.includes(value) ? 1 : 0
            )
          )
        ),
        RedCanvasRef.current
      );
      if (GreenCanvasRef.current)
        drawMaskToCanvas(
          mask.map((row, y) =>
            Uint8Array.from(
              row.map((value, x) =>
                // Check if any greenFeature covers this pixel
                greenFeatures.includes(value) ? 1 : 0
              )
            )
          ),
          GreenCanvasRef.current
        );
    } else
      drawMaskToCanvas(
        mask.map((row) =>
          Uint8Array.from(row.map((value) => (value > 0 ? 1 : 0)))
        ),
        RedCanvasRef.current
      );
  }, [image.mask]);

  useEffect(() => {
    const mask = image.mask;
    if (!mask || !features) return;
    features.forEach((feature, index) => {
      const canvas = featureCanvasRefs.current[index];
      if (!canvas) return;
      drawMaskToCanvas(
        mask.map((row) =>
          Uint8Array.from(row.map((value) => (value === feature.id ? 1 : 0)))
        ),
        canvas
      );
    });
  }, [image.mask, features]);

  useEffect(() => {}, [viewMode]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setScale((s) => Math.min(s + 0.1, 3));
      if (e.key === "-") setScale((s) => Math.max(s - 0.1, 0.5));
      if (e.key === "0") {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Handle mouse interactions
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle wheel zoom with non-passive event listener
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setScale((s) => {
      const delta = -e.deltaY * 0.002; // Smoothed zoom sensitivity
      return Math.max(0.5, Math.min(3, s + delta));
    });
  }, []);

  // Set up non-passive wheel event listener
  useEffect(() => {
    const container = document.querySelector(".image-viewer-container");
    if (container) {
      const wheelListener = (e: Event) => {
        if (e instanceof WheelEvent) {
          handleWheel(e);
        }
      };
      container.addEventListener("wheel", wheelListener, { passive: false });
      return () => container.removeEventListener("wheel", wheelListener);
    }
  }, [handleWheel]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="absolute inset-4 flex flex-col lg:flex-row gap-4 p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex-grow bg-gray-900/90 rounded-lg overflow-hidden">
          {/* Toolbar */}
          <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setScale((s) => Math.max(s - 0.1, 0.5))}
                className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <div className="text-white backdrop-blur-sm bg-black/30 px-3 py-1 rounded-full">
                {Math.round(scale * 100)}%
              </div>
              <button
                onClick={() => setScale((s) => Math.min(s + 0.1, 3))}
                className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
              <button
                onClick={() => {
                  setScale(1);
                  setPosition({ x: 0, y: 0 });
                }}
                className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l-4 4m0 0l-4-4m4 4V3"
                  />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              {!sidePanel && (
                <button
                  onClick={() => onDelete(image.id, image.filename)}
                  className="px-4 py-2 rounded-full bg-red-600/90 hover:bg-red-600 text-white text-sm backdrop-blur-sm"
                >
                  Delete Image
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Image container */}
          <div
            ref={ContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="relative w-full h-full transition-transform duration-100 overflow-hidden cursor-move image-viewer-container"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: "center",
            }}
          >
            <Image
              src={image.src}
              alt={image.filename}
              fill
              className="object-contain"
              draggable={false}
            />
            {image.mask && viewMode != "None" && (
              <>
                {viewMode == "HeatMap" ? (
                  <>
                    <canvas
                      className="absolute inset-0 pointer-events-none"
                      ref={RedCanvasRef}
                      width={image.mask ? image.mask[0].length : 0}
                      height={image.mask ? image.mask.length : 0}
                      style={{
                        width: "100%",
                        height: "100%",
                        opacity: 0.5,
                        zIndex: 1,
                        filter:
                          "brightness(0) saturate(100%) invert(13%) sepia(72%) saturate(6705%) hue-rotate(352deg) brightness(95%) contrast(87%)",
                      }}
                    />
                    {features && (
                      <canvas
                        className="absolute inset-0 pointer-events-none"
                        ref={GreenCanvasRef}
                        width={image.mask[0].length}
                        height={image.mask.length}
                        style={{
                          width: "100%",
                          height: "100%",
                          opacity: 0.5,
                          zIndex: 2,
                          filter:
                            "brightness(0) saturate(100%) invert(49%) sepia(55%) saturate(579%) hue-rotate(100deg) brightness(94%) contrast(83%)",
                        }}
                      />
                    )}
                  </>
                ) : (
                  features &&
                  features.map((feature, index) => {
                    return (
                      <canvas
                        key={feature.id}
                        ref={(el) => {
                          featureCanvasRefs.current[index] = el;
                        }}
                        className="absolute inset-0 pointer-events-none"
                        width={image.mask![0].length}
                        height={image.mask!.length}
                        style={{
                          width: "100%",
                          height: "100%",
                          opacity: 0.5,
                          zIndex: 1 + index,
                          filter: `brightness(0) saturate(100%) invert(43%) sepia(90%) saturate(547%) hue-rotate(${Math.floor(
                            (360 / features.length) * index
                          )}deg) brightness(95%) contrast(88%)`,
                        }}
                      />
                    );
                  })
                )}
              </>
            )}
          </div>

          {/* Info footer */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/50 to-black/40">
            <div className="flex items-center justify-between text-white">
              {features && (
                <div className="flex items-center gap-2">
                  <label className="text-sm">View Mode:</label>
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as ViewMode)}
                    className="bg-gray-800 text-white rounded px-2 py-1"
                  >
                    <option value="HeatMap">Heat Map</option>
                    <option value="Features">Show Features</option>
                    <option value="None">None</option>
                  </select>
                </div>
              )}
              {image.is_done != undefined && (
                <div className="text-sm opacity-75">
                  {image.filename}
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      image.is_done
                        ? "bg-emerald-700 text-emerald-50"
                        : "bg-amber-700 text-amber-50"
                    }`}
                  >
                    {image.is_done ? "Processed" : "Pending"}
                  </span>
                </div>
              )}
              <div className="text-xs opacity-50">
                Scroll to zoom • Drag to pan • ESC to close
              </div>
            </div>
          </div>
        </div>

        {/* Optional Element (Form) */}
        {sidePanel && (
          <div className="lg:w-96 bg-gray-900/90 rounded-lg overflow-y-auto">
            {sidePanel}
          </div>
        )}
      </div>
    </div>
  );
}
