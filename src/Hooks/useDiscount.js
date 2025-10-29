import { useQuery } from "@tanstack/react-query";
import { getDisscount } from "../api/UserServices";

export const useDiscount = (storeId, orderType) => {
  return useQuery({
    queryKey: ["discount", storeId, orderType],
    queryFn: async () => {
      const discounts = await getDisscount(storeId);
      const code = `${orderType.toUpperCase()}_DISCOUNT`;
      const discount = discounts.find((x) => x.code === code);

      return {
        percent: discount?.value || 0,
        id: discount?.id || 0,
        discount,
      };
    },
    enabled: !!storeId && !!orderType,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
};
