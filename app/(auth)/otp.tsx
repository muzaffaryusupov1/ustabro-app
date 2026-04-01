import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Pressable,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import { t } from "../../i18n";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputs = useRef<(TextInput | null)[]>([]);
  const initialize = useAuthStore((s) => s.initialize);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleChange = useCallback(
    (text: string, index: number) => {
      const digit = text.replace(/\D/g, "").slice(-1);
      const next = [...digits];
      next[index] = digit;
      setDigits(next);

      if (digit && index < OTP_LENGTH - 1) {
        inputs.current[index + 1]?.focus();
      }

      // Auto-submit when all filled
      if (digit && index === OTP_LENGTH - 1 && next.every((d) => d)) {
        verify(next.join(""));
      }
    },
    [digits]
  );

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === "Backspace" && !digits[index] && index > 0) {
        inputs.current[index - 1]?.focus();
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
      }
    },
    [digits]
  );

  const verify = async (token: string) => {
    if (!phone) return;
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: "sms",
      });

      if (error) {
        Alert.alert("", t("error.otp_invalid"));
        setDigits(Array(OTP_LENGTH).fill(""));
        inputs.current[0]?.focus();
        return;
      }

      await initialize();
      // Auth guard in _layout.tsx handles navigation
    } catch {
      Alert.alert("", t("error.generic"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !phone) return;

    try {
      await supabase.auth.signInWithOtp({ phone });
      setCooldown(RESEND_COOLDOWN);
    } catch {
      Alert.alert("", t("error.generic"));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t("auth.otp.title")}</Text>
        <Text style={styles.subtitle}>{t("auth.otp.subtitle")}</Text>
        <Text style={styles.phone}>{phone}</Text>

        <View style={styles.boxes}>
          {digits.map((digit, i) => (
            <TextInput
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              style={[styles.box, digit ? styles.boxFilled : null]}
              value={digit}
              onChangeText={(text) => handleChange(text, i)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, i)
              }
              keyboardType="number-pad"
              maxLength={1}
              editable={!loading}
              selectTextOnFocus
            />
          ))}
        </View>

        <Pressable
          onPress={handleResend}
          disabled={cooldown > 0}
          style={styles.resendBtn}
        >
          <Text
            style={[
              styles.resendText,
              cooldown > 0 && styles.resendDisabled,
            ]}
          >
            {cooldown > 0
              ? t("auth.otp.resend_in", { seconds: cooldown })
              : t("auth.otp.resend")}
          </Text>
        </Pressable>
      </View>
    </View>
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 4,
  },
  phone: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    marginBottom: 32,
  },
  boxes: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  box: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  boxFilled: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  resendBtn: {
    marginTop: 32,
    alignItems: "center",
  },
  resendText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2563EB",
  },
  resendDisabled: {
    color: "#9CA3AF",
  },
});
