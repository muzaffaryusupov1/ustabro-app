import { Image, View, Text, StyleSheet } from "react-native";
import { useState } from "react";
import { colors, fonts } from "../../lib/theme";

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: number;
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const BG_COLORS = [
  colors.primary,
  "#7C3AED",
  "#DB2777",
  "#EA580C",
  colors.secondary,
  "#0891B2",
];

function pickColor(name?: string | null): string {
  if (!name) return BG_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BG_COLORS[Math.abs(hash) % BG_COLORS.length];
}

export function Avatar({ uri, name, size = 48 }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const borderRadius = size / 2;

  if (uri && !failed) {
    return (
      <Image
        source={{ uri }}
        onError={() => setFailed(true)}
        style={[styles.image, { width: size, height: size, borderRadius }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: pickColor(name),
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: "cover",
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: colors.onPrimary,
    fontFamily: fonts.bold,
  },
});
