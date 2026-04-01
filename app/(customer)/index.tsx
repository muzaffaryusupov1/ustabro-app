import { View, Text, StyleSheet } from "react-native";
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
    backgroundColor: "#FFFFFF",
  },
  text: {
    fontSize: 18,
    color: "#374151",
  },
});
