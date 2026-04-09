import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, fonts, radii } from "../../lib/theme";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends PressableProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const VARIANTS = {
  primary: { bg: colors.primary, text: colors.onPrimary, pressed: colors.primaryFixedDim },
  secondary: { bg: colors.surfaceContainerHigh, text: colors.primary, pressed: colors.surfaceContainerLow },
  ghost: { bg: "transparent", text: colors.primary, pressed: colors.surfaceContainerLow },
} as const;

export function Button({
  title,
  variant = "primary",
  loading = false,
  disabled,
  style,
  icon,
  iconPosition = "right",
  ...rest
}: ButtonProps) {
  const v = VARIANTS[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: pressed ? v.pressed : v.bg,
          opacity: isDisabled ? 0.5 : 1,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        },
        style,
      ]}
      {...rest}
    >
      {iconPosition === "left" && icon}
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <Text style={[styles.text, { color: v.text }]}>{title}</Text>
      )}
      {iconPosition === "right" && icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 64,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  text: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
  },
});
