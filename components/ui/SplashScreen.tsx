import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, fonts, spacing, radii } from "../../lib/theme";

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo Container */}
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="tools" size={48} color={colors.primary} />
        </View>

        {/* Brand Name */}
        <Text style={styles.brandTitle}>UstaBro</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>Sifatli xizmat, ishonchli qo'llar</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[6],
  },
  brandTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    color: colors.onSurface,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.onSurfaceMuted,
  },
});
