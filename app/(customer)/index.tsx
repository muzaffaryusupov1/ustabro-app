import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../../lib/theme";
import { t } from "../../i18n";

export default function CustomerHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t("tab.home")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: 18,
    color: colors.onSurfaceVariant,
  },
});
