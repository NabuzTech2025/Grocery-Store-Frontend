import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderPlace, OrderPlaceWithGustUser } from "../api/UserServices";

export const usePlaceOrder = (isGuestLogin = false) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData) => {
      if (isGuestLogin) {
        return await OrderPlaceWithGustUser(orderData);
      } else {
        return await OrderPlace(orderData);
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries after successful order
      queryClient.invalidateQueries(["userOrders"]);
      queryClient.invalidateQueries(["cartItems"]);

      if (isGuestLogin) {
        console.log("Guest Order placed successfully:", data.data.id);
      } else {
        console.log("Order placed successfully:", data.data.id);
        s;
      }
    },
    onError: (error) => {
      if (isGuestLogin) {
        console.error("Failed to place guest order:", error);
      } else {
        console.error("Failed to place order:", error);
      }
    },
    retry: 1,
  });
};
