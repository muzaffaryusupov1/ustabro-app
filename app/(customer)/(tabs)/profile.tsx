import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, spacing, radii } from "../../../lib/theme";
import { useAuthStore } from "../../../store/authStore";
import { Avatar } from "../../../components/ui/Avatar";
import { t } from "../../../i18n";

export default function ProfileScreen() {
  const { profile, signOut } = useAuthStore();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Profil</Text>

      <View style={styles.profileCard}>
        <Avatar uri={profile?.avatar_url} name={profile?.full_name} size={72} />
        <Text style={styles.name}>{profile?.full_name ?? "Foydalanuvchi"}</Text>
        <Text style={styles.phone}>{profile?.phone}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.signOutBtn,
          pressed && { backgroundColor: colors.surfaceContainerLow },
        ]}
        onPress={signOut}
      >
        <Text style={styles.signOutText}>{t("profile.sign_out")}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.onSurface,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: spacing[8],
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
  signOutBtn: {
    marginHorizontal: spacing[6],
    marginTop: spacing[6],
    padding: spacing[4],
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: "center",
  },
  signOutText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.error,
  },
});
