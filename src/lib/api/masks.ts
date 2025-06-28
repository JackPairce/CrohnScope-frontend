import apiClient from "./client";
import { components, paths } from "./types";

// Types
export type ApiMask = components["schemas"]["ApiMask"];
export type SaveMaskRequest = components["schemas"]["MaskSaveRequest"];
export type ApiMaskArray = components["schemas"]["MaskArray"];

/**
 * Get masks for an image
 * @param imageId - The ID of the image
 * @returns Promise with mask data
 */
export const getMask = async (
  imageId: number
): Promise<
  paths["/masks/{image_id}"]["get"]["responses"]["200"]["content"]["application/json"]
> => {
  const response = await apiClient.get(`/masks/${imageId}`);
  return response.data;
};

/**
 * Upload masks for an image
 * @param imageId - The ID of the image
 * @param masks - Array of mask data to save
 * @returns Promise with success message
 */
export const saveMask = async (
  masks: SaveMaskRequest
): Promise<{ message: string }> => {
  const response = await apiClient.post(`/masks`, masks);
  return response.data;
};

/**
 * Mark a mask as completed
 * @param maskId - The ID of the mask to mark as done
 * @returns Promise with success message
 */
export const setMaskDone = async (
  maskId: paths["/masks/{mask_id}"]["put"]["parameters"]["path"]["mask_id"]
): Promise<{ message: string }> => {
  const response = await apiClient.put(`/masks/${maskId}`);
  return response.data;
};

export const getRegions = async (
  mask: paths["/masks/regions"]["post"]["requestBody"]["content"]["application/json"]
): Promise<
  paths["/masks/regions"]["post"]["responses"]["200"]["content"]["application/json"]
> => {
  const response = await apiClient.post(`/masks/regions`, mask);
  return response.data;
};
