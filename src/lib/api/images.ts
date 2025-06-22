import apiClient from "./client";
import { components, paths } from "./types";

// Types
export type ApiImage = components["schemas"]["ApiImage"];
export type ImageListResponse = components["schemas"]["ImageListResponse"];

/**
 * Interface for image status information
 */
export interface ImageStatus {
  totalImages: number;
  segmentedCount: number;
  labeledCount: number;
  labelDistribution: Record<string, number>;
}

/**
 * Get all images
 * @param page - The page number to retrieve
 * @returns Promise with the image list response
 */
export const getAllImages = async (
  page: number,
  done?: boolean
): Promise<ImageListResponse> => {
  const response = await apiClient.get(
    "/images/all/" + page + (done !== undefined ? `?done=${done}` : "")
  );
  return response.data;
};

/**
 * Upload an image
 * @param image - The image data to upload
 * @returns Promise with the uploaded image data
 */
export const uploadImage = async (
  image: paths["/images/upload"]["post"]["requestBody"]["content"]["application/json"]
): Promise<
  paths["/images/upload"]["post"]["responses"]["200"]["content"]["application/json"]
> => {
  const response = await apiClient.post("/images/upload", image);
  return response.data;
};

/**
 * Delete an image by ID
 * @param imageId - The ID of the image to delete
 * @returns Promise with success message
 */
export const deleteImage = async (
  imageId: number
): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/images/delete/${imageId}`);
  return response.data;
};

/**
 * Get image status information
 * @returns Promise with image statistics
 */
export const getImageStatus = async (): Promise<ImageStatus> => {
  const response = await apiClient.get<ImageStatus>("/images/status");
  return response.data;
};

export const getStainNormalizationImage = async (
  imageId: number
): Promise<
  paths["/images/stain/{image_id}"]["get"]["responses"]["200"]["content"]["application/json"]
> => {
  const response = await apiClient.get(`/images/stain/${imageId}`);
  return response.data;
};

export const getStainNormalizationImageFromBase64 = async (
  imageBase64: paths["/images/stain"]["post"]["requestBody"]["content"]["application/json"]["base64_data"]
): Promise<
  paths["/images/stain"]["post"]["responses"]["200"]["content"]["application/json"]
> => {
  const response = await apiClient.post(
    "/images/stain",
    { base64_data: imageBase64 },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};
