import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, fonts, spacing, radii, shadows } from "../../lib/theme";
import { useCategories } from "../../hooks/useCategories";

const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  "flash-outline": "flash-outline",
  "water-outline": "water-outline",
  "hardware-chip-outline": "hardware-chip-outline",
  "bed-outline": "bed-outline",
  "construct-outline": "construct-outline",
  "ellipsis-horizontal-outline": "ellipsis-horizontal-outline",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "Elektrika": "Rozetka,\nchiroqlar va...",
  "Santexnika": "Jo'mrak,\nquvur va...",
  "Maishiy texnika": "Kir mashin, xo'\njamiti mashinalari",
  "Mebel": "Yig'ish, ta'mirlash\nva buylurtma...",
  "Qurilish": "Uy qurilish, g'isht\nartish va...",
  "Boshqa": "Tut olmaydi ga\nno'g'ri ishlar",
};

export default function CategoriesScreen() {
  const { data: categories, isLoading } = useCategories();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Usta Top</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Xizmat turini tanlang</Text>
        <Text style={styles.subtitle}>
          Sizga qanday yordam kerak? Kerakli{"\n"}bo'limni tanlang va eng yaxshi ustani{"\n"}toping.
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.grid}>
            {(categories ?? []).map((cat) => (
              <Pressable
                key={cat.id}
                style={({ pressed }) => [
                  styles.card,
                  pressed && { backgroundColor: colors.surfaceContainerLow },
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/(customer)/create-request",
                    params: { categoryId: cat.id, categoryName: cat.name_uz },
                  })
                }
              >
                <Ionicons
                  name={CATEGORY_ICONS[cat.icon_name ?? ""] ?? "ellipsis-horizontal-outline"}
                  size={28}
                  color={colors.primary}
                />
                <Text style={styles.cardTitle}>{cat.name_uz}</Text>
                <Text style={styles.cardDesc}>
                  {CATEGORY_DESCRIPTIONS[cat.name_uz] ?? ""}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    gap: spacing[3],
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: spacing[6],
    paddingBottom: 40,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.onSurface,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.onSurfaceMuted,
    lineHeight: 22,
    marginBottom: spacing[6],
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[4],
  },
  card: {
    width: "47%",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: spacing[4],
    gap: spacing[2],
    ...shadows.ambient,
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.onSurface,
  },
  cardDesc: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.onSurfaceMuted,
    lineHeight: 18,
  },
});
