import { View, Text, StyleSheet, ScrollView, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, fonts, spacing, radii, shadows } from "../../../lib/theme";
import { useCategories } from "../../../hooks/useCategories";
import { Avatar } from "../../../components/ui/Avatar";
import { t } from "../../../i18n";

const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  "flash-outline": "flash-outline",
  "water-outline": "water-outline",
  "hardware-chip-outline": "hardware-chip-outline",
  "bed-outline": "bed-outline",
  "construct-outline": "construct-outline",
  "ellipsis-horizontal-outline": "ellipsis-horizontal-outline",
};

export default function CustomerHomeScreen() {
  const { data: categories } = useCategories();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Ionicons name="construct" size={24} color={colors.primary} />
            <Text style={styles.logoText}>Usta Top</Text>
          </View>
        </View>

        {/* Hero CTA */}
        <Pressable
          style={({ pressed }) => [
            styles.heroCta,
            pressed && { backgroundColor: colors.primaryFixedDim },
          ]}
          onPress={() => router.push("/(customer)/categories")}
        >
          <Ionicons name="construct" size={36} color={colors.onPrimary} style={{ opacity: 0.9 }} />
          <Text style={styles.heroText}>USTA CHAQURISH</Text>
        </Pressable>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("home.cta") === "Usta Chaqirish" ? "Xizmat turlari" : "Xizmat turlari"}</Text>
            <Pressable onPress={() => router.push("/(customer)/categories")}>
              <Text style={styles.seeAll}>Hammasi</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {(categories ?? []).slice(0, 6).map((cat) => (
              <Pressable
                key={cat.id}
                style={({ pressed }) => [
                  styles.categoryChip,
                  pressed && { backgroundColor: colors.surfaceContainerLow },
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/(customer)/create-request",
                    params: { categoryId: cat.id, categoryName: cat.name_uz },
                  })
                }
              >
                <View style={styles.categoryIconWrap}>
                  <Ionicons
                    name={CATEGORY_ICONS[cat.icon_name ?? ""] ?? "ellipsis-horizontal-outline"}
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.categoryName} numberOfLines={1}>
                  {cat.name_uz}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Nearby masters */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Yaqin oradagi ustalar</Text>
            <Pressable>
              <Text style={styles.seeAll}>Barchasi</Text>
            </Pressable>
          </View>

          {/* Placeholder masters */}
          {[1, 2].map((i) => (
            <View key={i} style={styles.masterCard}>
              <Avatar name={i === 1 ? "Olimjon aka" : "Shavkat Karimov"} size={48} />
              <View style={styles.masterInfo}>
                <Text style={styles.masterName}>
                  {i === 1 ? "Olimjon aka" : "Shavkat Karimov"}
                </Text>
                <Text style={styles.masterSkill}>
                  {i === 1 ? "Elektrik · 5 yil tajriba" : "Santexnik · 8 yil tajriba"}
                </Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>{i === 1 ? "4.8" : "4.6"}</Text>
                  <Text style={styles.distanceText}>
                    {i === 1 ? "1.2 km uzoqlikda" : "2.5 km uzoqlikda"}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[2],
    paddingBottom: spacing[4],
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoText: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.primary,
  },

  // Hero CTA
  heroCta: {
    marginHorizontal: spacing[6],
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: spacing[6],
  },
  heroText: {
    fontFamily: fonts.extraBold,
    fontSize: 20,
    color: colors.onPrimary,
    letterSpacing: 1,
  },

  // Sections
  section: {
    marginBottom: spacing[6],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing[6],
    marginBottom: spacing[4],
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

  // Category row
  categoryRow: {
    paddingHorizontal: spacing[6],
    gap: 12,
  },
  categoryChip: {
    alignItems: "center",
    width: 72,
    gap: 8,
  },
  categoryIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.ambient,
  },
  categoryName: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },

  // Master cards
  masterCard: {
    flexDirection: "row",
    marginHorizontal: spacing[6],
    marginBottom: spacing[3],
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: spacing[4],
    gap: spacing[3],
    ...shadows.ambient,
  },
  masterInfo: {
    flex: 1,
    gap: 2,
  },
  masterName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.onSurface,
  },
  masterSkill: {
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
  distanceText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.onSurfacePlaceholder,
    marginLeft: 8,
  },
});
