import { useAnnotationContext } from "@/contexts/AnnotationContext";
import { getRegions } from "@/lib/api";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import ContextMenu, { ContextMenuItem } from "../ContextMenu";
import Loader from "../loader";
import Toast, { ToastContainer, ToastType } from "../Toast";
import DrawingCanvas, { extractTargetMask } from "./DrawPreview";
import TabNavigation from "./TabNavigation";
import ToolBar from "./ToolBar";
import { MaskArray } from "./types";

export default function BaseCanvas() {
  const {
    states: {
      tabs,
      currentImage,
      isLoading,
      imgDim,
      mode,
      currentStainView,
      filters,
      selectedTab,
    },
    actions: { setMask, setCurrentStainView },
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
  const [wasDrawing, setWasDrawing] = useState<boolean>(false);

  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: ToastType }>
  >([]);
  const addToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };
  const [currentMask, setCurrentMask] = useState<MaskArray>([]);
  const [isThereRegion, setIsThereRegion] = useState<boolean>(false);
  const [isMaskLoading, setIsMaskLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (wasDrawing) {
      setWasDrawing(false);
      return; // Skip mask extraction if just drawing
    }
    setIsMaskLoading(true);
    setTimeout(() => {
      const mask = extractTargetMask(
        currentImage.mask as MaskArray,
        tabs[selectedTab].feature_id
      );
      setIsThereRegion(
        [...new Set(mask.map((row) => Array.from(row)).flat())].filter(
          (value) => value !== 0
        ).length > 0
      );
      if (!cancelled) {
        setCurrentMask(mask);
        setIsMaskLoading(false);
      }
    }, 0);
    return () => {
      cancelled = true;
    };
  }, [currentImage, selectedTab]);

  const ContextMenuTools: ContextMenuItem[] = [
    {
      type: "dropdown",
      label: "Move To",
      items: (() => {
        // filter current mask to get the region with the same feature_id as tabId
        if (!isThereRegion) {
          return "There's no region in current mask.";
        }
        return tabs
          .filter((tab) => tab.feature_id !== tabs[selectedTab].feature_id)
          .map((tab) => ({
            type: "action",
            label: tab.name,
            onClick: async () => {
              if (!canvasContainerRef.current || !imgRef.current) return;
              const canvasRect =
                canvasContainerRef.current.getBoundingClientRect();

              // Get relative position to the canvas container
              const relativeX = contextMenuPosition.x - canvasRect.left;
              const relativeY = contextMenuPosition.y - canvasRect.top;

              // Get current displayed image size
              const displayWidth = imgRef.current.clientWidth;
              const displayHeight = imgRef.current.clientHeight;

              // Calculate the scale factor between displayed size and actual image size
              const scaleX = imgDim.width / displayWidth;
              const scaleY = imgDim.height / displayHeight;

              // Adjust coordinates relative to container position and zoom, then scale to image dimensions
              const imageX = Math.round(
                ((relativeX - position.x) / zoom) * scaleX
              );
              const imageY = Math.round(
                ((relativeY - position.y) / zoom) * scaleY
              );

              // get region from current mask
              if (!currentImage || !currentImage.mask) {
                console.warn(
                  "No current image or mask set, skipping region move."
                );
                return;
              }
              await (async (): Promise<void> => {
                // check if selected coordinates are not empty
                if (currentMask[imageY][imageX] === 0) {
                  addToast(
                    "No region found at the selected position.",
                    "warning"
                  );
                  return;
                }
                // get labeled region
                let labeledRegion = await getRegions(
                  currentMask.map((row) => Array.from(row))
                );
                // get label value of selected region
                const labelValue = labeledRegion[imageY][imageX];
                if (!labelValue) {
                  addToast(
                    "No label found for the selected region.",
                    "warning"
                  );
                  return;
                }
                // set non-selected pixels to 0
                labeledRegion = labeledRegion.map((row) =>
                  row.map((value) => (value == labelValue ? tab.feature_id : 0))
                );
                const resultMask = currentImage.mask
                  .map((row, y) =>
                    Array.from(row).map((value, x) =>
                      labeledRegion[y][x] == 0 ? value : tab.feature_id
                    )
                  )
                  .map((row) => Uint8Array.from(row));
                setMask(resultMask);
                setCurrentMask(
                  extractTargetMask(resultMask, tabs[selectedTab].feature_id)
                );
                return;
              })();
              setShowContextMenu(false);
            },
          }));
      })(),
    },
  ];

  // Handle mouse wheel zoom
  const zoomRef = useRef(zoom);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  const handleZoom = (e: WheelEvent) => {
    e.preventDefault();
    if (showContextMenu) setShowContextMenu(false);
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
    if (showContextMenu) {
      const element = e.target as HTMLElement;
      // Check  if the click is on a context menu item
      if (element.closest("canvas")) {
        setShowContextMenu(false);
      }
      return;
    }

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
    if (!isDragging) return;
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
    if (!ContainerRef.current || !imgRef.current || !canvasContainerRef.current)
      return;
    // Ensure ContainerRef matches the displayed image dimensions based on imgDim and container size, preserving aspect ratio.
    const container = canvasContainerRef.current;
    if (!container || !imgRef.current || !ContainerRef.current) return;

    // Calculate aspect ratios
    const imgAspect = imgDim.width / imgDim.height;
    const containerRect = container.getBoundingClientRect();
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

    // Reset zoom and position when image changes
    setZoom(1);

    // Center the image in the container
    setPosition({
      x: (containerRect.width - ContainerRef.current.clientWidth) / 2,
      y: (containerRect.height - ContainerRef.current.clientHeight) / 2,
    });

    container.addEventListener("wheel", handleZoom, {
      passive: false,
    });

    // Add keyboard event listener to the window
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      container.removeEventListener("wheel", handleZoom);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentImage.id]);

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

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    // Set menu position using screen coordinates
    setContextMenuPosition({
      x: e.clientX,
      y: e.clientY,
    });

    setShowContextMenu(true);
  };

  return (
    <>
      <TabNavigation />
      <ToolBar />
      <div
        className={`canvas-container ${mode === "hand" ? "hand-mode" : ""}`}
        ref={canvasContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={mode == "hand" ? handleMouseMove : undefined}
        onMouseUp={mode == "hand" ? handleMouseUp : () => setWasDrawing(true)}
        onMouseLeave={mode == "hand" ? handleMouseUp : undefined}
        onDoubleClick={mode == "hand" ? handleDoubleClick : undefined}
        onContextMenu={handleContextMenu}
      >
        {(isLoading || isMaskLoading) && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 20,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "all",
            }}
          >
            <Loader message="Loading Mask..." />
          </div>
        )}{" "}
        {/* Controls bar with zoom and stain view controls */}
        <div className="canvas-controls-bar">
          <ZoomControls />
          <StainControls />
        </div>
        {zoom > 1.5 && <MiniMap />}{" "}
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
          <DrawingCanvas currentMask={currentMask} />
        </div>
        {showContextMenu && (
          <ContextMenu
            items={ContextMenuTools}
            position={contextMenuPosition}
          />
        )}
      </div>

      <ToastContainer>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </ToastContainer>
    </>
  );
}
