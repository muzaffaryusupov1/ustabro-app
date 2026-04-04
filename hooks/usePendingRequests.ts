import { useQuery } from "@tanstack/react-query";
import { fetchPendingRequests } from "../services/orders";

export function usePendingRequests(masterSkills?: string[]) {
  return useQuery({
    queryKey: ["pending-requests", masterSkills],
    queryFn: () => fetchPendingRequests(masterSkills),
    refetchInterval: 30_000,
  });
}
