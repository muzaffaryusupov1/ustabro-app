import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/ui/Button";
import { PhoneInput } from "../../components/ui/PhoneInput";
import { t } from "../../i18n";

export default function PhoneScreen() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const isValid = phone.length === 9;

  const handleContinue = async () => {
    if (!isValid) return;

    const fullPhone = `+998${phone}`;
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });

      if (error) {
        console.error("signInWithOtp error:", error.message);
        Alert.alert("Xatolik", error.message);
        return;
      }

      router.push({ pathname: "/(auth)/otp", params: { phone: fullPhone } });
    } catch {
      Alert.alert("", t("error.network"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>{t("app.name")}</Text>
        <Text style={styles.title}>{t("auth.phone.title")}</Text>

        <PhoneInput
          ref={inputRef}
          value={phone}
          onChangeText={setPhone}
          editable={!loading}
        />

        <Button
          title={t("auth.phone.continue")}
          onPress={handleContinue}
          disabled={!isValid}
          loading={loading}
          style={styles.button}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 36,
    fontWeight: "800",
    color: "#2563EB",
    textAlign: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: "#374151",
    textAlign: "center",
    marginBottom: 32,
  },
  button: {
    marginTop: 24,
  },
});
