import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { createReview, fetchMasterReviews, fetchOrderReview, MasterReview } from "../services/reviews";

export type { MasterReview };

export function useOrderReview(orderId: string | undefined) {
  return useQuery({
    queryKey: ["order-review", orderId],
    queryFn: () => fetchOrderReview(orderId!),
    enabled: !!orderId,
  });
}

export function useMasterReviews(masterId: string | undefined) {
  return useQuery({
    queryKey: ["master-reviews", masterId],
    queryFn: () => fetchMasterReviews(masterId!),
    enabled: !!masterId,
  });
}

export function useCreateReview() {
  return useMutation({
    mutationFn: createReview,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["order-review", variables.order_id] });
      queryClient.invalidateQueries({ queryKey: ["master-reviews", variables.master_id] });
      queryClient.invalidateQueries({ queryKey: ["master-public-profile", variables.master_id] });
    },
  });
}
