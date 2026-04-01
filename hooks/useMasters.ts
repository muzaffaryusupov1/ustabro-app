import { useQuery } from "@tanstack/react-query";
import { fetchNearbyMasters } from "../services/masters";

export function useMasters() {
  return useQuery({
    queryKey: ["masters"],
    queryFn: fetchNearbyMasters,
  });
}
