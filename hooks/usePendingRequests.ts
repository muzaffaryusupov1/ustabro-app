import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { queryClient } from "../lib/queryClient";
import { fetchPendingRequests } from "../services/orders";

export function usePendingRequests(masterSkills?: string[]) {
  const query = useQuery({
    queryKey: ["pending-requests", masterSkills],
    queryFn: () => fetchPendingRequests(masterSkills),
  });

  useEffect(() => {
    const channel = supabase
      .channel("pending-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return query;
}
