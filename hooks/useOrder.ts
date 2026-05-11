import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { queryClient } from "../lib/queryClient";

export function useOrder(orderId: string | undefined) {
  const query = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id, description, address, status, price_agreed, photo_urls,
          voice_note_url, created_at, updated_at,
          customer:profiles!orders_customer_id_fkey ( id, full_name, avatar_url, phone ),
          master:profiles!orders_master_id_fkey ( id, full_name, avatar_url, phone ),
          category:service_categories!orders_category_id_fkey ( name_uz, icon_name )
        `)
        .eq("id", orderId!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["order", orderId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  return query;
}
