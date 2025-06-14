import apiClient from "./client";
import { paths } from "./types";

// Types
export type ApiCell = {
  id: number;
  name: string;
  description: string;
  img: string;
};

/**
 * Get cells for an image
 * @param imageId - The ID of the image
 * @returns Promise with cell data
 */
export const getCells = async (imageId: number): Promise<ApiCell[]> => {
  const response = await apiClient.get(`/cells/get/${imageId}`);
  return response.data;
};

export const addCells = async (
  imageId: number,
  cells: paths["/cells/save/{image_id}"]["post"]["requestBody"]["content"]["application/json"]
): Promise<
  paths["/cells/save/{image_id}"]["post"]["responses"]["200"]["content"]["application/json"]
> => {
  const response = await apiClient.post(`/cells/save/${imageId}`, cells);
  return response.data;
};
export const updateCells = async (
  imageId: number,
  cells: paths["/cells/{cell_id}"]["put"]["requestBody"]["content"]["application/json"]
): Promise<
  paths["/cells/{cell_id}"]["put"]["responses"]["200"]["content"]["application/json"]
> => {
  const response = await apiClient.put(`/cells/${imageId}`, cells);
  return response.data;
};

export const deleteCells = async (
  cellId: number
): Promise<
  paths["/cells/{cell_id}"]["delete"]["responses"]["200"]["content"]["application/json"]
> => {
  const response = await apiClient.delete(`/cells/${cellId}`);
  return response.data;
};
