import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Slot, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as AppleSplashScreen from 'expo-splash-screen';
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
import { useI18nStore } from "../i18n";
import { supabase } from "../lib/supabase";
import { colors } from "../lib/theme";
import { SplashScreen } from "../components/ui/SplashScreen";

AppleSplashScreen.preventAutoHideAsync().catch(() => { });

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
    return <SplashScreen />;
  }

  return <Slot />;
}

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const [minSplashTimePassed, setMinSplashTimePassed] = useState(false);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    initialize();
    useI18nStore.getState().initialize();

    // Force splash screen to stay visible for at least 2 seconds
    const timer = setTimeout(() => {
      setMinSplashTimePassed(true);
    }, 2000);

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

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [initialize]);

  useEffect(() => {
    if (fontsLoaded && minSplashTimePassed) {
      // Hide the native splash screen when our custom layout and timeout are ready
      AppleSplashScreen.hideAsync().catch(() => { });
    }
  }, [fontsLoaded, minSplashTimePassed]);

  if (!fontsLoaded || !minSplashTimePassed) {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <AuthGate />
      </QueryClientProvider>
    </GestureHandlerRootView>
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
