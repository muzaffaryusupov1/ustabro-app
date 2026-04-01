import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../lib/theme";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>UstaBro</Text>
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
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 24,
    color: colors.primary,
  },
});
