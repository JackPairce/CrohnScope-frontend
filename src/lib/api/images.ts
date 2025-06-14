import apiClient from "./client";
import { components, paths } from "./types";

// Types
export type ApiImage = components["schemas"]["ApiImage"];
export type ImageListResponse = components["schemas"]["ImageListResponse"];
export type process_type = components["schemas"]["process_type"];

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
  page: number
): Promise<ImageListResponse> => {
  const response = await apiClient.get("/images/all/" + page);
  return response.data;
};

/**
 * Get a paginated list of images
 * @param page - The page number to retrieve
 * @param done - Optional flag to filter by completion status
 * @returns Promise with the image list response
 */
export const getImages = async (
  page: number,
  which: process_type,
  done?: boolean
): Promise<ImageListResponse> => {
  const response = await apiClient.get(
    `/images/which_all/${page}${
      done !== undefined ? `?done=${done ? 1 : 0}` : ""
    }&which=${which}`
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
