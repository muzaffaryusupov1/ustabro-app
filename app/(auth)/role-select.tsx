import { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import { colors, fonts, spacing, radii, shadows } from "../../lib/theme";
import { t } from "../../i18n";

type Role = "customer" | "master";

export default function RoleSelectScreen() {
  const [loading, setLoading] = useState(false);
  const session = useAuthStore((s) => s.session);
  const setProfile = useAuthStore((s) => s.setProfile);
  const profile = useAuthStore((s) => s.profile);

  const handleSelect = async (role: Role) => {
    if (!session?.user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", session.user.id);

      if (error) {
        Alert.alert("", t("error.generic"));
        return;
      }

      if (role === "master") {
        await supabase
          .from("master_profiles")
          .upsert({ id: session.user.id });
      }

      setProfile({ ...profile!, role });

      router.replace(
        role === "customer" ? "/(customer)/" : "/(master)/"
      );
    } catch {
      Alert.alert("", t("error.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("auth.role.title")}</Text>

      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={() => handleSelect("customer")}
        disabled={loading}
      >
        <Text style={styles.cardIcon}>👤</Text>
        <Text style={styles.cardTitle}>{t("auth.role.customer")}</Text>
        <Text style={styles.cardDesc}>{t("auth.role.customer_desc")}</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={() => handleSelect("master")}
        disabled={loading}
      >
        <Text style={styles.cardIcon}>🔧</Text>
        <Text style={styles.cardTitle}>{t("auth.role.master")}</Text>
        <Text style={styles.cardDesc}>{t("auth.role.master_desc")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: "center",
    paddingHorizontal: spacing[6],
    gap: spacing[6],
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.onSurface,
    textAlign: "center",
    marginBottom: spacing[4],
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: spacing[6],
    alignItems: "center",
    ...shadows.ambient,
  },
  cardPressed: {
    backgroundColor: colors.surfaceContainerLow,
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: spacing[3],
  },
  cardTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.onSurface,
    marginBottom: 4,
  },
  cardDesc: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.onSurfaceMuted,
  },
});
