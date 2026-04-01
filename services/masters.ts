import { supabase } from "../lib/supabase";

export interface MasterListItem {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  address: string | null;
  rating: number;
  review_count: number;
  experience_years: number;
  skills: string[];
  is_available: boolean;
}

export async function fetchNearbyMasters(): Promise<MasterListItem[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      avatar_url,
      address,
      master_profiles (
        rating,
        review_count,
        experience_years,
        skills,
        is_available
      )
    `)
    .eq("role", "master")
    .eq("is_active", true);

  if (error) throw error;

  return (data ?? [])
    .filter((p: any) => p.master_profiles)
    .map((p: any) => ({
      id: p.id,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      address: p.address,
      rating: p.master_profiles.rating ?? 0,
      review_count: p.master_profiles.review_count ?? 0,
      experience_years: p.master_profiles.experience_years ?? 0,
      skills: p.master_profiles.skills ?? [],
      is_available: p.master_profiles.is_available ?? false,
    }));
}
