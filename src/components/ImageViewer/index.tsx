"use client";

import { ApiImage } from "@/lib/api";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";

interface ImageViewerProps {
  image: ApiImage;
  onClose: () => void;
  onDelete: (id: number, filename: string) => Promise<boolean>;
  overlayImage?: string;
  sidePanel?: React.JSX.Element;
}

export default function ImageViewer({
  image,
  onClose,
  onDelete,
  sidePanel,
  overlayImage,
}: ImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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
            className="w-full h-full overflow-hidden cursor-move image-viewer-container"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              className="relative w-full h-full transition-transform duration-100"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: "center",
              }}
            >
              {/* <div className="relative w-fit h-fit"> */}
              <Image
                src={image.src}
                alt={image.filename}
                fill
                className="object-contain"
                draggable={false}
              />
              {/* </div> */}
              {/* Overlay positioned absolutely to cover the entire image */}
              {overlayImage && (
                <Image
                  src={overlayImage}
                  alt={"Overlay Image"}
                  fill
                  className="object-contain opacity-50 pointer-events-none"
                  draggable={false}
                />
              )}
            </div>
          </div>

          {/* Info footer */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/50 to-black/40">
            <div className="flex items-center justify-between text-white">
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
