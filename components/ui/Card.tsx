import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import type { ReactNode } from "react";

type Padding = "sm" | "md" | "lg";

interface CardProps {
  children: ReactNode;
  padding?: Padding;
  style?: StyleProp<ViewStyle>;
}

const PADDING_MAP: Record<Padding, number> = {
  sm: 8,
  md: 16,
  lg: 24,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
