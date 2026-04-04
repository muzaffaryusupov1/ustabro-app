import { useQuery } from "@tanstack/react-query";
import { fetchCustomerOrders } from "../services/orders";

export function useCustomerOrders(customerId: string | undefined) {
  return useQuery({
    queryKey: ["customer-orders", customerId],
    queryFn: () => fetchCustomerOrders(customerId!),
    enabled: !!customerId,
  });
}
