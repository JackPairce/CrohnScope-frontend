import apiClient from "./client";
import { components, paths } from "./types";

// Types
export type ApiFeature = components["schemas"]["ApiFeature"];

/**
 * Get Features for an image
 * @param imageId - The ID of the image
 * @returns Promise with Features data
 */
export const getFeatures = async (): Promise<ApiFeature[]> => {
  const response = await apiClient.get(`/features/all`);
  return response.data;
};

export const addFeatures = async (
  features: paths["/features/save"]["post"]["requestBody"]["content"]["application/json"]
): Promise<
  paths["/features/save"]["post"]["responses"]["200"]["content"]["application/json"]
> => {
  const response = await apiClient.post(`/features/save`, features);
  return response.data;
};
export const updateFeatures = async (
  features: paths["/features/{feature_id}"]["put"]["requestBody"]["content"]["application/json"]
): Promise<
  paths["/features/{feature_id}"]["put"]["responses"]["200"]["content"]["application/json"]
> => {
  const response = await apiClient.put(`/features/${features.id}`, features);
  return response.data;
};

export const deleteFeatures = async (
  featureId: number
): Promise<
  paths["/features/{feature_id}"]["delete"]["responses"]["200"]["content"]["application/json"]
> => {
  const response = await apiClient.delete(`/features/${featureId}`);
  return response.data;
};
