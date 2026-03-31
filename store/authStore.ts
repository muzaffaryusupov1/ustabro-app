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
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  role: null,
  isLoading: true,

  setSession: (session) => set({ session }),

  setProfile: (profile) =>
    set({ profile, role: profile?.role ?? null }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null, role: null });
  },

  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, phone, full_name, avatar_url, role")
          .eq("id", session.user.id)
          .single();

        set({
          session,
          profile: profile ?? null,
          role: (profile?.role as Role) ?? null,
          isLoading: false,
        });
      } else {
        set({ session: null, profile: null, role: null, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
