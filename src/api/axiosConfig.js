// src/api/axiosConfig.js
import axios from "axios";
import { getuserAccessToken } from "../utils/helper/accessToken";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    // userData ko parse karo kyunki wo JSON string hoga
    // const userDataStr = localStorage.getItem("userData");
    const userDataStr = getuserAccessToken({ tokenName: "userData" });

    let token = null;
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        token = userData.access_token || userData.token; // Jaisa bhi key ho token ka
      } catch (e) {
        console.error("Failed to parse userData from localStorage", e);
      }
    }

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
