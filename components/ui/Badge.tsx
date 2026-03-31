import { View, Text, StyleSheet } from "react-native";

type OrderStatus =
  | "pending"
  | "accepted"
  | "on_the_way"
  | "arrived"
  | "completed"
  | "cancelled";

interface BadgeProps {
  status: OrderStatus;
  label?: string;
}

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: "#FEF3C7", text: "#92400E" },
  accepted: { bg: "#DBEAFE", text: "#1E40AF" },
  on_the_way: { bg: "#E0E7FF", text: "#3730A3" },
  arrived: { bg: "#D1FAE5", text: "#065F46" },
  completed: { bg: "#D1FAE5", text: "#065F46" },
  cancelled: { bg: "#FEE2E2", text: "#991B1B" },
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Kutilmoqda",
  accepted: "Qabul qilindi",
  on_the_way: "Yo'lda",
  arrived: "Yetib keldi",
  completed: "Bajarildi",
  cancelled: "Bekor qilindi",
};

export function Badge({ status, label }: BadgeProps) {
  const colors = STATUS_COLORS[status];
  const displayLabel = label ?? STATUS_LABELS[status];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{displayLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});
