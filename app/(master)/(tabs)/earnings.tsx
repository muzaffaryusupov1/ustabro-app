import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, spacing, radii, shadows } from "../../../lib/theme";
import { useAuthStore } from "../../../store/authStore";
import { useEarnings } from "../../../hooks/useEarnings";
import { Avatar } from "../../../components/ui/Avatar";

function formatSum(n: number): string {
  return n.toLocaleString("uz-UZ");
}

export default function EarningsScreen() {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const { data: earnings, isLoading } = useEarnings(session?.user.id);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="construct" size={22} color={colors.primary} />
          <Text style={styles.logoText}>Usta Top</Text>
        </View>

        <View style={styles.profileRow}>
          <Avatar uri={profile?.avatar_url} name={profile?.full_name} size={56} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.full_name ?? "Usta"}</Text>
            <Text style={styles.profileSub}>{profile?.role === "master" ? "Professional usta" : ""}</Text>
          </View>
        </View>

        <View style={styles.earningsHeader}>
          <Text style={styles.sectionTitle}>Daromadlar</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <>
            <View style={styles.earningCard}>
              <Text style={styles.earningLabel}>Bugun</Text>
              <Text style={styles.earningValue}>{formatSum(earnings?.todayEarnings ?? 0)}</Text>
              <Text style={styles.earningCurrency}>so'm</Text>
            </View>

            <View style={styles.earningCard}>
              <Text style={styles.earningLabel}>Shu oy</Text>
              <Text style={styles.earningValue}>{formatSum(earnings?.thisMonthEarnings ?? 0)}</Text>
              <Text style={styles.earningCurrency}>so'm</Text>
            </View>

            <View style={styles.earningCard}>
              <Text style={styles.earningLabel}>Jami ({earnings?.totalCount ?? 0} ta buyurtma)</Text>
              <Text style={styles.earningValue}>{formatSum(earnings?.totalEarnings ?? 0)}</Text>
              <Text style={styles.earningCurrency}>so'm</Text>
            </View>
          </>
        )}

        <View style={styles.menu}>
          {[
            { icon: "settings-outline" as const, label: "Xizmatlarni boshqarish" },
            { icon: "location-outline" as const, label: "Shaharlar" },
            { icon: "document-text-outline" as const, label: "Sozlamalar" },
          ].map((item, i) => (
            <View key={i} style={styles.menuItem}>
              <Ionicons name={item.icon} size={22} color={colors.primary} />
              <Text style={styles.menuText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.onSurfacePlaceholder} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing[6], paddingTop: spacing[2], gap: 8 },
  logoText: { fontFamily: fonts.bold, fontSize: 18, color: colors.primary },
  profileRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing[6], paddingVertical: spacing[5], gap: spacing[4] },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { fontFamily: fonts.bold, fontSize: 18, color: colors.onSurface },
  profileSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.onSurfaceMuted },
  earningsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing[6], marginBottom: spacing[3] },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.onSurface },
  earningCard: { marginHorizontal: spacing[6], backgroundColor: colors.surfaceContainerLowest, borderRadius: radii.xl, padding: spacing[4], marginBottom: spacing[3], ...shadows.ambient },
  earningLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.onSurfaceMuted, marginBottom: 4 },
  earningValue: { fontFamily: fonts.bold, fontSize: 28, color: colors.onSurface },
  earningCurrency: { fontFamily: fonts.regular, fontSize: 13, color: colors.onSurfacePlaceholder },
  menu: { marginTop: spacing[4], marginHorizontal: spacing[6], gap: spacing[1] },
  menuItem: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceContainerLowest, borderRadius: radii.xl, padding: spacing[4], gap: spacing[3], marginBottom: spacing[2], ...shadows.ambient },
  menuText: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.onSurface },
});
