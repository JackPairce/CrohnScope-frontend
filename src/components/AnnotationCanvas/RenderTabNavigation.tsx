"use client";
import Image from "next/image";
import React, { useState } from "react";
import { SetMaskDone } from "./api";
import { NewMask } from "./MaskUtils";
import { Tab } from "./types";

export default function RenderTabNavigation({
  tabs,
  selectedTab,
  setSelectedTab,
  setTabs,
  overlayRef,
  isMarkingAllDone,
}: {
  tabs: Tab[];
  selectedTab: number;
  setSelectedTab: (index: number) => void;
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>;
  overlayRef: React.RefObject<HTMLCanvasElement | null>;
  isMarkingAllDone: boolean;
}) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isMarkingDone, setIsMarkingDone] = useState(false);
  const [tabToDelete, setTabToDelete] = useState<number | null>(null);

  const handleDeleteTab = (index: number) => {
    setTabToDelete(index);
    setShowConfirmDialog(true);
  };

  const confirmDelete = () => {
    if (tabToDelete !== null) {
      // TODO: Add backend API call to delete the tab data from the database
      setTabs((prev) => {
        const newTabs = [...prev];
        newTabs.splice(tabToDelete, 1);
        return newTabs;
      });

      // If we're deleting the selected tab or one before it, adjust the selected tab
      if (tabToDelete <= selectedTab) {
        setSelectedTab(Math.max(0, selectedTab - 1));
      }
    }
    setShowConfirmDialog(false);
    setTabToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setTabToDelete(null);
  };

  return (
    <nav className="tabs">
      <div className="tab-buttons">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`tab-button ${selectedTab === index ? "active" : ""} ${
              tab.isDone ? "done" : "not-done"
            } ${
              tabs[selectedTab].cell_id == tab.cell_id && isMarkingDone
                ? "is-processing"
                : ""
            } `}
            onClick={() => setSelectedTab(index)}
            onDoubleClick={() => {
              setTabs((prev) => {
                prev[index].isRename = true;
                return [...prev];
              });
            }}
          >
            {tab.isRename ? (
              <input
                type="text"
                className="tab-rename-input"
                value={tab.name}
                onChange={(e) => {
                  setTabs((prev) => {
                    prev[index].name = e.target.value;
                    return [...prev];
                  });
                }}
                onBlur={() => {
                  setTabs((prev) => {
                    prev[index].isRename = false;
                    return [...prev];
                  });
                }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <>
                <span>{tab.name}</span>
                <span
                  className="close-tab-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTab(index);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      handleDeleteTab(index);
                    }
                  }}
                  role="button"
                  aria-label="Close tab"
                  tabIndex={0}
                >
                  ×
                </span>
              </>
            )}
          </button>
        ))}
        {/* add button */}
        <button
          className="add-tab"
          onClick={async () => {
            const newmask = await NewMask(
              overlayRef.current?.width!,
              overlayRef.current?.height!
            );
            setTabs((prev) => [
              ...prev,
              {
                cell_id: NaN,
                mask_id: NaN,
                name: `New Tab ${prev.length + 1}`,
                mask: newmask,
                isRename: true,
                isDone: false,
              },
            ]);
          }}
        ></button>
        {showConfirmDialog && (
          <div className="confirm-dialog-backdrop">
            <div className="confirm-dialog">
              <h3>Confirm Deletion</h3>
              <p>
                This action can delete many important data. Are you sure you
                want to continue?
              </p>
              <div className="confirm-dialog-buttons">
                <button className="cancel-btn" onClick={cancelDelete}>
                  Cancel
                </button>
                <button className="delete-btn" onClick={confirmDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* mark current tab as done */}
      {!isMarkingAllDone && !tabs[selectedTab].isDone && (
        <button
          className="save done"
          onClick={() =>
            (async () => {
              setIsMarkingDone(true);
              await SetMaskDone(tabs[selectedTab].mask_id);
              setTabs((prev) => {
                prev[selectedTab].isDone = true;
                return [...prev];
              });
              setIsMarkingDone(false);
            })()
          }
        >
          <Image
            src="/svgs/checkmark.svg"
            alt="Mark Done"
            width={24}
            height={24}
            className="svg-icon"
          />
          <span>{isMarkingDone ? "Saving..." : "Mark Mask as Done"}</span>
        </button>
      )}
    </nav>
  );
}
