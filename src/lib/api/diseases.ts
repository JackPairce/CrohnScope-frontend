//
import apiClient from "./client";
import { components } from "./types";

export type ApiDisease = components["schemas"]["ApiDisease"];

export const getDiseases = async (): Promise<ApiDisease[]> => {
  const response = await apiClient.get("/diseases/");
  return response.data;
};

export const addDisease = async (
  disease: Partial<ApiDisease>
): Promise<ApiDisease> => {
  const response = await apiClient.post("/diseases/", disease);
  return response.data;
};

export const updateDisease = async (
  disease: Partial<ApiDisease>
): Promise<ApiDisease> => {
  const response = await apiClient.put(`/diseases/${disease.id}`, disease);
  return response.data;
};

export const deleteDisease = async (disease_id: number): Promise<void> => {
  await apiClient.delete(`/diseases/${disease_id}`);
};
