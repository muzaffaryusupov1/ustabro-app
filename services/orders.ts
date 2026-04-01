import { decode } from "base64-arraybuffer";
import { supabase } from "../lib/supabase";

function readFileAsBase64(uri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // strip "data:image/jpeg;base64," prefix
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

export interface Order {
  id: string;
  customer_id: string;
  master_id: string | null;
  category_id: string;
  description: string | null;
  voice_note_url: string | null;
  photo_urls: string[];
  address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  status: string;
  price_agreed: number | null;
  created_at: string;
  updated_at: string;
  // joined
  customer?: { full_name: string | null; avatar_url: string | null; phone: string };
  master?: { full_name: string | null; avatar_url: string | null; phone: string } | null;
  category?: { name_uz: string; icon_name: string | null };
}

// ─── Customer ────────────────────────────────────────────

export async function createOrder(input: {
  customer_id: string;
  category_id: string;
  description?: string;
  photo_urls?: string[];
  address?: string;
  location_lat?: number;
  location_lng?: number;
}) {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_id: input.customer_id,
      category_id: input.category_id,
      description: input.description || null,
      photo_urls: input.photo_urls ?? [],
      address: input.address || null,
      location_lat: input.location_lat ?? null,
      location_lng: input.location_lng ?? null,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadOrderPhotos(orderId: string, uris: string[]): Promise<string[]> {
  const urls: string[] = [];

  for (let i = 0; i < uris.length; i++) {
    const uri = uris[i];
    const path = `${orderId}/photo_${i}.jpg`;

    const base64 = await readFileAsBase64(uri);

    const { error } = await supabase.storage
      .from("order-photos")
      .upload(path, decode(base64), {
        upsert: true,
        contentType: "image/jpeg",
      });

    if (error) throw error;

    const { data } = supabase.storage.from("order-photos").getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return urls;
}

// ─── Master — Pending Requests ───────────────────────────

export async function fetchPendingRequests() {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id, description, address, status, created_at,
      customer:profiles!orders_customer_id_fkey ( full_name, avatar_url, phone ),
      category:service_categories!orders_category_id_fkey ( name_uz, icon_name )
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ─── Master — My Orders ─────────────────────────────────

export async function fetchMasterOrders(masterId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id, description, address, status, price_agreed, created_at, updated_at,
      customer:profiles!orders_customer_id_fkey ( full_name, avatar_url, phone ),
      category:service_categories!orders_category_id_fkey ( name_uz, icon_name )
    `)
    .eq("master_id", masterId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ─── Master — Accept Order ───────────────────────────────

export async function acceptOrder(orderId: string, masterId: string) {
  const { error } = await supabase
    .from("orders")
    .update({ master_id: masterId, status: "accepted" })
    .eq("id", orderId);

  if (error) throw error;
}

// ─── Master — Update Status ──────────────────────────────

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) throw error;
}

// ─── Master — Earnings ───────────────────────────────────

export async function fetchMasterEarnings(masterId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("id, price_agreed, created_at, updated_at, status")
    .eq("master_id", masterId)
    .eq("status", "completed")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  const orders = data ?? [];
  const total = orders.reduce((sum, o) => sum + (o.price_agreed ?? 0), 0);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thisMonth = orders
    .filter((o) => o.updated_at >= startOfMonth)
    .reduce((sum, o) => sum + (o.price_agreed ?? 0), 0);

  const today = new Date().toISOString().slice(0, 10);
  const todayEarnings = orders
    .filter((o) => o.updated_at?.slice(0, 10) === today)
    .reduce((sum, o) => sum + (o.price_agreed ?? 0), 0);

  return {
    orders,
    totalCount: orders.length,
    totalEarnings: total,
    thisMonthEarnings: thisMonth,
    todayEarnings,
  };
}
