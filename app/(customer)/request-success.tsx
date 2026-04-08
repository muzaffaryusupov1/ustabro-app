import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { colors, fonts, spacing } from "../../lib/theme";
import { Button } from "../../components/ui/Button";

export default function RequestSuccessScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <LottieView
          source={require("../../assets/success-animation.json")}
          autoPlay
          loop={false}
          style={styles.animation}
        />
        
        <Text style={styles.title}>So'rov yuborildi!</Text>
        <Text style={styles.subtitle}>
          Sizning so'rovingiz barcha ustalarga yuborildi. Usta qabul qilganda sizga xabar beramiz.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button 
          title="Buyurtmalarim" 
          onPress={() => router.replace("/(customer)/(tabs)/orders")} 
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[6],
  },
  animation: {
    width: 250,
    height: 250,
    marginBottom: spacing[6],
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.onSurface,
    marginBottom: spacing[3],
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.onSurfaceMuted,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: spacing[4],
  },
  footer: {
    padding: spacing[6],
    paddingBottom: spacing[8],
  },
  button: {
    width: "100%",
  },
});
