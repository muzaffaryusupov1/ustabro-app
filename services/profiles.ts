import { supabase } from "../lib/supabase";

interface UpdateProfileInput {
  full_name: string;
  avatar_url?: string | null;
}

interface UpdateMasterProfileInput {
  skills: string[];
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", userId);

  if (error) throw error;
}

export async function updateMasterProfile(
  userId: string,
  data: UpdateMasterProfileInput
) {
  const { error } = await supabase
    .from("master_profiles")
    .update(data)
    .eq("id", userId);

  if (error) throw error;
}

export async function uploadAvatar(userId: string, uri: string) {
  const ext = uri.split(".").pop() ?? "jpg";
  const path = `${userId}/avatar.${ext}`;

  const response = await fetch(uri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, blob, { upsert: true, contentType: `image/${ext}` });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  return publicUrl;
}
