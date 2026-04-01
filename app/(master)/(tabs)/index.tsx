import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, fonts, spacing, radii, shadows } from "../../../lib/theme";
import { Avatar } from "../../../components/ui/Avatar";
import { useAuthStore } from "../../../store/authStore";

// Placeholder data for UI — will be replaced with real query
const PLACEHOLDER_REQUESTS = [
  {
    id: "1",
    customer_name: "Aziz Rahimov",
    customer_avatar: null,
    rating: 4.5,
    description: "Oshxonadagi kran buzilgan. Suv damadiga oqmoqda",
    category: "Santexnika",
    distance: "3 km",
    time_ago: "5 minut",
  },
  {
    id: "2",
    customer_name: "Malika Saidova",
    customer_avatar: null,
    rating: 5.0,
    description: "Rozetkadan uchqun chiqyapti. Xonalari...",
    category: "Elektrika",
    distance: "1.5 km",
    time_ago: "12 minut",
  },
  {
    id: "3",
    customer_name: "Javohir To'rayev",
    customer_avatar: null,
    rating: 4.7,
    description: "Yong'in shikaf eshik yig'ib bersa kerak...",
    category: "Mebel",
    distance: null,
    time_ago: "25 minut",
  },
];

export default function MasterRequestsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const profile = useAuthStore((s) => s.profile);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: refetch pending requests
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderItem = ({ item }: { item: (typeof PLACEHOLDER_REQUESTS)[0] }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Avatar name={item.customer_name} size={48} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.customer_name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            {item.distance && (
              <Text style={styles.distanceText}>{item.distance}</Text>
            )}
          </View>
        </View>
        <View style={styles.timeBadge}>
          <Text style={styles.timeText}>{item.time_ago}</Text>
        </View>
      </View>

      <Text style={styles.cardDesc} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.cardMeta}>
        <View style={styles.metaChip}>
          <Ionicons name="location-outline" size={14} color={colors.onSurfaceMuted} />
          <Text style={styles.metaText}>Chilonzor 5-mavze</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <Pressable
          style={({ pressed }) => [
            styles.detailBtn,
            pressed && { backgroundColor: colors.surfaceContainerLow },
          ]}
          onPress={() => router.push({ pathname: "/(master)/order/[id]", params: { id: item.id } })}
        >
          <Text style={styles.detailBtnText}>Batafsil</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.acceptBtn,
            pressed && { backgroundColor: colors.primaryFixedDim },
          ]}
          onPress={() => {
            Alert.alert(
              "Tasdiqlash",
              "Ushbu buyurtmani qabul qilasizmi?",
              [
                { text: "Bekor qilish", style: "cancel" },
                { text: "Qabul qilish", onPress: () => {} },
              ]
            );
          }}
        >
          <Text style={styles.acceptBtnText}>Qabul qilish</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Ionicons name="construct" size={22} color={colors.primary} />
        <Text style={styles.logoText}>Usta Top</Text>
      </View>

      <Text style={styles.title}>Yangi buyurtmalar</Text>
      <Text style={styles.subtitle}>Sizga yaqin hudududagi barcha so'rovlar</Text>

      <FlatList
        data={PLACEHOLDER_REQUESTS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Hozircha so'rovlar yo'q</Text>
          </View>
        }
      />
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
    paddingTop: spacing[2],
    gap: 8,
  },
  logoText: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.primary,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.onSurface,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.onSurfaceMuted,
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[4],
  },
  list: {
    paddingHorizontal: spacing[6],
    paddingBottom: 24,
    gap: spacing[4],
  },

  // Card
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: spacing[4],
    gap: spacing[3],
    ...shadows.ambient,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.onSurface,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.onSurface,
  },
  distanceText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.onSurfacePlaceholder,
    marginLeft: 8,
  },
  timeBadge: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  timeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.onSurfaceMuted,
  },
  cardDesc: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 21,
  },
  cardMeta: {
    flexDirection: "row",
    gap: 8,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metaText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.onSurfaceMuted,
  },
  cardActions: {
    flexDirection: "row",
    gap: spacing[3],
    marginTop: spacing[1],
  },
  detailBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: "center",
  },
  detailBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  acceptBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  acceptBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.onPrimary,
  },
  empty: {
    paddingTop: 80,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.onSurfaceMuted,
  },
});
