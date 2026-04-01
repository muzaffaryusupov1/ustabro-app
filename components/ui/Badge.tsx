import { View, Text, StyleSheet } from "react-native";
import { colors, fonts, radii } from "../../lib/theme";

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
  pending: { bg: colors.statusPendingBg, text: colors.statusPendingText },
  accepted: { bg: colors.statusAcceptedBg, text: colors.statusAcceptedText },
  on_the_way: { bg: colors.statusOnTheWayBg, text: colors.statusOnTheWayText },
  arrived: { bg: colors.statusArrivedBg, text: colors.statusArrivedText },
  completed: { bg: colors.statusCompletedBg, text: colors.statusCompletedText },
  cancelled: { bg: colors.statusCancelledBg, text: colors.statusCancelledText },
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
  const c = STATUS_COLORS[status];
  const displayLabel = label ?? STATUS_LABELS[status];

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{displayLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    alignSelf: "flex-start",
  },
  text: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
});
