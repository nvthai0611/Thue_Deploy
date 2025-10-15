import { CreateOrderPayload, CreateOrderResponse } from "@/lib/type";
import fetchWithAuth from "@/utils/api/fetchWithAuth";
import { useMutation } from "@tanstack/react-query";

export const useCreateOrder = () =>
  useMutation<CreateOrderResponse, Error, CreateOrderPayload>({
    mutationFn: (orderData) =>
      fetchWithAuth("/api/zalo-pay/create-order", {
        method: "POST",
        body: JSON.stringify(orderData),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json()),
  });
