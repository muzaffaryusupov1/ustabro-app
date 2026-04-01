import { supabase } from "../lib/supabase";

export interface Category {
  id: string;
  name_uz: string;
  name_uz_cy: string | null;
  icon_name: string | null;
  icon_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("service_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}
