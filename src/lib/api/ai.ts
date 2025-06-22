//
import apiClient from "./client";
import { paths } from "./types";

/**
 * Interface for AI model status information
 */
export interface ModelStatus {
  isOnline: boolean;
  isTraining: boolean;
  accuracy: number;
  lastTrainingDate: string;
}

/**
 * Get AI model status
 * @returns Promise with the model status
 */
export const getModelStatus = async (): Promise<ModelStatus> => {
  const response = await apiClient.get<ModelStatus>("/ai/status");
  return response.data;
};

/**
 * Start model training
 * @returns Promise with training status
 */
export const startTraining = async (): Promise<{ message: string }> => {
  const response = await apiClient.post("/ai/train");
  return response.data;
};

/**
 * Stop model training
 * @returns Promise with status message
 */
export const stopTraining = async (): Promise<{ message: string }> => {
  const response = await apiClient.post("/ai/stop-training");
  return response.data;
};

export const generateMask = async (
  imageId: paths["/ai/generate-mask/{image_id}"]["get"]["parameters"]["path"]["image_id"]
): Promise<
  paths["/ai/generate-mask/{image_id}"]["get"]["responses"]["200"]["content"]["application/json"]
> => {
  const response = await apiClient.get(`/ai/generate-mask/${imageId}`);
  return response.data;
};
