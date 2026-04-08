import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type Role = "customer" | "master" | null;

interface Profile {
  id: string;
  phone: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
}

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  role: Role;
  isLoading: boolean;

  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  syncSession: (session: Session | null) => Promise<void>;
}

async function fetchProfile(session: Session) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, phone, full_name, avatar_url, role")
    .eq("id", session.user.id)
    .single();

  return profile ?? null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  role: null,
  isLoading: true,

  setSession: (session) => set({ session, isLoading: false }),

  setProfile: (profile) =>
    set({ profile, role: profile?.role ?? null }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null, role: null, isLoading: false });
  },

  initialize: async () => {
    set({ isLoading: true });

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      await get().syncSession(session);
    } catch {
      set({ session: null, profile: null, role: null, isLoading: false });
    }
  },

  syncSession: async (session) => {
    if (!session?.user) {
      set({ session: null, profile: null, role: null, isLoading: false });
      return;
    }

    try {
      const profile = await fetchProfile(session);

      set({
        session,
        profile,
        role: (profile?.role as Role) ?? null,
        isLoading: false,
      });
    } catch {
      set({
        session,
        profile: null,
        role: null,
        isLoading: false,
      });
    }
  },
}));
