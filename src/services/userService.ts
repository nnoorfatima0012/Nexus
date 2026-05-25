import API from "./api";

export const getCurrentUserProfile = async () => {
  const response = await API.get("/users/me");
  return response.data;
};

export const updateCurrentUserProfile = async (updates: any) => {
  const response = await API.put("/users/me", updates);
  return response.data;
};

export const getUserById = async (userId: string) => {
  const response = await API.get(`/users/${userId}`);
  return response.data;
};

export const getInvestors = async () => {
  const response = await API.get("/users/investors");
  return response.data;
};

export const getEntrepreneurs = async () => {
  const response = await API.get("/users/entrepreneurs");
  return response.data;
};