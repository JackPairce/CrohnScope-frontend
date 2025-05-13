"use client";
import React from "react";
import { NewMask } from "./MaskUtils";
import { Tab } from "./types";

export default function RenderTabNavigation({
  tabs,
  selectedTab,
  setSelectedTab,
  setTabs,
  overlayRef,
}: {
  tabs: Tab[];
  selectedTab: number;
  setSelectedTab: (index: number) => void;
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>;
  overlayRef: React.RefObject<HTMLCanvasElement | null>;
}) {
  return (
    <nav className="tabs">
      <div>
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={selectedTab === index ? "active" : ""}
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
              />
            ) : (
              <span>{tab.name}</span>
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
                name: `New Tab ${prev.length + 1}`,
                mask: newmask,
                isRename: true,
              },
            ]);
          }}
        ></button>
      </div>
    </nav>
  );
}
