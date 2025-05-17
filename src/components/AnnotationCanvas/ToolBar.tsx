import { Mode, modes, SaveSatues } from "./types";

interface ToolBarProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  saveMasks: () => void;
  saveStatus: SaveSatues;
  isAllDone: boolean;
  MarkAllDone: () => void;
}

export default function renderToolBar({
  mode,
  setMode,
  brushSize,
  setBrushSize,
  saveMasks,
  saveStatus,
  isAllDone,
  MarkAllDone,
}: ToolBarProps) {
  return (
    <nav className="tools">
      <div className="tools-buttons">
        <div className="modes">
          {modes.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={mode === m ? "active" : ""}
            >
              {m === "draw" ? "🖌️" : "🧼"}
            </button>
          ))}
        </div>
        <label className="brush-size">
          Brush Size:
          <input
            type="range"
            min={10}
            max={100}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
          />
          <span>{brushSize}</span>
        </label>
      </div>
      {saveStatus.isModified ? (
        <button className="save" onClick={saveMasks}>
          {saveStatus.isSaving ? "Saving..." : "Save"}
        </button>
      ) : !isAllDone ? (
        <button className="save done" onClick={MarkAllDone}>
          Mark All As Done
        </button>
      ) : null}
    </nav>
  );
}
