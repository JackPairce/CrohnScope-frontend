import { useAnnotationContext } from "@/contexts/AnnotationContext";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import Loader from "../loader";
import DrawingCanvas from "./DrawPreview";
import TabNavigation from "./TabNavigation";
import ToolBar from "./ToolBar";

export default function BaseCanvas() {
  const {
    states: {
      currentImage,
      isLoading,
      imgDim,
      mode,
      currentStainView,
      filters,
    },
    actions: { setCurrentStainView },
  } = useAnnotationContext();
  if (!currentImage) return null;

  const ContainerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);

  // Add state for zoom level and panning
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [showMinimap, setShowMinimap] = useState<boolean>(false);
  const [triggerResize, setTriggerResize] = useState<boolean>(false);

  const resizeObserver = new ResizeObserver(() => {
    setTriggerResize((prev) => !prev);
  });

  useEffect(() => {
    if (ContainerRef.current && imgRef.current) {
      const OriginalimgWidth = imgRef.current.naturalWidth;
      const OriginalimgHeight = imgRef.current.naturalHeight;
      const imgWidth = imgRef.current.clientWidth;
      const imgHeight = imgRef.current.clientHeight;

      const imgRatio = imgWidth / imgHeight;
      const OriginalimgRatio = OriginalimgWidth / OriginalimgHeight;
      if (imgRatio > OriginalimgRatio) {
        ContainerRef.current.style.width = `${imgHeight * OriginalimgRatio}px`;
      } else {
        ContainerRef.current.style.height = `${imgWidth / OriginalimgRatio}px`;
      }

      // Reset zoom and position when image changes
      setZoom(1);

      // Center the image in the container
      if (canvasContainerRef.current) {
        const containerRect =
          canvasContainerRef.current.getBoundingClientRect();
        setPosition({
          x: (containerRect.width - imgWidth) / 2,
          y: (containerRect.height - imgHeight) / 2,
        });
      }
    }
  }, [currentImage.id, triggerResize]);
  // Handle mouse wheel zoom
  const zoomRef = useRef(zoom);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  const handleZoom = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY;
    const prevZoom = zoomRef.current;
    const newZoom = Math.min(
      Math.max(prevZoom + (delta > 0 ? -0.1 : 0.1), 0.5),
      5
    );

    const rect = canvasContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newPosition = {
      x: mouseX - (mouseX - positionRef.current.x) * (newZoom / prevZoom),
      y: mouseY - (mouseY - positionRef.current.y) * (newZoom / prevZoom),
    };

    // Use requestAnimationFrame for smooth zoom
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      // Directly update DOM for smoothness
      if (ContainerRef.current) {
        ContainerRef.current.style.transform = `scale(${newZoom})`;
        ContainerRef.current.style.left = `${newPosition.x}px`;
        ContainerRef.current.style.top = `${newPosition.y}px`;
      }
      // Update refs
      zoomRef.current = newZoom;
      positionRef.current = newPosition;
    });

    // Optionally, update React state at a throttled interval or on mouse up
    clearTimeout((handleZoom as any)._throttleTimeout);
    (handleZoom as any)._throttleTimeout = setTimeout(() => {
      setZoom(zoomRef.current);
      setPosition(positionRef.current);
    }, 50);
  };

  const positionRef = useRef(position);
  const animationFrameRef = useRef<number | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // Handle mouse drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left button

    // Prevent drag if clicking on ZoomControls or MiniMap
    const zoomControls = document.querySelector(".zoom-controls");
    const minimap = document.querySelector(".minimap");
    if (
      (zoomControls && zoomControls.contains(e.target as Node)) ||
      (minimap && minimap.contains(e.target as Node))
    ) {
      (e.target as HTMLElement).click();
      return;
    }
    // Left button only
    setIsDragging(true);
    setDragStart({
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y,
    });
  };

  // Handle mouse dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      // Use refs and requestAnimationFrame for smooth drag
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        // Directly update the DOM for smoothness
        if (ContainerRef.current) {
          ContainerRef.current.style.left = `${newX}px`;
          ContainerRef.current.style.top = `${newY}px`;
        }
        // Optionally, update state at a throttled interval or only on mouse up
        positionRef.current = { x: newX, y: newY };
      });
    }
  };

  // Handle mouse drag end
  const handleMouseUp = () => {
    setIsDragging(false);
    // Commit the final position to React state
    if (ContainerRef.current) {
      const left = parseFloat(ContainerRef.current.style.left || "0");
      const top = parseFloat(ContainerRef.current.style.top || "0");
      setPosition({ x: left, y: top });
    }
  };

  // Handle keyboard shortcuts for zoom
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl/Cmd + plus key to zoom in
    if ((e.ctrlKey || e.metaKey) && e.key === "+") {
      e.preventDefault();
      setZoom(Math.min(zoom + 0.2, 5));
    }

    // Ctrl/Cmd + minus key to zoom out
    if ((e.ctrlKey || e.metaKey) && e.key === "-") {
      e.preventDefault();
      setZoom(Math.max(zoom - 0.2, 0.5));
    }

    // Ctrl/Cmd + 0 to reset zoom
    if ((e.ctrlKey || e.metaKey) && e.key === "0") {
      e.preventDefault();
      setZoom(1);
      // Center the image
      if (canvasContainerRef.current && ContainerRef.current) {
        const containerRect =
          canvasContainerRef.current.getBoundingClientRect();
        const imgRect = ContainerRef.current.getBoundingClientRect();
        setPosition({
          x: (containerRect.width - imgRect.width / zoom) / 2,
          y: (containerRect.height - imgRect.height / zoom) / 2,
        });
      }
    }
  };
  // Add wheel event and keyboard listeners
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (container) {
      container.addEventListener("wheel", handleZoom, { passive: false });

      // Add keyboard event listener to the window
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleZoom);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoom, position]);

  // Show minimap when zoomed in beyond a threshold
  useEffect(() => {
    if (zoom > 1.5) {
      setShowMinimap(true);
    } else {
      setShowMinimap(false);
    }
  }, [zoom]);

  useEffect(() => {
    if (ContainerRef.current) {
      resizeObserver.observe(ContainerRef.current);
    }
    return () => {
      if (ContainerRef.current) {
        resizeObserver.unobserve(ContainerRef.current);
      }
    };
  }, [ContainerRef]);

  // Handle double click to zoom in or out
  const handleDoubleClick = (e: React.MouseEvent) => {
    // Get cursor position relative to canvas container
    const rect = canvasContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // If already zoomed in, reset zoom
    if (zoom > 1.2) {
      setZoom(1);
      // Center the image
      if (canvasContainerRef.current && ContainerRef.current) {
        const containerRect =
          canvasContainerRef.current.getBoundingClientRect();
        const imgRect = ContainerRef.current.getBoundingClientRect();
        setPosition({
          x: (containerRect.width - imgRect.width / zoom) / 2,
          y: (containerRect.height - imgRect.height / zoom) / 2,
        });
      }
    } else {
      // Zoom in to 2x at the cursor position
      const newZoom = 2;
      // Adjust position to zoom toward the cursor position
      const newPosition = {
        x: mouseX - (mouseX - position.x) * (newZoom / zoom),
        y: mouseY - (mouseY - position.y) * (newZoom / zoom),
      };

      setZoom(newZoom);
      setPosition(newPosition);
    }
  };

  // Handle clicks on the minimap for navigation
  const handleMinimapClick = (e: React.MouseEvent) => {
    const minimap = minimapRef.current;
    const container = canvasContainerRef.current;
    if (!minimap || !container) return;

    const minimapRect = minimap.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Get click position as a percentage of the minimap
    const clickXPercent = (e.clientX - minimapRect.left) / minimapRect.width;
    const clickYPercent = (e.clientY - minimapRect.top) / minimapRect.height;

    // Calculate the new position
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // Calculate where to center the view based on the click position
    const newPositionX =
      -(clickXPercent * containerWidth * zoom) + containerWidth / 2;
    const newPositionY =
      -(clickYPercent * containerHeight * zoom) + containerHeight / 2;

    setPosition({ x: newPositionX, y: newPositionY });
  };

  if (isLoading || !imgDim) {
    return <Loader message="Loading canvas data..." />;
  }

  const ZoomControls = (): ReactNode => (
    <div className="zoom-controls">
      <button
        className="zoom-button"
        onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
        title="Zoom out"
        disabled={zoom <= 0.5}
      >
        -
      </button>
      <div className="zoom-indicator">{Math.round(zoom * 100)}%</div>
      <button
        className="zoom-button"
        onClick={() => setZoom(Math.min(zoom + 0.2, 5))}
        title="Zoom in"
        disabled={zoom >= 5}
      >
        +
      </button>
      {zoom !== 1 && (
        <button
          className="zoom-button reset"
          onClick={() => {
            setZoom(1);
            // Center the image
            if (
              canvasContainerRef.current &&
              ContainerRef.current &&
              imgRef.current
            ) {
              const containerRect =
                canvasContainerRef.current.getBoundingClientRect();
              const imgNaturalAspectRatio =
                imgRef.current.naturalWidth / imgRef.current.naturalHeight;
              const containerAspectRatio =
                containerRect.width / containerRect.height;

              let imgWidth = containerRect.width;
              let imgHeight = containerRect.height;

              // Adjust dimensions to maintain aspect ratio
              if (imgNaturalAspectRatio > containerAspectRatio) {
                // Image is wider than container
                imgHeight = containerRect.width / imgNaturalAspectRatio;
              } else {
                // Image is taller than container
                imgWidth = containerRect.height * imgNaturalAspectRatio;
              }

              // Calculate the center position
              setPosition({
                x: (containerRect.width - imgWidth) / 2,
                y: (containerRect.height - imgHeight) / 2,
              });
            }
          }}
          title="Reset zoom"
        >
          ↺
        </button>
      )}
    </div>
  );
  const StainControls = (): ReactNode => (
    <div className="stain-view-controls">
      <div className="stain-view-label">View:</div>
      <div className="stain-buttons">
        <button
          className={`stain-button ${
            currentStainView === "original" ? "active" : ""
          }`}
          onClick={() => setCurrentStainView("original")}
          disabled={!currentStainView}
          title="Original image"
        >
          Original
        </button>
        <button
          className={`stain-button ${
            currentStainView === "inorm" ? "active" : ""
          }`}
          onClick={() => setCurrentStainView("inorm")}
          disabled={!currentStainView || !filters.inorm}
          title="Intensity normalized"
        >
          I-Norm
        </button>
        <button
          className={`stain-button ${
            currentStainView === "hematoxylin" ? "active" : ""
          }`}
          onClick={() => setCurrentStainView("hematoxylin")}
          disabled={!currentStainView || !filters.hematoxylin}
          title="Hematoxylin component"
        >
          H
        </button>
        <button
          className={`stain-button ${
            currentStainView === "eosin" ? "active" : ""
          }`}
          onClick={() => setCurrentStainView("eosin")}
          disabled={!currentStainView || !filters.eosin}
          title="Eosin component"
        >
          E
        </button>
        {!currentStainView && (
          <span className="loading-indicator">Loading...</span>
        )}
      </div>
    </div>
  );
  const MiniMap = () => (
    <div className="minimap" ref={minimapRef} onClick={handleMinimapClick}>
      {" "}
      <div className="minimap-image">
        <img
          src={
            (currentStainView && filters[currentStainView]) || currentImage.src
          }
          alt={`Navigation map - ${currentStainView} view`}
        />
        <div
          className="minimap-viewport"
          style={{
            width: `${100 / zoom}%`,
            height: `${100 / zoom}%`,
            transform: `translate(
                    ${
                      -position.x * (100 / (imgRef.current?.clientWidth || 1))
                    }%,
                    ${
                      -position.y * (100 / (imgRef.current?.clientHeight || 1))
                    }%
                  )`,
          }}
        ></div>
      </div>
    </div>
  );

  return (
    <>
      <TabNavigation />
      <ToolBar />
      <div
        className={`canvas-container ${mode === "hand" ? "hand-mode" : ""}`}
        ref={canvasContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={mode == "hand" ? handleMouseMove : undefined}
        onMouseUp={mode == "hand" ? handleMouseUp : undefined}
        onMouseLeave={mode == "hand" ? handleMouseUp : undefined}
        onDoubleClick={mode == "hand" ? handleDoubleClick : undefined}
      >
        {" "}
        {/* Controls bar with zoom and stain view controls */}
        <div className="canvas-controls-bar">
          <ZoomControls />
          <StainControls />
        </div>
        {showMinimap && <MiniMap />}{" "}
        <div
          className="image-container"
          ref={ContainerRef}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "0 0",
            position: "absolute",
            left: `${position.x}px`,
            top: `${position.y}px`,
            cursor: isDragging ? "grabbing" : "grab",
          }}
        >
          <img
            src={
              (currentStainView && filters[currentStainView]) ||
              currentImage.src
            }
            alt={`${currentImage.filename} - ${currentStainView} view`}
            ref={imgRef}
            onError={(e) => {
              console.error(
                `Failed to load ${currentStainView} view, falling back to original`,
                e.currentTarget.src
              );
              // If stain view fails to load, fall back to original
              if (currentStainView !== "original") {
                setCurrentStainView("original");
              }
            }}
          />
          <DrawingCanvas />
        </div>
      </div>
    </>
  );
}
