import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export function useOrder(orderId: string | undefined) {
  return useQuery({
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
}
