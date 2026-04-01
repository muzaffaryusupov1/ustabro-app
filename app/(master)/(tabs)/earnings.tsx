import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, spacing, radii, shadows } from "../../../lib/theme";

export default function EarningsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="construct" size={22} color={colors.primary} />
        <Text style={styles.logoText}>Usta Top</Text>
      </View>

      <View style={styles.profileRow}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={28} color={colors.onPrimary} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Azizbek Rahimov</Text>
          <Text style={styles.profileSub}>Professional Santexnik</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={styles.ratingText}>4.9</Text>
            <Text style={styles.reviewCount}>12 ta sharh</Text>
          </View>
        </View>
      </View>

      {/* Earnings section */}
      <View style={styles.earningsHeader}>
        <Text style={styles.sectionTitle}>Daromadlar</Text>
        <Text style={styles.seeAll}>Hisobot →</Text>
      </View>

      {/* Today */}
      <View style={styles.earningCard}>
        <Text style={styles.earningLabel}>Bugun</Text>
        <Text style={styles.earningValue}>450,000</Text>
        <Text style={styles.earningCurrency}>so'm</Text>
      </View>

      {/* Week */}
      <View style={styles.earningCard}>
        <Text style={styles.earningLabel}>Hafta</Text>
        <Text style={styles.earningValue}>2,840,000</Text>
        <Text style={styles.earningCurrency}>so'm</Text>
      </View>

      {/* Total */}
      <View style={styles.earningCard}>
        <Text style={styles.earningLabel}>Jami</Text>
        <Text style={styles.earningValue}>15,420,000</Text>
        <Text style={styles.earningCurrency}>so'm</Text>
      </View>

      {/* Menu items */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[6],
    paddingTop: spacing[2],
    gap: 8,
  },
  logoText: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.primary,
  },

  // Profile
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[5],
    gap: spacing[4],
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.onSurface,
  },
  profileSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.onSurfaceMuted,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.onSurface,
  },
  reviewCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.onSurfacePlaceholder,
    marginLeft: 4,
  },

  // Earnings
  earningsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing[6],
    marginBottom: spacing[3],
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.onSurface,
  },
  seeAll: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.primary,
  },
  earningCard: {
    marginHorizontal: spacing[6],
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...shadows.ambient,
  },
  earningLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.onSurfaceMuted,
    marginBottom: 4,
  },
  earningValue: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.onSurface,
  },
  earningCurrency: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.onSurfacePlaceholder,
  },

  // Menu
  menu: {
    marginTop: spacing[4],
    marginHorizontal: spacing[6],
    gap: spacing[1],
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: spacing[4],
    gap: spacing[3],
    marginBottom: spacing[2],
    ...shadows.ambient,
  },
  menuText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.onSurface,
  },
});
