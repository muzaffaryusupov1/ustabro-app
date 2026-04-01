import { decode } from "base64-arraybuffer";
import { supabase } from "../lib/supabase";

function readFileAsBase64(uri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(xhr.response);
    };
    xhr.onerror = reject;
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
}

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
  const path = `${userId}/avatar.jpg`;

  const base64 = await readFileAsBase64(uri);

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, decode(base64), { upsert: true, contentType: "image/jpeg" });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  return publicUrl;
}
