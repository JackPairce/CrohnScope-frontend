"use client";
//

import { DiagnosisResult } from "@/lib/api";
import { useCallback, useEffect, useRef, useState } from "react";

interface DiagnosisImageViewerProps {
  urls: {
    original: string;
    inorm?: string;
    hematoxylin?: string;
    eosin?: string;
  };
  heatmapUrl: string;
  diagnosisResult: DiagnosisResult;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
}

type ViewMode = "original" | "heatmap" | "inorm" | "hematoxylin" | "eosin";

export default function DiagnosisImageViewer({
  heatmapUrl,
  urls,
  diagnosisResult,
  showHeatmap,
  onToggleHeatmap,
}: DiagnosisImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showAreasOverlay, setShowAreasOverlay] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("original");

  // Reference to the heatmap canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [heatmapImage, setHeatmapImage] = useState<HTMLImageElement | null>(
    null
  );

  // Update viewMode when heatmap toggle changes
  useEffect(() => {
    if (showHeatmap) {
      setViewMode("heatmap");
      setShowAreasOverlay(false);
    } else {
      setViewMode("original");
    }
  }, [showHeatmap]);

  // Get current view URL based on mode
  const getCurrentViewUrl = useCallback(() => {
    switch (viewMode) {
      case "heatmap":
        return heatmapUrl;
      case "inorm":
        return urls.inorm || urls.original;
      case "hematoxylin":
        return urls.hematoxylin || urls.original;
      case "eosin":
        return urls.eosin || urls.original;
      default:
        return urls.original;
    }
  }, [viewMode, urls]);

  // Load and render heatmap
  useEffect(() => {
    if (!heatmapUrl) return;

    const img = new Image();
    img.src = heatmapUrl;
    img.onload = () => {
      setHeatmapImage(img);
      renderHeatmap(img);
    };
  }, [heatmapUrl]);

  // Render heatmap to canvas
  const renderHeatmap = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the heatmap with blend mode
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Add color overlay
    ctx.globalCompositeOperation = "overlay";
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "rgba(0, 0, 255, 0.3)"); // Cool blue for low intensity
    gradient.addColorStop(0.5, "rgba(255, 255, 0, 0.3)"); // Yellow for medium
    gradient.addColorStop(1, "rgba(255, 0, 0, 0.3)"); // Red for high intensity
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Reset composite operation
    ctx.globalCompositeOperation = "source-over";
  }, []);

  // Update heatmap when scale/position changes
  useEffect(() => {
    if (heatmapImage && showHeatmap) {
      renderHeatmap(heatmapImage);
    }
  }, [scale, position, showHeatmap, heatmapImage, renderHeatmap]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") setScale((s) => Math.min(s + 0.1, 3));
      if (e.key === "-") setScale((s) => Math.max(s - 0.1, 0.5));
      if (e.key === "0") {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
      if (e.key === "h") onToggleHeatmap();
      if (e.key === "a") setShowAreasOverlay(!showAreasOverlay);
      // New shortcuts for stain views
      if (e.key === "1") setViewMode("original");
      if (e.key === "2") setViewMode("inorm");
      if (e.key === "3") setViewMode("hematoxylin");
      if (e.key === "4") setViewMode("eosin");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onToggleHeatmap, showAreasOverlay]);

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

  // Handle wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setScale((s) => {
      const delta = -e.deltaY * 0.002; // Smoothed zoom sensitivity
      return Math.max(0.5, Math.min(3, s + delta));
    });
  }, []);

  // Set up non-passive wheel event listener
  useEffect(() => {
    const container = document.querySelector(
      ".diagnosis-image-viewer-container"
    );
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
    <div className="diagnosis-image-viewer">
      {/* Image container */}
      <div
        className="diagnosis-image-viewer-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="image-wrapper"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          {/* Base image layer */}
          <img
            src={getCurrentViewUrl()}
            alt="Diagnosis Image"
            className="diagnosis-image"
            draggable={false}
            onLoad={(e) => {
              const img = e.currentTarget;
              const canvas = canvasRef.current;
              if (canvas) {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                if (heatmapImage) {
                  renderHeatmap(heatmapImage);
                }
              }
            }}
          />

          {/* Heatmap overlay layer */}
          <canvas
            ref={canvasRef}
            className={`heatmap-canvas ${showHeatmap ? "visible" : ""}`}
          />
        </div>
      </div>

      {/* Image controls and info footer */}
      <div className="image-viewer-footer">
        <div className="view-controls">
          {/* Main view group */}
          <div className="view-group">
            <button
              className={`view-btn ${viewMode === "original" ? "active" : ""}`}
              onClick={() => setViewMode("original")}
              title="Original Image (1)"
            >
              Original
            </button>
            <button
              className={`view-btn ${viewMode === "inorm" ? "active" : ""}`}
              onClick={() => setViewMode("inorm")}
              title="Intensity Normalized (2)"
              disabled={!urls?.inorm}
            >
              I-Norm {!urls?.inorm && "•"}
            </button>
            <button
              className={`view-btn ${
                viewMode === "hematoxylin" ? "active" : ""
              }`}
              onClick={() => setViewMode("hematoxylin")}
              title="Hematoxylin (3)"
              disabled={!urls?.hematoxylin}
            >
              H {!urls?.hematoxylin && "•"}
            </button>
            <button
              className={`view-btn ${viewMode === "eosin" ? "active" : ""}`}
              onClick={() => setViewMode("eosin")}
              title="Eosin (4)"
              disabled={!urls?.eosin}
            >
              E {!urls?.eosin && "•"}
            </button>
          </div>

          {/* Heatmap toggle */}
          <div className="heatmap-toggle">
            <span className="toggle-label">Heatmap</span>
            <button
              className={`toggle-switch ${showHeatmap ? "active" : ""}`}
              onClick={() => {
                setViewMode(showHeatmap ? "original" : "heatmap");
                onToggleHeatmap();
              }}
              title="Toggle Heatmap (H)"
              aria-label="Toggle heatmap overlay"
              role="switch"
              aria-checked={showHeatmap}
            />
          </div>
        </div>

        <div className="footer-info">
          <div className="image-type">
            {viewMode === "original"
              ? "Original Image"
              : viewMode === "heatmap"
              ? "Intensity Heatmap"
              : viewMode === "inorm"
              ? "Intensity Normalized"
              : viewMode === "hematoxylin"
              ? "Hematoxylin Stain"
              : viewMode === "eosin"
              ? "Eosin Stain"
              : "Original Image"}
          </div>
          <div className="zoom-info">Zoom: {Math.round(scale * 100)}%</div>
        </div>
      </div>
    </div>
  );
}
