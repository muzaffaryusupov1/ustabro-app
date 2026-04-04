import { useRef } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type BottomSheet from "@gorhom/bottom-sheet";
import { colors, fonts, spacing, radii, shadows } from "../../../lib/theme";
import { useAuthStore } from "../../../store/authStore";
import { useI18nStore, t } from "../../../i18n";
import { Avatar } from "../../../components/ui/Avatar";
import { LanguageBottomSheet } from "../../../components/ui/LanguageBottomSheet";

const MENU_ITEMS: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
}[] = [
  { icon: "person-outline", label: "Profilni tahrirlash" },
  { icon: "document-text-outline", label: "Buyurtmalar tarixi" },
  { icon: "location-outline", label: "Saqlangan manzillar" },
  { icon: "card-outline", label: "To'lov usullari" },
  { icon: "notifications-outline", label: "Bildirishnomalar" },
  { icon: "help-circle-outline", label: "Yordam" },
  { icon: "shield-checkmark-outline", label: "Maxfiylik" },
];

export default function ProfileScreen() {
  const { profile, signOut } = useAuthStore();
  const locale = useI18nStore((s) => s.locale);
  const bottomSheetRef = useRef<BottomSheet>(null);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{t("tab.profile")}</Text>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <Avatar uri={profile?.avatar_url} name={profile?.full_name} size={72} />
          <Text style={styles.name}>{profile?.full_name ?? "Foydalanuvchi"}</Text>
          <Text style={styles.phone}>{profile?.phone}</Text>
        </View>

        {/* Menu items */}
        <View style={styles.menu}>
          {MENU_ITEMS.map((item, i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: colors.surfaceContainerLow },
              ]}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.onSurfacePlaceholder} />
            </Pressable>
          ))}

          {/* Language switcher */}
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && { backgroundColor: colors.surfaceContainerLow },
            ]}
            onPress={() => bottomSheetRef.current?.snapToIndex(0)}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="language-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>{t("language.title")}</Text>
            <Text style={styles.langValue}>{locale === "uz" ? "🇺🇿 O'zbekcha" : "🇷🇺 Русский"}</Text>
          </Pressable>
        </View>

        {/* Sign out */}
        <Pressable
          style={({ pressed }) => [
            styles.signOutBtn,
            pressed && { backgroundColor: colors.surfaceContainerLow },
          ]}
          onPress={signOut}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.signOutText}>{t("profile.sign_out")}</Text>
        </Pressable>
      </ScrollView>

      <LanguageBottomSheet ref={bottomSheetRef} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingBottom: 40 },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.onSurface,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: spacing[6],
    gap: spacing[2],
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.onSurface,
    marginTop: spacing[3],
  },
  phone: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.onSurfaceMuted,
  },
  menu: {
    paddingHorizontal: spacing[6],
    gap: spacing[2],
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: spacing[4],
    gap: spacing[3],
    ...shadows.ambient,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.onSurface,
  },
  langValue: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.onSurfaceMuted,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: spacing[6],
    marginTop: spacing[4],
    padding: spacing[4],
    borderRadius: radii.xl,
    gap: spacing[2],
  },
  signOutText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.error,
  },
});
