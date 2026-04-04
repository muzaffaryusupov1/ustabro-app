import { useEffect } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { Slot, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { queryClient } from "../lib/queryClient";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";
import { colors } from "../lib/theme";

function AuthGate() {
  const { session, role, isLoading } = useAuthStore();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session) {
      if (!inAuthGroup) {
        router.replace("/(auth)/");
      }
    } else if (!role) {
      const secondSegment = (segments as string[])[1] as string | undefined;
      if (secondSegment !== "role-select" || !inAuthGroup) {
        router.replace("/(auth)/role-select");
      }
    } else {
      const inCorrectGroup =
        (role === "customer" && segments[0] === "(customer)") ||
        (role === "master" && segments[0] === "(master)");
      if (!inCorrectGroup) {
        router.replace(
          role === "customer" ? "/(customer)/" : "/(master)/"
        );
      }
    }
  }, [session, role, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Fetch profile alongside session to avoid role=null flash
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, phone, full_name, avatar_url, role")
          .eq("id", session.user.id)
          .single();

        useAuthStore.setState({
          session,
          profile: profile ?? null,
          role: (profile?.role as "customer" | "master" | null) ?? null,
        });
      } else {
        useAuthStore.setState({ session: null, profile: null, role: null });
      }
    });

    return () => subscription.unsubscribe();
  }, [initialize]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
    backgroundColor: colors.surface,
  },
});
