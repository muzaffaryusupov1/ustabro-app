import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { colors, fonts, spacing, radii, shadows } from "../../../lib/theme";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { supabase } from "../../../lib/supabase";
import { useTranslation } from "../../../hooks/useTranslation";
import { formatPhoneNumber } from "../../../lib/utils";

function useMasterPublicProfile(masterId: string | undefined) {
  return useQuery({
    queryKey: ["master-public-profile", masterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id, full_name, avatar_url, phone,
          master_profiles (
            bio, skills, experience_years, rating, review_count, is_available
          )
        `)
        .eq("id", masterId!)
        .eq("role", "master")
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!masterId,
  });
}

export default function MasterPublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: master, isLoading } = useMasterPublicProfile(id);
  const { t } = useTranslation()

  const mp = (master as any)?.master_profiles as any;

  const handleCall = () => {
    if (master?.phone) {
      Linking.openURL(`tel:${master.phone}`);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </Pressable>
        </View>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (!master) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </Pressable>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t("master.notFound")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const rating = Number(mp?.rating ?? 0);
  const reviewCount = mp?.review_count ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("master.profile")}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile */}
        <View style={styles.profileSection}>
          <Avatar uri={master.avatar_url} name={master.full_name} size={80} />
          <Text style={styles.name}>{master.full_name ?? t("unknown.master")}</Text>

          {mp?.is_available ? (
            <View style={styles.availBadge}>
              <View style={styles.availDot} />
              <Text style={styles.availText}>{t("master.available")}</Text>
            </View>
          ) : (
            <Text style={styles.busyText}>{t("master.busy")}</Text>
          )}

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={18} color="#F59E0B" />
                <Text style={styles.statValue}>{rating.toFixed(1)}</Text>
              </View>
              <Text style={styles.statLabel}>{t("rating")}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{reviewCount}</Text>
              <Text style={styles.statLabel}>{t("reviews")}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mp?.experience_years ?? 0}</Text>
              <Text style={styles.statLabel}>{t("experience")}</Text>
            </View>
          </View>
        </View>

        {/* Bio */}
        {mp?.bio && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t("about.master")}</Text>
            <Text style={styles.cardText}>{mp.bio}</Text>
          </View>
        )}

        {/* Skills */}
        {mp?.skills && mp.skills.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t("skills")}</Text>
            <View style={styles.chipRow}>
              {mp.skills.map((skill: string) => (
                <View key={skill} style={styles.chip}>
                  <Text style={styles.chipText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Phone */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t("phone")}</Text>
          <Text style={styles.cardText}>{formatPhoneNumber(master.phone)}</Text>
        </View>
      </ScrollView>

      {/* Call button */}
      <View style={styles.bottomFixed}>
        <Button
          title={t("master.call")}
          onPress={handleCall}
          icon={<Ionicons name="call" size={20} color={colors.onPrimary} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    gap: spacing[3],
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.onSurface,
  },
  scrollContent: { paddingBottom: 100 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontFamily: fonts.medium, fontSize: 16, color: colors.onSurfaceMuted },

  // Profile
  profileSection: {
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
  availBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.statusCompletedBg,
    paddingHorizontal: spacing[3],
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  availDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  availText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.statusCompletedText,
  },
  busyText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.onSurfaceMuted,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing[4],
    gap: spacing[6],
  },
  statItem: { alignItems: "center", gap: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  statValue: { fontFamily: fonts.bold, fontSize: 20, color: colors.onSurface },
  statLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.onSurfacePlaceholder,
    letterSpacing: 0.5,
  },
  statDivider: { width: 1, height: 32, backgroundColor: colors.surfaceContainerHigh },

  // Cards
  card: {
    marginHorizontal: spacing[6],
    marginBottom: spacing[3],
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: spacing[4],
    gap: spacing[2],
    ...shadows.ambient,
  },
  cardLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.onSurfacePlaceholder,
  },
  cardText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing[2] },
  chip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radii.full,
    backgroundColor: colors.secondaryContainer,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.onSecondaryContainer,
  },

  // Bottom
  bottomFixed: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[6],
    paddingTop: spacing[3],
    backgroundColor: colors.surface,
  },
});
