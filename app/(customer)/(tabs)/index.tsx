import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, fonts, spacing, radii, shadows } from "../../../lib/theme";
import { useCategories } from "../../../hooks/useCategories";
import { useMasters } from "../../../hooks/useMasters";
import { Avatar } from "../../../components/ui/Avatar";

const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  "flash-outline": "flash-outline",
  "water-outline": "water-outline",
  "hardware-chip-outline": "hardware-chip-outline",
  "bed-outline": "bed-outline",
  "construct-outline": "construct-outline",
  "ellipsis-horizontal-outline": "ellipsis-horizontal-outline",
};

export default function CustomerHomeScreen() {
  const { data: categories, refetch: refetchCategories } = useCategories();
  const { data: masters, isLoading: mastersLoading, refetch: refetchMasters, isRefetching } = useMasters();

  const onRefresh = () => {
    refetchCategories();
    refetchMasters();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Ionicons name="construct" size={24} color={colors.primary} />
            <Text style={styles.logoText}>UstaBro</Text>
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
          <Text style={styles.heroText}>USTA CHAQIRISH</Text>
          <Text style={styles.heroHint}>Barcha ustalarga so'rov yuboriladi</Text>
        </Pressable>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Xizmat turlari</Text>
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
          </View>

          {mastersLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
          ) : (masters ?? []).length === 0 ? (
            <Text style={styles.emptyText}>Hozircha ustalar topilmadi</Text>
          ) : (
            (masters ?? []).map((master) => (
              <Pressable
                key={master.id}
                style={({ pressed }) => [styles.masterCard, pressed && { opacity: 0.8 }]}
                onPress={() => router.push({ pathname: "/(customer)/master/[id]", params: { id: master.id } })}
              >
                <Avatar uri={master.avatar_url} name={master.full_name} size={48} />
                <View style={styles.masterInfo}>
                  <Text style={styles.masterName}>
                    {master.full_name ?? "Usta"}
                  </Text>
                  <Text style={styles.masterSkill}>
                    {master.skills.slice(0, 2).join(" · ")}
                    {master.experience_years > 0 ? ` · ${master.experience_years} yil` : ""}
                  </Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={styles.ratingText}>
                      {Number(master.rating).toFixed(1)}
                    </Text>
                    <Text style={styles.reviewCount}>
                      {master.review_count} ta sharh
                    </Text>
                    {master.address && (
                      <Text style={styles.distanceText}>
                        · {master.address}
                      </Text>
                    )}
                  </View>
                </View>
              </Pressable>
            ))
          )}
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
  heroHint: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.onPrimary,
    opacity: 0.75,
  },
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
  reviewCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.onSurfacePlaceholder,
  },
  distanceText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.onSurfacePlaceholder,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.onSurfaceMuted,
    textAlign: "center",
    paddingTop: 20,
  },
});
