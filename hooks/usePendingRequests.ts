import { useQuery } from "@tanstack/react-query";
import { fetchPendingRequests } from "../services/orders";

export function usePendingRequests() {
  return useQuery({
    queryKey: ["pending-requests"],
    queryFn: fetchPendingRequests,
    refetchInterval: 30_000,
  });
}
