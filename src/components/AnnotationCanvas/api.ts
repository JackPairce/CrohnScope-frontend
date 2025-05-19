import { components, paths } from "@/api";
import axios from "axios";

// TODO Replace with your actual API base URL
const API_BASE_URL = "http://mylaptop:5000"; // 105.101.74.8

// Types
export type ApiImage = components["schemas"]["ApiImage"];
export type ApiMask = components["schemas"]["ApiMask"];

export const getImages = async (
  page: number,
  done?: boolean
): Promise<
  paths["/image/all/{page}"]["get"]["responses"]["200"]["content"]["application/json"]
> => {
  const response = await axios.get(
    `${API_BASE_URL}/image/all/${page}?done=${done ? 1 : 0}`
  );
  return response.data;
};

// Upload an image
export const uploadImage = async (image: ApiImage): Promise<ApiImage> => {
  const response = await axios.post(`${API_BASE_URL}/image/upload`, image);
  return response.data;
};

// Delete an image
export const deleteImage = async (
  imageId: number
): Promise<
  paths["/image/delete/{image_id}"]["delete"]["responses"]["200"]["content"]["application/json"]
> => {
  const response = await axios.delete(
    `${API_BASE_URL}/image/delete/${imageId}`
  );
  return response.data;
};

export const getCells = async (
  imageId: number
): Promise<
  paths["/cells/get/{image_id}"]["get"]["responses"]["200"]["content"]["application/json"]
> => {
  const response = await axios.get(`${API_BASE_URL}/cells/get/${imageId}`);
  return response.data;
};

// Get an image and create a mask
export const getMask = async (
  imageId: number
): Promise<
  paths["/mask/get/{image_id}"]["get"]["responses"]["200"]["content"]["application/json"]
> => {
  const response = await axios.get(`${API_BASE_URL}/mask/get/${imageId}`);
  return response.data;
};

export const uploadMasks = async (
  imageId: number,
  masks: components["schemas"]["ApiSaveMaskResponse"][]
): Promise<{ message: string }> => {
  const response = await axios.post(
    `${API_BASE_URL}/mask/save/${imageId}`,
    masks
  );
  return response.data;
};

export const SetMaskDone = async (
  maskId: paths["/mask/done/{mask_id}"]["put"]["parameters"]["path"]["mask_id"]
): Promise<{ message: string }> => {
  const response = await axios.put(`${API_BASE_URL}/mask/done/${maskId}`);
  return response.data;
};

// Alternate mask names
export const alternateMasks = async (
  imageId: number,
  mask1: string,
  mask2: string
): Promise<{ message: string }> => {
  const response = await axios.post(`${API_BASE_URL}/masks/alternate`, {
    imageId,
    mask1,
    mask2,
  });
  return response.data;
};
