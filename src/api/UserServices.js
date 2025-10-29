import axiosInstance from "./axiosConfig";

export const getUserMe = async () => {
  try {
    const response = await axiosInstance.get("/users/me");
    return response.data;
  } catch (error) {
    console.error("Get Fetch User Error:", error);
    throw error;
  }
};

export const getCategory = async (id) => {
  try {
    return await axiosInstance.get(`/categories/?store_id=${id}`);
  } catch (error) {
    console.error("Get Category List Error:", error);
    throw error;
  }
};

export const getProduct = async (id) => {
  try {
    return await axiosInstance.get(`/products/?store_id=${id}`);
  } catch (error) {
    console.error("Get Product List Error:", error);
    throw error;
  }
};

export const getProductsByCategory = async (categoryId, storeId) => {
  try {
    const response = await axiosInstance.get(
      `/products/by-category-store/?category_id=${categoryId}&store_id=${storeId}`
    );
    return response.data;
  } catch (error) {
    console.error("Get Product List Error:", error);
    throw error;
  }
};

export const getStoreDetails = async (store_id) => {
  try {
    const response = await axiosInstance.get(`/stores/${store_id}`);
    return response.data;
  } catch (error) {
    console.error("Get stores Error:", error);
    throw error;
  }
};

export const getDisscount = async (store_id) => {
  try {
    const response = await axiosInstance.get(`/discounts/${store_id}`);
    return response.data;
  } catch (error) {
    console.error("Get discounts Error:", error);
    throw error;
  }
};

export const getStorePostcodes = async (store_id) => {
  try {
    const response = await axiosInstance.get(`/postcodes/store/${store_id}`);
    return response.data;
  } catch (error) {
    console.error("Get discounts Error:", error);
    throw error;
  }
};

export const userRegister = async (payload) => {
  try {
    const response = await axiosInstance.post("/register/customer", payload);
    return response.data;
  } catch (error) {
    console.error("Get discounts Error:", error);
    throw error;
  }
};

export const OrderPlace = async (payload) => {
  try {
    const response = await axiosInstance.post("/orders/", payload);
    return response;
  } catch (error) {
    console.error("OrderPlace API error:", error);
    throw error; // propagate to caller’s catch
  }
};

export const OrderPlaceWithGustUser = async (payload) => {
  try {
    const response = await axiosInstance.post("/orders/guest", payload);
    return response;
  } catch (error) {
    throw error; // propagate to caller’s catch
  }
};

export const userAddresses = async (payload) => {
  try {
    const response = await axiosInstance.post("/addresses/", payload);
    return response;
  } catch (error) {
    console.error("addresses API error:", error);
    throw error; // propagate to caller’s catch
  }
};

export const updateAddresses = async (payload, id) => {
  try {
    const response = await axiosInstance.put(`/addresses/${id}`, payload);
    return response;
  } catch (error) {
    console.error("addresses API error:", error);
    throw error; // propagate to caller’s catch
  }
};

export const getUserAddresses = async () => {
  try {
    const response = await axiosInstance.get("/addresses/");
    return response;
  } catch (error) {
    console.error("addresses API error:", error);
    throw error; // propagate to caller’s catch
  }
};

export const forgotPassword = async (payload) => {
  try {
    const response = await axiosInstance.post("/forgot-password", payload);
    return response;
  } catch (error) {
    console.error("addresses API error:", error);
    throw error; // propagate to caller’s catch
  }
};

export const resetPassword = async (payload) => {
  try {
    const response = await axiosInstance.post("/reset-password", payload);
    return response;
  } catch (error) {
    console.error("addresses API error:", error);
    throw error; // propagate to caller’s catch
  }
};

export const getStoreDisscount = async (store_id = null) => {
  try {
    const storeId = store_id || import.meta.env.VITE_STORE_ID || "1";
    if (!storeId) {
      throw new Error("Store ID not found");
    }
    const response = await axiosInstance.get(`/discounts/${storeId}`);
    return response;
  } catch (error) {
    console.error("addresses API error:", error);
    throw error; // propagate to caller's catch
  }
};
