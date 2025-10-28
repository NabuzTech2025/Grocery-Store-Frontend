import { useQuery } from "@tanstack/react-query";
import { getCategory } from "../api/UserServices";
import { getAvailableCategories } from "../utils/categoryAvailability";
import sortCategoriesByDisplayOrder from "../utils/helper/User/sortCategoriesByDisplayOrder";

const STORE_ID = import.meta.env.VITE_STORE_ID;
const ITEMS_PER_PAGE = 20;

// Hook for fetching categories
export const useCategories = (serverTime) => {
  return useQuery({
    queryKey: ["categories", STORE_ID],
    queryFn: async () => {
      const res = await getCategory(STORE_ID);
      const cats = res.data ?? res;
      const availableCategories = getAvailableCategories(cats, serverTime);
      return sortCategoriesByDisplayOrder(availableCategories);
    },
    enabled: !!serverTime,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    placeholderData: (previousData) => previousData, // ✅ Keep previous data while refetching
    refetchOnWindowFocus: false, // ✅ Prevent refetch on window focus
    refetchOnMount: false, // ✅ Don't refetch if data exists
  });
};

// Hook for fetching products by category
export const useCategoryProducts = (categoryId, categoryName) => {
  return useQuery({
    queryKey: ["categoryProducts", STORE_ID, categoryId],
    queryFn: async () => {
      const response = await fetch(
        `https://magskr.com/products/limitbycat/${ITEMS_PER_PAGE}?offset=0&store_id=${STORE_ID}&category_id=${categoryId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const productsData = await response.json();
      return {
        categoryId,
        categoryName,
        products: productsData,
      };
    },
    enabled: !!categoryId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    placeholderData: (previousData) => previousData, // ✅ Keep previous data
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Hook for fetching all products for multiple categories
export const useAllCategoryProducts = (categories) => {
  return useQuery({
    queryKey: ["allCategoryProducts", STORE_ID, categories.map((c) => c.id)],
    queryFn: async () => {
      const productsPromises = categories.map(async (category) => {
        const response = await fetch(
          `https://magskr.com/products/limitbycat/${ITEMS_PER_PAGE}?offset=0&store_id=${STORE_ID}&category_id=${category.id}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const productsData = await response.json();
        return {
          categoryId: category.id,
          categoryName: category.name,
          products: productsData,
        };
      });

      return await Promise.all(productsPromises);
    },
    enabled: categories.length > 0,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData, // ✅ Keep previous data
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    notifyOnChangeProps: ["data", "error"], // ✅ Only re-render on data/error changes
  });
};

// Combined hook for categories and products
export const useCategoriesWithProducts = (serverTime) => {
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
    isFetching: categoriesFetching,
  } = useCategories(serverTime);

  const {
    data: allProducts = [],
    isLoading: productsLoading,
    error: productsError,
    isFetching: productsFetching,
  } = useAllCategoryProducts(categories);

  // ✅ Only show loading on initial load, not on background refetches
  const isInitialLoading =
    categoriesLoading || (categories.length > 0 && productsLoading);

  return {
    categories,
    allProducts,
    isLoading: isInitialLoading,
    isFetching: categoriesFetching || productsFetching,
    error: categoriesError || productsError,
  };
};
