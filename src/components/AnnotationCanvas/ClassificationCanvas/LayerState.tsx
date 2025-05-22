import { Dispatch, SetStateAction } from "react";

export type State = "all" | "healthy" | "unhealthy" | null;
export default function LayerState({
  value,
  onChange,
}: {
  value: State;
  onChange: Dispatch<SetStateAction<State>>;
}) {
  return (
    <div className="layer-state">
      <button
        className={value === "all" ? "active" : ""}
        onClick={() => onChange("all")}
      >
        All
      </button>
      <button
        className={value === "healthy" ? "active" : ""}
        onClick={() => onChange("healthy")}
      >
        Healthy
      </button>
      <button
        className={value === "unhealthy" ? "active" : ""}
        onClick={() => onChange("unhealthy")}
      >
        Unhealthy
      </button>
    </div>
  );
}
