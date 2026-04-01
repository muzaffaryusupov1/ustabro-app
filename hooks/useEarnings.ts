import { useQuery } from "@tanstack/react-query";
import { fetchMasterEarnings } from "../services/orders";

export function useEarnings(masterId: string | undefined) {
  return useQuery({
    queryKey: ["earnings", masterId],
    queryFn: () => fetchMasterEarnings(masterId!),
    enabled: !!masterId,
  });
}
