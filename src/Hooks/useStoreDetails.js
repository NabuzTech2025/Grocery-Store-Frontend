import { useQuery } from "@tanstack/react-query";
import { getStoreDetails } from "../api/UserServices";

export const useStoreDetails = () => {
  const {
    data: storeDetails,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["storeDetails"],
    queryFn: async () => {
      const response = await getStoreDetails();
      return response;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    onError: (error) => {
      console.error(`Error fetching store details for ID ${storeId}:`, error);
    },
  });

  return {
    storeDetails,
    isLoading,
    error,
  };
};
