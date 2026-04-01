import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import type { ReactNode } from "react";
import { colors, radii, shadows, spacing } from "../../lib/theme";

type Padding = "sm" | "md" | "lg";

interface CardProps {
  children: ReactNode;
  padding?: Padding;
  style?: StyleProp<ViewStyle>;
}

const PADDING_MAP: Record<Padding, number> = {
  sm: spacing[2],
  md: spacing[4],
  lg: spacing[6],
};

export function Card({ children, padding = "md", style }: CardProps) {
  return (
    <View style={[styles.card, { padding: PADDING_MAP[padding] }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    ...shadows.ambient,
  },
});
