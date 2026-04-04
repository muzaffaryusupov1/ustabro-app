import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Switch,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { colors, fonts, spacing, radii, shadows } from "../../../lib/theme";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { useAuthStore } from "../../../store/authStore";
import {
  fetchMasterProfile,
  fetchMasterOrderCount,
  updateProfile,
  updateMasterProfile,
  uploadAvatar,
} from "../../../services/profiles";
import { useI18nStore, t } from "../../../i18n";
import type BottomSheet from "@gorhom/bottom-sheet";
import { LanguageBottomSheet } from "../../../components/ui/LanguageBottomSheet";

const SKILL_OPTIONS = [
  "Elektrika",
  "Santexnika",
  "Maishiy texnika",
  "Mebel",
  "Qurilish",
  "Boshqa",
];

export default function MasterProfileScreen() {
  const { profile, signOut, setProfile } = useAuthStore();
  const locale = useI18nStore((s) => s.locale);
  const queryClient = useQueryClient();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const userId = profile?.id;

  const { data: masterProfile, isLoading: mpLoading } = useQuery({
    queryKey: ["master-profile", userId],
    queryFn: () => fetchMasterProfile(userId!),
    enabled: !!userId,
  });

  const { data: orderCount } = useQuery({
    queryKey: ["master-order-count", userId],
    queryFn: () => fetchMasterOrderCount(userId!),
    enabled: !!userId,
  });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);

  // Sync form state when data loads or edit mode enters
  useEffect(() => {
    if (profile && masterProfile) {
      setName(profile.full_name ?? "");
      setBio(masterProfile.bio ?? "");
      setExperience(String(masterProfile.experience_years ?? 0));
      setSkills(masterProfile.skills ?? []);
      setIsAvailable(masterProfile.is_available ?? true);
      setAvatarUri(null);
    }
  }, [profile, masterProfile]);

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    if (!name.trim()) {
      Alert.alert("", t("error.name_required"));
      return;
    }
    if (skills.length === 0) {
      Alert.alert("", t("error.skills_required"));
      return;
    }

    setSaving(true);
    try {
      let newAvatarUrl = profile?.avatar_url ?? null;
      if (avatarUri) {
        newAvatarUrl = await uploadAvatar(userId, avatarUri);
      }

      await updateProfile(userId, {
        full_name: name.trim(),
        avatar_url: newAvatarUrl,
      });

      await updateMasterProfile(userId, {
        bio: bio.trim() || null,
        skills,
        experience_years: parseInt(experience) || 0,
        is_available: isAvailable,
      });

      // Update local auth store
      setProfile({ ...profile!, full_name: name.trim(), avatar_url: newAvatarUrl });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["master-profile", userId] });

      setEditing(false);
      Alert.alert("", t("profile.saved"));
    } catch {
      Alert.alert("", t("error.generic"));
    } finally {
      setSaving(false);
    }
  };

  if (mpLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  const displayAvatar = avatarUri ?? profile?.avatar_url;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
          {!editing && (
            <Pressable onPress={() => setEditing(true)}>
              <Text style={styles.editBtn}>{t("profile.edit")}</Text>
            </Pressable>
          )}
        </View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          {editing ? (
            <Pressable onPress={pickAvatar}>
              {displayAvatar ? (
                <Image source={{ uri: displayAvatar }} style={styles.avatarImg} />
              ) : (
                <Avatar uri={null} name={name} size={80} />
              )}
              <View style={styles.avatarBadge}>
                <Ionicons name="camera" size={14} color={colors.onPrimary} />
              </View>
            </Pressable>
          ) : (
            <Avatar uri={profile?.avatar_url} name={profile?.full_name} size={80} />
          )}

          {editing ? (
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder={t("auth.profile.full_name_placeholder")}
              placeholderTextColor={colors.onSurfacePlaceholder}
            />
          ) : (
            <>
              <Text style={styles.name}>{profile?.full_name ?? "Foydalanuvchi"}</Text>
              <Text style={styles.phone}>{profile?.phone}</Text>
            </>
          )}

          {/* Stats (read-only) */}
          {!editing && (
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{orderCount ?? 0}</Text>
                <Text style={styles.statLabel}>BUYURTMALAR</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Number(masterProfile?.rating ?? 0).toFixed(1)}
                </Text>
                <Text style={styles.statLabel}>REYTING</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{masterProfile?.review_count ?? 0}</Text>
                <Text style={styles.statLabel}>BAHOLAR</Text>
              </View>
            </View>
          )}
        </View>

        {editing ? (
          /* ─── Edit Mode ─── */
          <View style={styles.editSection}>
            {/* Bio */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t("profile.bio")}</Text>
              <TextInput
                style={styles.textArea}
                value={bio}
                onChangeText={setBio}
                placeholder={t("profile.bio_placeholder")}
                placeholderTextColor={colors.onSurfacePlaceholder}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Experience */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t("profile.experience")}</Text>
              <TextInput
                style={styles.input}
                value={experience}
                onChangeText={setExperience}
                keyboardType="numeric"
                placeholderTextColor={colors.onSurfacePlaceholder}
              />
            </View>

            {/* Skills */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t("auth.profile.skills")}</Text>
              <View style={styles.chipRow}>
                {SKILL_OPTIONS.map((skill) => {
                  const selected = skills.includes(skill);
                  return (
                    <Pressable
                      key={skill}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => toggleSkill(skill)}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                        {skill}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Availability */}
            <View style={styles.availRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.availLabel}>{t("profile.availability")}</Text>
              </View>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
                trackColor={{ false: colors.surfaceContainerHigh, true: colors.primaryContainer }}
                thumbColor={isAvailable ? colors.onPrimary : colors.onSurfacePlaceholder}
              />
            </View>

            {/* Save / Cancel */}
            <View style={styles.editActions}>
              <Button title={t("profile.save")} onPress={handleSave} loading={saving} />
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setEditing(false)}
              >
                <Text style={styles.cancelText}>{t("general.cancel")}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          /* ─── View Mode ─── */
          <>
            {/* Bio */}
            {masterProfile?.bio && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>{t("profile.bio")}</Text>
                <Text style={styles.infoText}>{masterProfile.bio}</Text>
              </View>
            )}

            {/* Skills */}
            {masterProfile?.skills && masterProfile.skills.length > 0 && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>{t("auth.profile.skills")}</Text>
                <View style={styles.chipRow}>
                  {masterProfile.skills.map((skill: string) => (
                    <View key={skill} style={[styles.chip, styles.chipSelected]}>
                      <Text style={[styles.chipText, styles.chipTextSelected]}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Experience & Availability */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="briefcase-outline" size={18} color={colors.onSurfaceMuted} />
                <Text style={styles.infoRowText}>
                  {masterProfile?.experience_years ?? 0} yil tajriba
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons
                  name={masterProfile?.is_available ? "checkmark-circle" : "close-circle"}
                  size={18}
                  color={masterProfile?.is_available ? colors.primary : colors.onSurfaceMuted}
                />
                <Text style={styles.infoRowText}>
                  {masterProfile?.is_available ? "Buyurtmalarga tayyor" : "Band"}
                </Text>
              </View>
            </View>

            {/* Language switcher */}
            <Pressable
              style={({ pressed }) => [
                styles.infoCard,
                { flexDirection: "row", alignItems: "center" },
                pressed && { backgroundColor: colors.surfaceContainerLow },
              ]}
              onPress={() => bottomSheetRef.current?.snapToIndex(0)}
            >
              <Ionicons name="language-outline" size={18} color={colors.onSurfaceMuted} />
              <Text style={[styles.infoRowText, { flex: 1 }]}>{t("language.title")}</Text>
              <Text style={styles.langValue}>{locale === "uz" ? "🇺🇿 O'zbekcha" : "🇷🇺 Русский"}</Text>
            </Pressable>

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
          </>
        )}
      </ScrollView>

      <LanguageBottomSheet ref={bottomSheetRef} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  headerTitle: { fontFamily: fonts.bold, fontSize: 24, color: colors.onSurface },
  editBtn: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.primary },

  // Profile card
  profileCard: {
    alignItems: "center",
    paddingVertical: spacing[6],
    gap: spacing[2],
  },
  avatarImg: { width: 80, height: 80, borderRadius: 40 },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.onSurface,
    marginTop: spacing[3],
  },
  phone: { fontFamily: fonts.regular, fontSize: 14, color: colors.onSurfaceMuted },
  nameInput: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.onSurface,
    textAlign: "center",
    marginTop: spacing[3],
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    minWidth: 200,
  },

  // Stats
  stats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing[4],
    gap: spacing[6],
  },
  statItem: { alignItems: "center", gap: 2 },
  statValue: { fontFamily: fonts.bold, fontSize: 20, color: colors.onSurface },
  statLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.onSurfacePlaceholder,
    letterSpacing: 0.5,
  },
  statDivider: { width: 1, height: 32, backgroundColor: colors.surfaceContainerHigh },

  // Edit section
  editSection: { paddingHorizontal: spacing[6], gap: spacing[4] },
  fieldGroup: { gap: spacing[2] },
  fieldLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.onSurfacePlaceholder,
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  textArea: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    minHeight: 80,
    textAlignVertical: "top",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing[2] },
  chip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  chipSelected: { backgroundColor: colors.secondaryContainer },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.onSurfaceMuted },
  chipTextSelected: { color: colors.onSecondaryContainer },

  // Availability
  availRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: spacing[4],
    ...shadows.ambient,
  },
  availLabel: { fontFamily: fonts.medium, fontSize: 15, color: colors.onSurface },

  // Edit actions
  editActions: { gap: spacing[3], marginTop: spacing[2] },
  cancelBtn: { alignItems: "center", paddingVertical: spacing[3] },
  cancelText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.onSurfaceMuted },

  // View mode info cards
  infoCard: {
    marginHorizontal: spacing[6],
    marginBottom: spacing[3],
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: spacing[4],
    gap: spacing[3],
    ...shadows.ambient,
  },
  infoLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.onSurfacePlaceholder,
  },
  infoText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: spacing[3] },
  infoRowText: { fontFamily: fonts.medium, fontSize: 14, color: colors.onSurfaceVariant },

  // Sign out
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
  langValue: { fontFamily: fonts.medium, fontSize: 13, color: colors.onSurfaceMuted },
  signOutText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.error },
});
