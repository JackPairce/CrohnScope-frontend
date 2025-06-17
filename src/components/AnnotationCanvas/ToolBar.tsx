import { useAnnotationContext } from "@/contexts/AnnotationContext";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { NewMaskArray } from "./MaskUtils";
import { MaskArray, modes, ModesLabels } from "./types";

export default function ToolBar() {
  const {
    states: {
      currentImage,
      mode,
      brushSize,
      imgDim,
      tabs,
      selectedTab,
      saveStatus,
    },
    actions: {
      setMode,
      setBrushSize,
      setSaveStatus,
      triggerMaskReset,
      defaultActions: { saveMask, markDone },
      generateWithAI,
    },
  } = useAnnotationContext();
  if (!currentImage) return null;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tmpMask, setTmpMask] = useState<MaskArray>();

  // Handle closing dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Determine primary action based on current state
  const getPrimaryAction = () => {
    if (saveStatus.isModified) {
      return {
        label: saveStatus.isSaving ? "Saving..." : "Save",
        icon: "/svgs/save.svg",
        action: async () => {
          setSaveStatus((prev) => ({
            ...prev,
            isSaving: true,
          }));
          await saveMask(currentImage);
          setSaveStatus((prev) => ({
            ...prev,
            isModified: false,
            isSaving: false,
          }));
        },
        className: "save",
      };
    } else if (!currentImage.is_done) {
      // Determine the label based on available actions
      let actionLabel = "Mark Done";
      let action = async () => {
        setSaveStatus((prev) => ({
          ...prev,
          isMarkingDone: true,
        }));
        await markDone(currentImage.id);
        setSaveStatus((prev) => ({
          ...prev,
          isMarkingDone: false,
        }));
      };

      if (saveStatus.isMarkingDone) {
        actionLabel = "Marking...";
        action = async () => {};
      }

      return {
        label: actionLabel,
        icon: "/svgs/checkmark.svg",
        action: action,
        className: "done",
      };
    }
    return null;
  };

  const handleGenerate = async () => {
    if (isGenerating) return; // Prevent multiple clicks
    setIsGenerating(true);
    try {
      setTmpMask(
        NewMaskArray(currentImage.mask.length, currentImage.mask[0].length)
      );
      await generateWithAI();
      setIsGenerated(true);
    } catch (error) {
      console.error("Error generating with AI:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const primaryAction = getPrimaryAction();

  return (
    <nav className="tools">
      <div className="tools-buttons">
        {" "}
        <div className="modes">
          {" "}
          {/* Hand tool (for panning) */}
          <button
            onClick={() => setMode("hand")}
            className={mode === "hand" ? "active" : ""}
            title={ModesLabels.hand}
          >
            <Image
              src="/svgs/hand.svg"
              alt="Hand tool"
              width={24}
              height={24}
              className="svg-icon"
            />
          </button>
          {/* Drawing and erasing tools */}
          {modes
            .filter((m) => m !== "hand")
            .map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={mode === m ? "active" : ""}
                title={ModesLabels[m]}
              >
                <Image
                  src={`/svgs/${m}.svg`}
                  alt={m}
                  width={24}
                  height={24}
                  className={`svg-icon${m == "erase" ? "-colored" : ""}`}
                />
              </button>
            ))}
        </div>
        {mode == "erase" && (
          <div className="brush-size-container">
            <div className="brush-size-icon">
              <Image
                src="/svgs/brush-size.svg"
                alt="Brush Size"
                width={20}
                height={20}
                className="svg-icon"
                style={{
                  // apply a blue filer
                  filter:
                    "invert(48%) sepia(79%) saturate(2476%) hue-rotate(190deg) brightness(118%) contrast(95%)",
                }}
              />
            </div>
            <div className="brush-size">
              <div className="brush-size-label">
                <span>Size</span>
                <span className="brush-size-value">{brushSize}</span>
              </div>
              <input
                type="range"
                className="brush-size-slider"
                min={10}
                max={100}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
              />
              <div
                className="brush-size-preview"
                style={{
                  width: `${brushSize / 6.5}px`,
                  height: `${brushSize / 6.5}px`,
                }}
              ></div>
            </div>
          </div>
        )}
        {/* Reset mask button */}
        <button
          className="reset-mask-btn group relative flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={async () => {
            if (!imgDim) return;
            if (
              confirm("Reset this mask to empty? This action cannot be undo.")
            ) {
              triggerMaskReset();
            }
          }}
          title="Reset Mask"
        >
          <Image
            src="/svgs/clear-mask.svg"
            alt="Reset Mask"
            width={28}
            height={28}
            className="svg-icon"
          />
          <span className="tooltip">Reset Mask</span>
        </button>
      </div>

      <div className="ai-generation-container">
        {isGenerated ? (
          <div className="ai-result-panel">
            <div className="ai-result-header">
              <span className="ai-result-title">
                <Image
                  src="/svgs/model.svg"
                  alt="AI"
                  width={18}
                  height={18}
                  className="svg-icon-colored"
                />
                AI Generation Complete
              </span>
              <div className="ai-result-badge success">Ready for Review</div>
            </div>

            <div className="ai-action-buttons">
              <button
                className="ai-button ai-keep-all"
                onClick={() => {
                  setIsGenerated(false);
                  setTmpMask([]);
                }}
              >
                <Image
                  src="/svgs/checkmark.svg"
                  alt="Keep All"
                  width={16}
                  height={16}
                  className="svg-icon"
                />
                Keep All
              </button>

              {/* <button
                className="ai-button ai-discard-current"
                onClick={() => {
                  setTabs((prev) =>
                    prev.map((tab, index) => ({
                      ...tab,
                      mask:
                        index === selectedTab
                          ? tmpMask[selectedTab] || tab.mask
                          : tab.mask,
                    }))
                  );
                }}
              >
                <Image
                  src="/svgs/clear-mask.svg"
                  alt="Discard Current"
                  width={16}
                  height={16}
                  className="svg-icon"
                />
                Discard Current
              </button> */}

              <button
                className="ai-button ai-discard-all"
                onClick={() => {
                  setIsGenerated(false);
                  setTmpMask([]);
                }}
              >
                <Image
                  src="/svgs/delete.svg"
                  alt="Discard All"
                  width={16}
                  height={16}
                  className="svg-icon"
                />
                Discard All
              </button>
            </div>
          </div>
        ) : !isGenerating ? (
          <button className="ai-generate-button" onClick={handleGenerate}>
            <Image
              src="/svgs/model.svg"
              alt="AI"
              width={18}
              height={18}
              className="svg-icon-colored"
            />
            <span>Generate with AI</span>
          </button>
        ) : (
          <div className="ai-generating">
            <div className="ai-loader">
              <div className="ai-loader-spinner"></div>
            </div>
            <div className="ai-generating-text">
              <span className="ai-generating-title">Generating Masks</span>
              <span className="ai-generating-subtitle">
                This may take a moment...
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="action-buttons-container" ref={dropdownRef}>
        {primaryAction && (
          <button
            className={`primary-action-btn ${primaryAction.className}`}
            onClick={() => primaryAction.action()}
            disabled={saveStatus.isSaving || saveStatus.isMarkingDone}
          >
            <Image
              src={primaryAction.icon}
              alt={primaryAction.label}
              width={20}
              height={20}
              className="svg-icon"
            />{" "}
            <span>{primaryAction.label}</span>
            <div
              className="dropdown-toggle"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
            >
              <Image
                src="/svgs/chevron.svg"
                alt="More options"
                width={14}
                height={14}
                className={`chevron-icon ${isDropdownOpen ? "rotate" : ""}`}
              />
            </div>
          </button>
        )}
        {isDropdownOpen && (
          <div className="actions-dropdown">
            <button
              onClick={async () => {
                setSaveStatus((prev) => ({
                  ...prev,
                  isSaving: true,
                }));
                // save
                await saveMask(currentImage);

                setSaveStatus((prev) => ({
                  ...prev,
                  isMarkingDone: true,
                  isSaving: false,
                }));
                // mark done
                await markDone(currentImage.id);
                setSaveStatus((prev) => ({
                  ...prev,
                  isModified: false,
                  isMarkingDone: false,
                }));
                setIsDropdownOpen(false);
              }}
              className="dropdown-item"
              disabled={saveStatus.isSaving || saveStatus.isMarkingDone}
            >
              <Image
                src="/svgs/save.svg"
                alt="Save and Mark"
                width={18}
                height={18}
                className="svg-icon"
              />
              <span>Save and Mark</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
