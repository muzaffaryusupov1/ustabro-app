import { useEffect, useState } from "react";
import { Slot, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as NativeSplashScreen from "expo-splash-screen";
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

NativeSplashScreen.preventAutoHideAsync().catch(() => {});
NativeSplashScreen.setOptions({
  duration: 250,
  fade: true,
});

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
    return null;
  }

  return <Slot />;
}

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const syncSession = useAuthStore((s) => s.syncSession);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const [nativeSplashHidden, setNativeSplashHidden] = useState(false);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    void initialize();
    useI18nStore.getState().initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") {
        return;
      }

      if (event === "TOKEN_REFRESHED") {
        useAuthStore.getState().setSession(session);
        return;
      }

      void syncSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialize, syncSession]);

  const appReady = fontsLoaded && !isAuthLoading;

  useEffect(() => {
    if (!appReady || nativeSplashHidden) {
      return;
    }

    NativeSplashScreen.hideAsync()
      .catch(() => {})
      .finally(() => {
        setNativeSplashHidden(true);
      });
  }, [appReady, nativeSplashHidden]);

  if (!appReady) {
    return null;
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
