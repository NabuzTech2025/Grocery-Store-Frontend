// src/api/auth.js
import axiosInstance from "./axiosConfig";

export const loginAuth = async (email, password) => {
  const data = new FormData();
  data.append("username", email);
  data.append("password", password);
  try {
    return await axiosInstance.post("/login", data);
  } catch (error) {
    console.error("Login error:", error);
    throw error; // Make sure to re-throw the error so it can be caught by the caller
  }
};

export const logoutUser = async () => {
  try {
    const response = await axiosInstance.post("/logout/"); // Changed endpoint to /logout/
    return response.data;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};