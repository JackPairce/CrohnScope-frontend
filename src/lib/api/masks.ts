import apiClient from "./client";
import { components, paths } from "./types";

// Types
export type ApiMask = components["schemas"]["ApiMask"];
export type MaskMatricesResponse =
  components["schemas"]["MaskMatricesResponse"];
export type SaveMaskRequest =
  paths["/masks/save/{image_id}"]["post"]["requestBody"]["content"]["application/json"];

/**
 * Get masks for an image
 * @param imageId - The ID of the image
 * @returns Promise with mask data
 */
export const getMask = async (imageId: number): Promise<ApiMask[]> => {
  const response = await apiClient.get(`/masks/get/${imageId}`);
  return response.data;
};

/**
 * Upload masks for an image
 * @param imageId - The ID of the image
 * @param masks - Array of mask data to save
 * @returns Promise with success message
 */
export const uploadMasks = async (
  imageId: number,
  masks: SaveMaskRequest
): Promise<{ message: string }> => {
  const response = await apiClient.post(`/masks/save/${imageId}`, masks);
  return response.data;
};

/**
 * Mark a mask as completed
 * @param maskId - The ID of the mask to mark as done
 * @returns Promise with success message
 */
export const setMaskDone = async (
  maskId: paths["/masks/done/{mask_id}"]["put"]["parameters"]["path"]["mask_id"],
  which: paths["/masks/done/{mask_id}"]["put"]["parameters"]["query"]["which"]
): Promise<{ message: string }> => {
  const response = await apiClient.put(`/masks/done/${maskId}`);
  return response.data;
};

/**
 * Alternate (swap) two masks for an image
 * @param imageId - The ID of the image
 * @param mask1 - First mask filename
 * @param mask2 - Second mask filename
 * @returns Promise with success message
 */
export const alternateMasks = async (
  imageId: number,
  mask1: string,
  mask2: string
): Promise<{ message: string }> => {
  const response = await apiClient.post("/masks/alternate", {
    imageId,
    mask1,
    mask2,
  });
  return response.data;
};

/**
 * Get mask matrices with labeled regions for an image
 * @param imageId - The ID of the image
 * @returns Promise with mask matrices data
 */
export const getMaskMatrices = async (
  imageId: number
): Promise<MaskMatricesResponse> => {
  try {
    const response = await apiClient.get(`/masks/matrices/${imageId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching mask matrices:", error);
    throw new Error("Failed to get mask matrices");
  }
};
