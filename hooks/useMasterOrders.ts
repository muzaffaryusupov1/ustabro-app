import { useQuery } from "@tanstack/react-query";
import { fetchMasterOrders } from "../services/orders";

export function useMasterOrders(masterId: string | undefined) {
  return useQuery({
    queryKey: ["master-orders", masterId],
    queryFn: () => fetchMasterOrders(masterId!),
    enabled: !!masterId,
  });
}
