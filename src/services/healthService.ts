import API from "./api";

export const checkBackendHealth = async () => {
  const response = await API.get("/health");
  return response.data;
};