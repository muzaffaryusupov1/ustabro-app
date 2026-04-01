import { View, Text, TextInput, StyleSheet } from "react-native";
import { forwardRef } from "react";
import { colors, fonts, radii } from "../../lib/theme";

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
          placeholderTextColor={colors.onSurfacePlaceholder}
          editable={editable}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  prefix: {
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceContainerLow,
  },
  prefixText: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.onSurface,
  },
  input: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 20,
    color: colors.onSurface,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});
