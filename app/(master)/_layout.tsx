import { Stack } from "expo-router";
import { colors } from "../../lib/theme";

export default function MasterLayout() {
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
