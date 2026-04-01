import { useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, spacing, radii, shadows } from "../../../lib/theme";
import { Badge } from "../../../components/ui/Badge";
import { Avatar } from "../../../components/ui/Avatar";

type Tab = "active" | "completed";

const PLACEHOLDER_ORDERS = [
  {
    id: "1",
    customer_name: "Malika Rahmonova",
    category: "Santexnika",
    status: "accepted" as const,
    price: "250,000 UZS",
    date: "Bugun, 14:30",
    statusLabel: "BAJARILMOQDA",
  },
  {
    id: "2",
    customer_name: "Jasur Orifov",
    category: "Elektr montaj",
    status: "on_the_way" as const,
    price: "450,000 UZS",
    date: "Ertaga, 10:00",
    statusLabel: "KUTILMOQDA",
  },
];

export default function MyOrdersScreen() {
  const [tab, setTab] = useState<Tab>("active");

  const renderItem = ({ item }: { item: (typeof PLACEHOLDER_ORDERS)[0] }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Avatar name={item.customer_name} size={44} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.customer_name}</Text>
          <Text style={styles.cardCategory}>{item.category}</Text>
        </View>
        <Badge status={item.status} />
      </View>

      <View style={styles.cardBottom}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>NARXI</Text>
          <Text style={styles.priceValue}>{item.price}</Text>
        </View>
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>SANA</Text>
          <Text style={styles.dateValue}>{item.date}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <Pressable style={styles.rejectBtn}>
          <Text style={styles.rejectText}>Rad etish</Text>
        </Pressable>
        <Pressable style={styles.confirmBtn}>
          <Text style={styles.confirmText}>Qabul qilish</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Buyurtmalar</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, tab === "active" && styles.tabActive]}
          onPress={() => setTab("active")}
        >
          <Text style={[styles.tabText, tab === "active" && styles.tabTextActive]}>
            Joriy
          </Text>
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

      <FlatList
        data={tab === "active" ? PLACEHOLDER_ORDERS : []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {tab === "active" ? "Faol buyurtmalar yo'q" : "Tugallangan buyurtmalar yo'q"}
            </Text>
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
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.onSurface,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
  },

  // Tabs
  tabs: {
    flexDirection: "row",
    marginHorizontal: spacing[6],
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.full,
    padding: 4,
    marginBottom: spacing[4],
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.full,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.ambient,
  },
  tabText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.onSurfaceMuted,
  },
  tabTextActive: {
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
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
  cardCategory: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.onSurfaceMuted,
  },
  cardBottom: {
    flexDirection: "row",
    gap: spacing[6],
  },
  priceRow: {
    gap: 2,
  },
  priceLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.onSurfacePlaceholder,
    letterSpacing: 0.5,
  },
  priceValue: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.onSurface,
  },
  dateRow: {
    gap: 2,
  },
  dateLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.onSurfacePlaceholder,
    letterSpacing: 0.5,
  },
  dateValue: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  cardActions: {
    flexDirection: "row",
    gap: spacing[3],
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: "center",
  },
  rejectText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  confirmText: {
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
