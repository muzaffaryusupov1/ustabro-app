import { Stack } from "expo-router";
import { colors } from "../../lib/theme";

export default function CustomerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.surface },
      }}
    />
  );
}
