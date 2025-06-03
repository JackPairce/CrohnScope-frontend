import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { SelectMode } from "../types";

export type State = "all" | "healthy" | "unhealthy" | null;

export default function LayerState({
  value,
  onChange,
  mode,
  setMode,
}: {
  value: State;
  onChange: Dispatch<SetStateAction<State>>;
  mode: SelectMode;
  setMode: (mode: SelectMode) => void;
}) {
  return (
    <div className="flex flex-row w-full items-center gap-6">
      {/* Layers Section */}
      <div className="flex items-center gap-2">
        <Image
          src="/svgs/dataset.svg"
          width={16}
          height={16}
          alt="Layers"
          className="text-gray-300"
        />
        <div className="flex bg-slate-800 rounded-md overflow-hidden">
          {["all", "healthy", "unhealthy"].map((state) => (
            <button
              key={state}
              className={`px-4 py-1 text-sm transition-colors ${
                value === state
                  ? state === "healthy"
                    ? "bg-emerald-900/40 text-emerald-300 font-medium"
                    : state === "unhealthy"
                    ? "bg-rose-900/40 text-rose-300 font-medium"
                    : "bg-slate-700 text-white font-medium"
                  : "text-gray-300 hover:bg-slate-700/50"
              }`}
              onClick={() => onChange(state as State)}
            >
              {state === "all"
                ? "All Regions"
                : state.charAt(0).toUpperCase() + state.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Interaction Mode Section */}
      <div className="flex items-center gap-2">
        <Image
          src="/svgs/hand.svg"
          width={16}
          height={16}
          alt="Interaction Mode"
          className="text-gray-300"
        />
        <div className="flex bg-slate-800 rounded-md overflow-hidden">
          {["select", "hand"].map((interactionMode) => (
            <button
              key={interactionMode}
              className={`px-4 py-1 text-sm flex items-center justify-center gap-1.5 transition-colors ${
                mode === interactionMode
                  ? "bg-indigo-900/40 text-indigo-300 font-medium"
                  : "text-gray-300 hover:bg-slate-700/50"
              }`}
              onClick={() => setMode(interactionMode as SelectMode)}
            >
              <Image
                src={`/svgs/${interactionMode}.svg`}
                width={14}
                height={14}
                alt={interactionMode}
                className={`${
                  mode === interactionMode ? "opacity-100" : "opacity-70"
                }`}
              />
              <span>
                {interactionMode.charAt(0).toUpperCase() +
                  interactionMode.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
