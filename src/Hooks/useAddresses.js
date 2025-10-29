import { useQuery } from "@tanstack/react-query";
import { getUserAddresses } from "../api/UserServices";

export const useAddresses = (enabled = true) => {
  return useQuery({
    queryKey: ["userAddresses"],
    queryFn: async () => {
      const response = await getUserAddresses();
      return response.data[0];
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    onError: (error) => {
      console.error("Error fetching addresses:", error);
    },
  });
};
