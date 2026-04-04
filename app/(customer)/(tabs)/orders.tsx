import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, spacing, radii, shadows } from "../../../lib/theme";
import { Badge } from "../../../components/ui/Badge";
import { Avatar } from "../../../components/ui/Avatar";
import { useAuthStore } from "../../../store/authStore";
import { useCustomerOrders } from "../../../hooks/useCustomerOrders";

type Tab = "active" | "completed";

const ACTIVE_STATUSES = ["pending", "accepted", "on_the_way", "arrived"];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
  return isToday ? `Bugun, ${time}` : `${d.toLocaleDateString("uz-UZ")} ${time}`;
}

export default function OrdersScreen() {
  const [tab, setTab] = useState<Tab>("active");
  const session = useAuthStore((s) => s.session);
  const { data: orders, isLoading, refetch, isRefetching } = useCustomerOrders(session?.user.id);

  const filtered = (orders ?? []).filter((o: any) =>
    tab === "active"
      ? ACTIVE_STATUSES.includes(o.status)
      : o.status === "completed" || o.status === "cancelled"
  );

  const renderItem = ({ item }: { item: any }) => {
    const master = item.master as any;
    const category = item.category as any;

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
        onPress={() => router.push({ pathname: "/(customer)/order/[id]", params: { id: item.id } })}
      >
        <View style={styles.cardTop}>
          <View style={styles.categoryIcon}>
            <Ionicons
              name={(category?.icon_name as any) ?? "construct-outline"}
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardCategory}>{category?.name_uz ?? "Xizmat"}</Text>
            <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
          </View>
          <Badge status={item.status} />
        </View>

        {item.description && (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {master && (
          <View style={styles.masterRow}>
            <Avatar uri={master.avatar_url} name={master.full_name} size={28} />
            <Text style={styles.masterName}>{master.full_name ?? "Usta"}</Text>
          </View>
        )}

        {item.address && (
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={14} color={colors.onSurfaceMuted} />
            <Text style={styles.addressText} numberOfLines={1}>
              {item.address}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Buyurtmalar</Text>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, tab === "active" && styles.tabActive]}
          onPress={() => setTab("active")}
        >
          <Text style={[styles.tabText, tab === "active" && styles.tabTextActive]}>Faol</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === "completed" && styles.tabActive]}
          onPress={() => setTab("completed")}
        >
          <Text style={[styles.tabText, tab === "completed" && styles.tabTextActive]}>
            Tugallangan
          </Text>
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
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name={tab === "active" ? "document-text-outline" : "checkmark-done-outline"}
                size={48}
                color={colors.onSurfacePlaceholder}
              />
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
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.onSurface,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
  },
  tabs: {
    flexDirection: "row",
    marginHorizontal: spacing[6],
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.full,
    padding: 4,
    marginBottom: spacing[4],
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: radii.full, alignItems: "center" },
  tabActive: { backgroundColor: colors.surfaceContainerLowest, ...shadows.ambient },
  tabText: { fontFamily: fonts.medium, fontSize: 14, color: colors.onSurfaceMuted },
  tabTextActive: { fontFamily: fonts.semiBold, color: colors.onSurface },
  list: { paddingHorizontal: spacing[6], paddingBottom: 24, gap: spacing[4] },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: spacing[4],
    gap: spacing[3],
    ...shadows.ambient,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: spacing[3] },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1, gap: 2 },
  cardCategory: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.onSurface },
  cardDate: { fontFamily: fonts.regular, fontSize: 13, color: colors.onSurfaceMuted },
  cardDesc: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  masterRow: { flexDirection: "row", alignItems: "center", gap: spacing[2] },
  masterName: { fontFamily: fonts.medium, fontSize: 13, color: colors.onSurfaceVariant },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  addressText: { fontFamily: fonts.regular, fontSize: 13, color: colors.onSurfaceMuted, flex: 1 },
  empty: { paddingTop: 80, alignItems: "center", gap: spacing[3] },
  emptyText: { fontFamily: fonts.medium, fontSize: 16, color: colors.onSurfaceMuted },
});
