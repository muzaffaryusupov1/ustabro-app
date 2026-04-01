import { useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, spacing, radii, shadows } from "../../../lib/theme";
import { Badge } from "../../../components/ui/Badge";
import { Avatar } from "../../../components/ui/Avatar";
import { useAuthStore } from "../../../store/authStore";
import { useMasterOrders } from "../../../hooks/useMasterOrders";

type Tab = "active" | "completed";

function formatPrice(price: number | null): string {
  if (!price) return "Kelishilmagan";
  return price.toLocaleString("uz-UZ") + " UZS";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
  return isToday ? `Bugun, ${time}` : `${d.toLocaleDateString("uz-UZ")} ${time}`;
}

const ACTIVE_STATUSES = ["accepted", "on_the_way", "arrived"];

export default function MyOrdersScreen() {
  const [tab, setTab] = useState<Tab>("active");
  const session = useAuthStore((s) => s.session);
  const { data: orders, isLoading, refetch, isRefetching } = useMasterOrders(session?.user.id);

  const filtered = (orders ?? []).filter((o: any) =>
    tab === "active" ? ACTIVE_STATUSES.includes(o.status) : o.status === "completed"
  );

  const renderItem = ({ item }: { item: any }) => {
    const customer = item.customer as any;
    const category = item.category as any;

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
        onPress={() => router.push({ pathname: "/(master)/order/[id]", params: { id: item.id } })}
      >
        <View style={styles.cardTop}>
          <Avatar uri={customer?.avatar_url} name={customer?.full_name} size={44} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{customer?.full_name ?? "Mijoz"}</Text>
            <Text style={styles.cardCategory}>{category?.name_uz}</Text>
          </View>
          <Badge status={item.status} />
        </View>

        <View style={styles.cardBottom}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>NARXI</Text>
            <Text style={styles.priceValue}>{formatPrice(item.price_agreed)}</Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>SANA</Text>
            <Text style={styles.dateValue}>{formatDate(item.created_at)}</Text>
          </View>
        </View>

        {item.address && (
          <Text style={styles.addressText}>{item.address}</Text>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Buyurtmalar</Text>

      <View style={styles.tabs}>
        <Pressable style={[styles.tab, tab === "active" && styles.tabActive]} onPress={() => setTab("active")}>
          <Text style={[styles.tabText, tab === "active" && styles.tabTextActive]}>Joriy</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === "completed" && styles.tabActive]} onPress={() => setTab("completed")}>
          <Text style={[styles.tabText, tab === "completed" && styles.tabTextActive]}>Tugallangan</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item: any) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {tab === "active" ? "Faol buyurtmalar yo'q" : "Tugallangan buyurtmalar yo'q"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.onSurface, paddingHorizontal: spacing[6], paddingTop: spacing[4], paddingBottom: spacing[3] },
  tabs: { flexDirection: "row", marginHorizontal: spacing[6], backgroundColor: colors.surfaceContainerHigh, borderRadius: radii.full, padding: 4, marginBottom: spacing[4] },
  tab: { flex: 1, paddingVertical: 10, borderRadius: radii.full, alignItems: "center" },
  tabActive: { backgroundColor: colors.surfaceContainerLowest, ...shadows.ambient },
  tabText: { fontFamily: fonts.medium, fontSize: 14, color: colors.onSurfaceMuted },
  tabTextActive: { fontFamily: fonts.semiBold, color: colors.onSurface },
  list: { paddingHorizontal: spacing[6], paddingBottom: 24, gap: spacing[4] },
  card: { backgroundColor: colors.surfaceContainerLowest, borderRadius: radii.xl, padding: spacing[4], gap: spacing[3], ...shadows.ambient },
  cardTop: { flexDirection: "row", alignItems: "center", gap: spacing[3] },
  cardInfo: { flex: 1, gap: 2 },
  cardName: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.onSurface },
  cardCategory: { fontFamily: fonts.regular, fontSize: 13, color: colors.onSurfaceMuted },
  cardBottom: { flexDirection: "row", gap: spacing[6] },
  priceRow: { gap: 2 },
  priceLabel: { fontFamily: fonts.medium, fontSize: 11, color: colors.onSurfacePlaceholder, letterSpacing: 0.5 },
  priceValue: { fontFamily: fonts.bold, fontSize: 16, color: colors.onSurface },
  dateRow: { gap: 2 },
  dateLabel: { fontFamily: fonts.medium, fontSize: 11, color: colors.onSurfacePlaceholder, letterSpacing: 0.5 },
  dateValue: { fontFamily: fonts.medium, fontSize: 14, color: colors.onSurfaceVariant },
  addressText: { fontFamily: fonts.regular, fontSize: 13, color: colors.onSurfaceMuted },
  empty: { paddingTop: 80, alignItems: "center" },
  emptyText: { fontFamily: fonts.medium, fontSize: 16, color: colors.onSurfaceMuted },
});
