import { useEffect } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { Slot, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";

function AuthGate() {
  const { session, role, isLoading } = useAuthStore();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session) {
      // No session → go to auth
      if (!inAuthGroup) {
        router.replace("/(auth)/");
      }
    } else if (!role) {
      // Session but no role → role selection
      const secondSegment = (segments as string[])[1] as string | undefined;
      if (secondSegment !== "role-select" || !inAuthGroup) {
        router.replace("/(auth)/role-select");
      }
    } else {
      // Session + role → go to correct home
      if (inAuthGroup) {
        router.replace(
          role === "customer" ? "/(customer)/" : "/(master)/"
        );
      }
    }
  }, [session, role, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        useAuthStore.setState({ profile: null, role: null });
      }
    });

    return () => subscription.unsubscribe();
  }, [initialize, setSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <AuthGate />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
