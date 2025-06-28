import { MaskArray } from "@/components/AnnotationCanvas/types";
import apiClient from "./client";
import { components, paths } from "./types";

/**
 * Interface for diagnosis result
 */
export interface DiagnosisArea {
  x: number;
  y: number;
  width: number;
  height: number;
  severity: number;
  label: string;
}

export interface Diagnosis {
  disease: string;
  report: string; // Textual report of the diagnosis
}

export interface DiagnosisResult {
  heatmap: MaskArray;
  diagnosis: Diagnosis;
  confidence: number;
}

export type ApiDiagnosis = components["schemas"]["DiagnosisCreate"];

export const SetDiagnosis = async (
  data: paths["/diagnosis"]["post"]["requestBody"]["content"]["application/json"]
): Promise<
  paths["/diagnosis"]["post"]["responses"]["200"]["content"]["application/json"]
> => {
  const response = await apiClient.post("/diagnosis", data);
  return response.data;
};

export const GetDiagnosisByImageID = async (
  imageId: paths["/diagnosis/image/{image_id}"]["get"]["parameters"]["path"]["image_id"]
): Promise<
  paths["/diagnosis/image/{image_id}"]["get"]["responses"]["200"]["content"]["application/json"]
> => {
  const response = await apiClient.get(`/diagnosis/image/${imageId}`);
  return response.data;
};

/**
 * Submit image for diagnosis
 * @param imageFile - The image file to diagnose
 * @param patientId - Optional patient ID to associate with diagnosis
 * @returns Promise with diagnosis result
 */
export const submitDiagnosis = async (
  imageArray: paths["/ai/diagnose"]["post"]["requestBody"]["content"]["application/json"]
): Promise<
  paths["/ai/diagnose"]["post"]["responses"]["200"]["content"]["application/json"]
> => {
  const response = await apiClient.post("/ai/diagnose", imageArray);
  return response.data;
};
