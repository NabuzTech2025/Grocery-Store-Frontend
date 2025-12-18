import axiosInstance from "./axiosConfig";

export const getUserMe = async (payload) => {
  try {
    const response = await axiosInstance.get("users/me/");
    return response.data;
  } catch (error) {
    console.error("Get store error:", error);
    throw error;
  }
};

// ✅ Category APIs
export const addCategory = async (payload) => {
  try {
    const response = await axiosInstance.post("categories/", payload);
    return response.data;
  } catch (error) {
    console.error("Add Category error:", error);
    throw error;
  }
};

export const getCategory = async (store_id) => {
  try {
    return await axiosInstance.get(`categories/?store_id=${store_id}`);
  } catch (error) {
    console.error("Get Category List Error:", error);
    throw error;
  }
};

export const getCategoryByID = async (id) => {
  try {
    return await axiosInstance.get(`categories/${id}`);
  } catch (error) {
    console.error("Get Category List Error:", error);
    throw error;
  }
};

export const updateCategory = async (id, payload) => {
  try {
    return await axiosInstance.put(`categories/${id}`, payload);
  } catch (error) {
    console.error("Get Category List Error:", error);
    throw error;
  }
};

export const changeCategoryStatus = async (id, payload) => {
  try {
    return await axiosInstance.put(`categories/${id}`, payload);
  } catch (error) {
    console.error("Get Category List Error:", error);
    throw error;
  }
};

export const deleteCategory = async (id, payload) => {
  try {
    return await axiosInstance.delete(`categories/${id}`);
  } catch (error) {
    console.error("Get Category List Error:", error);
    throw error;
  }
};

// ✅ Product APIs
export const addProduct = async (productData) => {
  try {
    return await axiosInstance.post("products/", productData);
  } catch (error) {
    console.error("Add Product Error:", error);
    throw error;
  }
};

export const getProduct = async (store_id) => {
  try {
    return await axiosInstance.get(`products/?store_id=${store_id}`);
  } catch (error) {
    console.error("Get Product List Error:", error);
    throw error;
  }
};

export const updateProduct = async (id, payload) => {
  try {
    return await axiosInstance.put(`products/${id}`, payload);
  } catch (error) {
    console.error("Get Product List Error:", error);
    throw error;
  }
};

export const productDelete = async (id) => {
  try {
    return await axiosInstance.delete(`products/${id}`);
  } catch (error) {
    console.error("Delete Product Error:", error);
    throw error;
  }
};

export const changeProductStatus = async (id) => {
  try {
    return await axiosInstance.delete(`products/${id}`);
  } catch (error) {
    console.error("Delete Product Error:", error);
    throw error;
  }
};

export const getTax = async (store_id) => {
  try {
    return await axiosInstance.get(`taxes/${store_id}`);
  } catch (error) {
    console.error("Get Category List Error:", error);
    throw error;
  }
};

export const addTax = async (payload) => {
  try {
    return await axiosInstance.post(`taxes/`, payload);
  } catch (error) {
    console.error("Get Category List Error:", error);
    throw error;
  }
};

export const updateTax = async (id, payload) => {
  try {
    return await axiosInstance.put(`taxes/${id}`, payload);
  } catch (error) {
    console.error("Get Category List Error:", error);
    throw error;
  }
};

export const deleteTax = async (id) => {
  try {
    return await axiosInstance.delete(`taxes/${id}`);
  } catch (error) {
    console.error("Get Category List Error:", error);
    throw error;
  }
};

export const getStoreHours = async (store_id) => {
  try {
    return await axiosInstance.get(`store-hours/store/${store_id}`);
  } catch (error) {
    console.error("Get Store hours List Error:", error);
    throw error;
  }
};

export const addStoreHour = async (id, payload) => {
  try {
    return await axiosInstance.post(`store-hours/store/${id}`, payload);
  } catch (error) {
    console.error("Get Category List Error:", error);
    throw error;
  }
};

export const updateStoreHour = async (id, payload) => {
  try {
    return await axiosInstance.put(`store-hours/${id}`, payload);
  } catch (error) {
    console.error("Get Category List Error:", error);
    throw error;
  }
};

export const deleteStoreHour = async (id) => {
  try {
    return await axiosInstance.delete(`store-hours/${id}`);
  } catch (error) {
    console.error("Get Category List Error:", error);
    throw error;
  }
};

export const uploadImage = async (payload) => {
  try {
    return await axiosInstance.post(`images/upload`, payload);
  } catch (error) {
    console.error("Get Category List Error:", error);
    throw error;
  }
};

export const addDisscount = async (payload) => {
  try {
    return await axiosInstance.post("discounts/", payload);
  } catch (error) {
    console.error("Get Category List Error:", error);
    throw error;
  }
};

export const updateDisscount = async (id, payload) => {
  try {
    return await axiosInstance.put(`discounts/${id}`, payload);
  } catch (error) {
    console.error("Get Category List Error:", error);
    throw error;
  }
};

export const getDisscount = async (id) => {
  try {
    return await axiosInstance.get(`discounts/${id}`);
  } catch (error) {
    console.error("Get Category List Error:", error);
    throw error;
  }
};

export const getToppings = async (store_id) => {
  try {
    const response = await axiosInstance.get(`toppings/?store_id=${store_id}`);
    return response.data;
  } catch (error) {
    console.error("Get stores Error:", error);
    throw error;
  }
};

export const addTopping = async (payload) => {
  try {
    const response = await axiosInstance.post("/toppings/", payload);
    return response.data;
  } catch (error) {
    console.error("Get stores Error:", error);
    throw error;
  }
};

export const updateTopping = async (id, payload) => {
  try {
    const response = await axiosInstance.put(`/toppings/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error("Get stores Error:", error);
    throw error;
  }
};

export const deleteTopping = async (id) => {
  try {
    const response = await axiosInstance.delete(`/toppings/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get stores Error:", error);
    throw error;
  }
};

export const reactivateTopping = async (id) => {
  try {
    const response = await axiosInstance.put(`/toppings/${id}/reactivate`);
    return response.data;
  } catch (error) {
    console.error("Get stores Error:", error);
    throw error;
  }
};

export const getToppingGroups = async (store_id) => {
  try {
    const response = await axiosInstance.get(
      `toppings/groups?store_id=${store_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Get stores Error:", error);
    throw error;
  }
};

export const addToppingGroups = async (payload) => {
  try {
    const response = await axiosInstance.post("/toppings/groups", payload);
    return response.data;
  } catch (error) {
    console.error("Get stores Error:", error);
    throw error;
  }
};

export const updateToppingGroups = async (id, payload) => {
  try {
    const response = await axiosInstance.put(`/toppings/groups/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error("Get stores Error:", error);
    throw error;
  }
};

export const deleteToppingGroups = async (id) => {
  try {
    const response = await axiosInstance.delete(`/toppings/groups/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get stores Error:", error);
    throw error;
  }
};

export const reactivateToppingGroups = async (id) => {
  try {
    const response = await axiosInstance.put(
      `/toppings/groups/${id}/reactivate`
    );
    return response.data;
  } catch (error) {
    console.error("Get stores Error:", error);
    throw error;
  }
};

export const getGroupsItem = async (store_id) => {
  try {
    const response = await axiosInstance.get(
      `toppings/group-items?store_id=${store_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Get stores Error:", error);
    throw error;
  }
};

export const addGroupItem = async (payload) => {
  try {
    const response = await axiosInstance.post("/toppings/group-items", payload);
    return response.data;
  } catch (error) {
    console.error("Get stores Error:", error);
    throw error;
  }
};

export const updateGroupsItem = async (id, payload) => {
  try {
    const response = await axiosInstance.put(
      `/toppings/group-items/${id}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Get stores Error:", error);
    throw error;
  }
};

export const deleteGroupsItem = async (id) => {
  try {
    const response = await axiosInstance.delete(`toppings/group-items/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get stores Error:", error);
    throw error;
  }
};

export const getProductGroups = async (store_id) => {
  try {
    const response = await axiosInstance.get(
      `toppings/product-groups?store_id=${store_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Get stores Error:", error);
    throw error;
  }
};

export const addProductGroup = async (payload) => {
  try {
    const response = await axiosInstance.post(
      "/toppings/product-groups",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Get stores Error:", error);
    throw error;
  }
};

export const updateProductGroups = async (id, payload) => {
  try {
    const response = await axiosInstance.put(
      `/toppings/product-groups/${id}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Get stores Error:", error);
    throw error;
  }
};

export const deleteProductGroups = async (id) => {
  try {
    const response = await axiosInstance.delete(
      `toppings/product-groups/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Get stores Error:", error);
    throw error;
  }
};

// ✅ Allergy Items APIs
export const getAllergyItems = async (store_id) => {
  try {
    const response = await axiosInstance.get(
      `allergy-items/?store_id=${store_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Get Allergy Items Error:", error);
    throw error;
  }
};

export const addAllergyItem = async (payload) => {
  try {
    const response = await axiosInstance.post("allergy-items/", payload);
    return response.data;
  } catch (error) {
    console.error("Add Allergy Item Error:", error);
    throw error;
  }
};

export const updateAllergyItem = async (item_id, payload) => {
  try {
    const response = await axiosInstance.put(
      `allergy-items/${item_id}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Update Allergy Item Error:", error);
    throw error;
  }
};

export const deleteAllergyItem = async (item_id) => {
  try {
    const response = await axiosInstance.delete(`allergy-items/${item_id}`);
    return response.data;
  } catch (error) {
    console.error("Delete Allergy Item Error:", error);
    throw error;
  }
};

// Get allergy items linked to a specific product
export const getAllergyItemsForProduct = async (product_id) => {
  try {
    const response = await axiosInstance.get(
      `allergies_link/${product_id}/allergy-items`
    );
    return response.data;
  } catch (error) {
    console.error("Get Allergy Items For Product Error:", error);
    throw error;
  }
};

// Add allergy items to a product
export const addAllergyItemsToProduct = async (product_id, allergyItemIds) => {
  try {
    const response = await axiosInstance.post(
      `allergies_link/${product_id}/allergy-items`,
      allergyItemIds
    );
    return response.data;
  } catch (error) {
    console.error("Add Allergy Items To Product Error:", error);
    throw error;
  }
};

// Set/Replace allergy items for a product (replaces all existing)
export const setAllergyItemsForProduct = async (product_id, allergyItemIds) => {
  try {
    const response = await axiosInstance.put(
      `allergies_link/${product_id}/allergy-items`,
      allergyItemIds
    );
    return response.data;
  } catch (error) {
    console.error("Set Allergy Items For Product Error:", error);
    throw error;
  }
};

// Remove specific allergy item link from a product
export const removeAllergyItemFromProduct = async (
  product_id,
  allergy_item_id
) => {
  try {
    const response = await axiosInstance.delete(
      `allergies_link/${product_id}/allergy-items/${allergy_item_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Remove Allergy Item From Product Error:", error);
    throw error;
  }
};

// Get flat allergy-product links for a store
export const getAllergyProductLinks = async (
  store_id,
  include_unlinked = false,
  limit = 500,
  offset = 0
) => {
  try {
    const response = await axiosInstance.get(
      `allergies_link/store/${store_id}/allergy-product`,
      {
        params: {
          include_unlinked,
          limit,
          offset,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Get Allergy Product Links Error:", error);
    throw error;
  }
};

// ✅ Category Availability APIs

export const getCategoryAvailabilities = async () => {
  try {
    const response = await axiosInstance.get("categories-availability/");
    return response.data;
  } catch (error) {
    console.error("Get Category Availabilities Error:", error);
    throw error;
  }
};

export const createCategoryAvailability = async (payload) => {
  try {
    const response = await axiosInstance.post(
      "categories-availability/",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Create Category Availability Error:", error);
    throw error;
  }
};

export const createBulkCategoryAvailabilities = async (payload) => {
  try {
    const response = await axiosInstance.post(
      "categories-availability/bulk",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Create Bulk Category Availabilities Error:", error);
    throw error;
  }
};

export const replaceCategoryAvailabilities = async (category_id, payload) => {
  try {
    const response = await axiosInstance.put(
      `categories-availability/bulk?category_id=${category_id}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Replace Category Availabilities Error:", error);
    throw error;
  }
};

export const updateCategoryAvailability = async (availability_id, payload) => {
  try {
    const response = await axiosInstance.put(
      `categories-availability/${availability_id}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Update Category Availability Error:", error);
    throw error;
  }
};

export const deleteCategoryAvailability = async (availability_id) => {
  try {
    const response = await axiosInstance.delete(
      `categories-availability/${availability_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Delete Category Availability Error:", error);
    throw error;
  }
};
