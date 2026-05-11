import { supabase } from "../lib/supabase";

export interface Review {
  id: string;
  order_id: string;
  customer_id: string;
  master_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer?: { full_name: string | null; avatar_url: string | null };
}

export async function createReview(input: {
  order_id: string;
  customer_id: string;
  master_id: string;
  rating: number;
  comment?: string;
}) {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      order_id: input.order_id,
      customer_id: input.customer_id,
      master_id: input.master_id,
      rating: input.rating,
      comment: input.comment || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Review;
}

export async function fetchOrderReview(orderId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) throw error;
  return data as Pick<Review, "id" | "rating" | "comment" | "created_at"> | null;
}

export interface MasterReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer: { full_name: string | null; avatar_url: string | null } | null;
}

export async function fetchMasterReviews(masterId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id, rating, comment, created_at,
      customer:profiles!reviews_customer_id_fkey ( full_name, avatar_url )
    `)
    .eq("master_id", masterId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as MasterReview[];
}
