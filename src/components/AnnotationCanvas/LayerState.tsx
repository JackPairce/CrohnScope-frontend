import { Dispatch, SetStateAction } from "react";

export type State = "all" | "healthy" | "unhealthy" | null;
export default function LayerState({
  stater,
}: {
  stater: [State, Dispatch<SetStateAction<State>>];
}) {
  return <div>LayerState</div>;
}
