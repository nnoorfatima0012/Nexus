// import API from "./api";
// import { UserRole } from "../types";

// export const registerUser = async (
//   name: string,
//   email: string,
//   password: string,
//   role: UserRole
// ) => {
//   const response = await API.post("/auth/register", {
//     name,
//     email,
//     password,
//     role
//   });

//   return response.data;
// };

// export const loginUser = async (
//   email: string,
//   password: string,
//   role: UserRole
// ) => {
//   const response = await API.post("/auth/login", {
//     email,
//     password,
//     role
//   });

//   return response.data;
// };

// export const getLoggedInUser = async () => {
//   const response = await API.get("/auth/me");
//   return response.data;
// };

import API from "./api";
import { UserRole } from "../types";

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: UserRole,
) => {
  const response = await API.post("/auth/register", {
    name,
    email,
    password,
    role,
  });

  return response.data;
};

export const loginUser = async (
  email: string,
  password: string,
  role: UserRole,
) => {
  const response = await API.post("/auth/login", {
    email,
    password,
    role,
  });

  return response.data;
};

export const verifyLoginOtp = async (
  tempUserId: string,
  otpCode: string,
) => {
  const response = await API.post("/auth/2fa/verify-login", {
    tempUserId,
    otpCode,
  });

  return response.data;
};

export const enableTwoFactorAuth = async () => {
  const response = await API.post("/auth/2fa/enable");
  return response.data;
};

export const disableTwoFactorAuth = async () => {
  const response = await API.post("/auth/2fa/disable");
  return response.data;
};

export const getLoggedInUser = async () => {
  const response = await API.get("/auth/me");
  return response.data;
};