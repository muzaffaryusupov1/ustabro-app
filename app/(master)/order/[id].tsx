import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { colors, fonts, spacing, radii, shadows } from "../../../lib/theme";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { useOrder } from "../../../hooks/useOrder";
import { updateOrderStatus, acceptOrder } from "../../../services/orders";
import { useAuthStore } from "../../../store/authStore";
import { queryClient } from "../../../lib/queryClient";

const STATUS_STEPS = [
  { key: "accepted", label: "Qabul qilindi" },
  { key: "on_the_way", label: "Yo'lga chiqdi" },
  { key: "arrived", label: "Yetib keldi" },
  { key: "completed", label: "Bajarildi" },
];

const NEXT_STATUS: Record<string, { status: string; label: string }> = {
  pending: { status: "accepted", label: "Qabul qilish" },
  accepted: { status: "on_the_way", label: "Yo'lga chiqdim" },
  on_the_way: { status: "arrived", label: "Yetib keldim" },
  arrived: { status: "completed", label: "Ishni bajardim" },
};

const STATUS_TITLES: Record<string, string> = {
  pending: "Kutilmoqda",
  accepted: "Qabul qilindi",
  on_the_way: "Usta yo'lda",
  arrived: "Usta yetib keldi",
  completed: "Bajarildi",
};

const STATUS_ICONS: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  pending: "time-outline",
  accepted: "checkmark-circle-outline",
  on_the_way: "car-outline",
  arrived: "location-outline",
  completed: "checkmark-done-outline",
};

export default function MasterOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useAuthStore((s) => s.session);
  const { data: order, isLoading } = useOrder(id);

  const currentStatus = order?.status ?? "pending";
  const nextAction = NEXT_STATUS[currentStatus];
  const customer = order?.customer as any;
  const category = order?.category as any;

  const stepIndex = STATUS_STEPS.findIndex((s) => s.key === currentStatus);

  const handleStatusUpdate = async () => {
    if (!nextAction || !id) return;

    Alert.alert("Tasdiqlash", `Holatni "${nextAction.label}" ga o'zgartirmoqchimisiz?`, [
      { text: "Bekor qilish", style: "cancel" },
      {
        text: "Ha",
        onPress: async () => {
          try {
            if (currentStatus === "pending") {
              await acceptOrder(id, session!.user.id);
            } else {
              await updateOrderStatus(id, nextAction.status);
            }
            queryClient.invalidateQueries({ queryKey: ["order", id] });
            queryClient.invalidateQueries({ queryKey: ["master-orders"] });
            queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
          } catch {
            Alert.alert("", "Xatolik yuz berdi");
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Buyurtma holati</Text>
        </View>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Buyurtma holati</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Status icon */}
        <View style={styles.statusSection}>
          <View style={styles.statusIcon}>
            <Ionicons name={STATUS_ICONS[currentStatus] ?? "time-outline"} size={40} color={colors.primary} />
          </View>
          <Text style={styles.statusTitle}>{STATUS_TITLES[currentStatus]}</Text>
          {category && <Text style={styles.statusSub}>{category.name_uz}</Text>}
        </View>

        {/* Status steps */}
        <View style={styles.steps}>
          {STATUS_STEPS.map((step, i) => {
            const done = i <= stepIndex;
            return (
              <View key={step.key} style={styles.stepRow}>
                <View style={[styles.stepDot, done && styles.stepDotDone]}>
                  {done && <Ionicons name="checkmark" size={14} color={colors.onPrimary} />}
                </View>
                <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Photos */}
        {order?.photo_urls && order.photo_urls.length > 0 && (
          <View style={styles.photosSection}>
            <Text style={styles.descLabel}>Rasmlar</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosRow}>
              {order.photo_urls.map((url: string, i: number) => (
                <Image key={i} source={{ uri: url }} style={styles.photo} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Description */}
        {order?.description && (
          <View style={styles.descSection}>
            <Text style={styles.descLabel}>Tavsif</Text>
            <Text style={styles.descText}>{order.description}</Text>
          </View>
        )}

        {/* Address */}
        {order?.address && (
          <View style={styles.descSection}>
            <Text style={styles.descLabel}>Manzil</Text>
            <Text style={styles.descText}>{order.address}</Text>
          </View>
        )}

        {/* Customer info */}
        {customer && (
          <View style={styles.customerCard}>
            <Avatar uri={customer.avatar_url} name={customer.full_name} size={48} />
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{customer.full_name ?? "Mijoz"}</Text>
              <Text style={styles.customerPhone}>{customer.phone}</Text>
            </View>
            <Pressable style={styles.iconBtn}>
              <Ionicons name="call-outline" size={20} color={colors.primary} />
            </Pressable>
            <Pressable style={styles.iconBtnFilled}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.onPrimary} />
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Fixed bottom button */}
      {nextAction && (
        <View style={styles.bottomFixed}>
          <Button title={nextAction.label} onPress={handleStatusUpdate} />
        </View>
      )}
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
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.onSurface,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  statusSection: {
    alignItems: "center",
    paddingVertical: spacing[6],
    gap: spacing[2],
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.ambient,
    marginBottom: spacing[3],
  },
  statusTitle: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.onSurface,
  },
  statusSub: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.onSurfaceMuted,
  },
  steps: {
    paddingHorizontal: spacing[6],
    gap: spacing[4],
    marginBottom: spacing[6],
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotDone: {
    backgroundColor: colors.primary,
  },
  stepLabel: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.onSurfacePlaceholder,
  },
  stepLabelDone: {
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
  },
  photosSection: {
    paddingLeft: spacing[6],
    marginBottom: spacing[4],
  },
  photosRow: {
    gap: spacing[3],
    paddingRight: spacing[6],
  },
  photo: {
    width: 160,
    height: 120,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerHigh,
  },
  descSection: {
    paddingHorizontal: spacing[6],
    marginBottom: spacing[4],
  },
  descLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.onSurfacePlaceholder,
    marginBottom: spacing[1],
  },
  descText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  customerCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing[6],
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: spacing[4],
    gap: spacing[3],
    ...shadows.ambient,
  },
  customerInfo: {
    flex: 1,
    gap: 2,
  },
  customerName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.onSurface,
  },
  customerPhone: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.onSurfaceMuted,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnFilled: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomFixed: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[6],
    paddingTop: spacing[3],
    backgroundColor: colors.surface,
  },
});
