import { View, Text, TextInput, StyleSheet } from "react-native";
import { forwardRef } from "react";

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
}

export const PhoneInput = forwardRef<TextInput, PhoneInputProps>(
  ({ value, onChangeText, editable = true }, ref) => {
    const handleChange = (text: string) => {
      const digits = text.replace(/\D/g, "").slice(0, 9);
      onChangeText(digits);
    };

    return (
      <View style={styles.container}>
        <View style={styles.prefix}>
          <Text style={styles.prefixText}>+998</Text>
        </View>
        <TextInput
          ref={ref}
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={9}
          placeholder="90 123 45 67"
          placeholderTextColor="#9CA3AF"
          editable={editable}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    overflow: "hidden",
  },
  prefix: {
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#F3F4F6",
    borderRightWidth: 1,
    borderRightColor: "#D1D5DB",
  },
  prefixText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: "500",
    color: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});
