import { components, paths } from "@/api";
import axios from "axios";

const API_BASE_URL = "http://192.168.100.4:5000"; // TODO Replace with your actual API base URL

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
export const uploadImage = async (
  file: File
): Promise<
  paths["/image/upload"]["post"]["responses"]["200"]["content"]["application/json"]
> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${API_BASE_URL}/image/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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
  masks: paths["/mask/save/{image_id}"]["post"]["requestBody"]["content"]["application/json"]
): Promise<{ message: string }> => {
  const response = await axios.post(
    `${API_BASE_URL}/mask/save/${imageId}`,
    masks
  );
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
