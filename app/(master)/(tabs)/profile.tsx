import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, spacing, radii, shadows } from "../../../lib/theme";
import { Avatar } from "../../../components/ui/Avatar";
import { useAuthStore } from "../../../store/authStore";
import { t } from "../../../i18n";

export default function MasterProfileScreen() {
  const { profile, signOut } = useAuthStore();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
          <Text style={styles.headerSub}>Usta Top</Text>
        </View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <Avatar uri={profile?.avatar_url} name={profile?.full_name} size={80} />
          <Text style={styles.name}>{profile?.full_name ?? "Foydalanuvchi"}</Text>
          <Text style={styles.phone}>{profile?.phone}</Text>

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>BUYURTMALAR</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>REYTING</Text>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {[
            { icon: "document-text-outline" as const, label: "Mening buyurtmalarim" },
            { icon: "list-outline" as const, label: "To'lovlar" },
            { icon: "settings-outline" as const, label: "Sozlamalar" },
          ].map((item, i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: colors.surfaceContainerLow },
              ]}
            >
              <Ionicons name={item.icon} size={22} color={colors.primary} />
              <Text style={styles.menuText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.onSurfacePlaceholder} />
            </Pressable>
          ))}
        </View>

        {/* Master mode badge */}
        <View style={styles.masterBadge}>
          <Ionicons name="construct-outline" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.masterBadgeTitle}>Usta sifatida ishlash</Text>
            <Text style={styles.masterBadgeDesc}>Siz usta sifatida bog'lang</Text>
          </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.onSurface,
  },
  headerSub: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.primary,
  },

  // Profile card
  profileCard: {
    alignItems: "center",
    paddingVertical: spacing[6],
    gap: spacing[2],
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.onSurface,
    marginTop: spacing[3],
  },
  phone: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.onSurfaceMuted,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing[4],
    gap: spacing[6],
  },
  statItem: {
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.onSurface,
  },
  statLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.onSurfacePlaceholder,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.surfaceContainerHigh,
  },

  // Menu
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
  menuText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.onSurface,
  },

  // Master badge
  masterBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing[6],
    marginTop: spacing[5],
    backgroundColor: colors.secondaryContainer,
    borderRadius: radii.xl,
    padding: spacing[4],
    gap: spacing[3],
  },
  masterBadgeTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.onSecondaryContainer,
  },
  masterBadgeDesc: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.secondary,
  },

  // Sign out
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing[6],
    marginTop: spacing[4],
    padding: spacing[4],
    borderRadius: radii.xl,
    gap: spacing[3],
  },
  signOutText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.error,
  },
});
