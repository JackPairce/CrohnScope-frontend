import { ApiDisease, ApiFeature } from "@/lib/api";

export type ViewType = "view" | "edit" | "add";

export type DataType = "feature" | "disease";
export type DataItem<T extends DataType> = T extends "feature"
  ? ApiFeature
  : ApiDisease;

type ViewTextMapType = Record<ViewType, { title: string }>;

export function ViewTextMap(name: string): ViewTextMapType {
  return {
    view: {
      title: `View ${name}`,
    },
    edit: {
      title: `Edit ${name}`,
    },
    add: {
      title: `Add ${name}`,
    },
  };
}

export const TextMap: Record<
  DataType,
  { title: string; data: ViewTextMapType }
> = {
  feature: {
    title: "Feature",
    data: ViewTextMap("Feature"),
  },
  disease: {
    title: "Disease",
    data: ViewTextMap("Disease"),
  },
};
