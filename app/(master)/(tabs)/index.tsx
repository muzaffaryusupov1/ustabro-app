import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, fonts, spacing, radii, shadows } from "../../../lib/theme";
import { Avatar } from "../../../components/ui/Avatar";
import { useAuthStore } from "../../../store/authStore";
import { usePendingRequests } from "../../../hooks/usePendingRequests";
import { acceptOrder } from "../../../services/orders";
import { queryClient } from "../../../lib/queryClient";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Hozir";
  if (mins < 60) return `${mins} minut`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} soat`;
  return `${Math.floor(hrs / 24)} kun`;
}

export default function MasterRequestsScreen() {
  const session = useAuthStore((s) => s.session);
  const { data: requests, isLoading, refetch, isRefetching } = usePendingRequests();

  const handleAccept = (orderId: string) => {
    Alert.alert("Tasdiqlash", "Ushbu buyurtmani qabul qilasizmi?", [
      { text: "Bekor qilish", style: "cancel" },
      {
        text: "Qabul qilish",
        onPress: async () => {
          try {
            await acceptOrder(orderId, session!.user.id);
            queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
            queryClient.invalidateQueries({ queryKey: ["master-orders"] });
          } catch {
            Alert.alert("", "Xatolik yuz berdi");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => {
    const customer = item.customer as any;
    const category = item.category as any;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Avatar uri={customer?.avatar_url} name={customer?.full_name} size={48} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{customer?.full_name ?? "Mijoz"}</Text>
            <Text style={styles.categoryText}>{category?.name_uz}</Text>
          </View>
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>{timeAgo(item.created_at)}</Text>
          </View>
        </View>

        {item.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        ) : null}

        {item.address ? (
          <View style={styles.cardMeta}>
            <View style={styles.metaChip}>
              <Ionicons name="location-outline" size={14} color={colors.onSurfaceMuted} />
              <Text style={styles.metaText}>{item.address}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.cardActions}>
          <Pressable
            style={({ pressed }) => [styles.detailBtn, pressed && { backgroundColor: colors.surfaceContainerLow }]}
            onPress={() => router.push({ pathname: "/(master)/order/[id]", params: { id: item.id } })}
          >
            <Text style={styles.detailBtnText}>Batafsil</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.acceptBtn, pressed && { backgroundColor: colors.primaryFixedDim }]}
            onPress={() => handleAccept(item.id)}
          >
            <Text style={styles.acceptBtnText}>Qabul qilish</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Ionicons name="construct" size={22} color={colors.primary} />
        <Text style={styles.logoText}>Usta Top</Text>
      </View>

      <Text style={styles.title}>Yangi buyurtmalar</Text>
      <Text style={styles.subtitle}>Sizga yaqin hudududagi barcha so'rovlar</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item: any) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={48} color={colors.onSurfacePlaceholder} />
              <Text style={styles.emptyText}>Hozircha so'rovlar yo'q</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing[6], paddingTop: spacing[2], gap: 8 },
  logoText: { fontFamily: fonts.bold, fontSize: 18, color: colors.primary },
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.onSurface, paddingHorizontal: spacing[6], paddingTop: spacing[4] },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.onSurfaceMuted, paddingHorizontal: spacing[6], paddingBottom: spacing[4] },
  list: { paddingHorizontal: spacing[6], paddingBottom: 24, gap: spacing[4] },
  card: { backgroundColor: colors.surfaceContainerLowest, borderRadius: radii.xl, padding: spacing[4], gap: spacing[3], ...shadows.ambient },
  cardTop: { flexDirection: "row", alignItems: "center", gap: spacing[3] },
  cardInfo: { flex: 1, gap: 2 },
  cardName: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.onSurface },
  categoryText: { fontFamily: fonts.regular, fontSize: 13, color: colors.onSurfaceMuted },
  timeBadge: { backgroundColor: colors.surfaceContainerHigh, borderRadius: radii.full, paddingHorizontal: 10, paddingVertical: 4 },
  timeText: { fontFamily: fonts.medium, fontSize: 11, color: colors.onSurfaceMuted },
  cardDesc: { fontFamily: fonts.regular, fontSize: 14, color: colors.onSurfaceVariant, lineHeight: 21 },
  cardMeta: { flexDirection: "row", gap: 8 },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.surfaceContainerHigh, borderRadius: radii.full, paddingHorizontal: 10, paddingVertical: 4 },
  metaText: { fontFamily: fonts.medium, fontSize: 12, color: colors.onSurfaceMuted },
  cardActions: { flexDirection: "row", gap: spacing[3], marginTop: spacing[1] },
  detailBtn: { flex: 1, paddingVertical: 12, borderRadius: radii.xl, backgroundColor: colors.surfaceContainerHigh, alignItems: "center" },
  detailBtnText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.onSurfaceVariant },
  acceptBtn: { flex: 1, paddingVertical: 12, borderRadius: radii.xl, backgroundColor: colors.primary, alignItems: "center" },
  acceptBtnText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.onPrimary },
  empty: { paddingTop: 80, alignItems: "center", gap: spacing[3] },
  emptyText: { fontFamily: fonts.medium, fontSize: 16, color: colors.onSurfaceMuted },
});
