import { getuserAccessToken } from "../utils/helper/accessToken";

// fetchInstance.js
export const fetchWithAuth = async (url, options = {}) => {
  const fullUrl = `/api${url}`; // Add /api prefix to use the proxy

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Get token from localStorage
  // const userDataStr = localStorage.getItem("userData");
  const userDataStr = getuserAccessToken({ tokenName: "userData" });
  let token = null;
  if (userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      token = userData.access_token || userData.token;
    } catch (e) {
      console.error("Failed to parse userData", e);
    }
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};
