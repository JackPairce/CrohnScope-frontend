import React from "react";
import { DataProcessingMode } from "./types";

const imagesFolder = "images";
const masksFolder = "masks";
const datasetSchemaFile = "dataset.json";
const datasetMetadataFile = "metadata.csv";

export default function SegmentationCanvas({
  processType,
}: {
  processType: DataProcessingMode;
  Component: React.ElementType;
}) {}
