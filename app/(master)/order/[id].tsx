import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { colors, fonts, spacing, radii, shadows } from "../../../lib/theme";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";

export default function MasterOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Buyurtma holati</Text>
        <Text style={styles.headerSub}>Usta Top</Text>
      </View>

      {/* Status icon */}
      <View style={styles.statusSection}>
        <View style={styles.statusIcon}>
          <Ionicons name="car-outline" size={40} color={colors.primary} />
        </View>
        <Text style={styles.statusTitle}>Usta yo'lda</Text>
        <Text style={styles.statusSub}>Taxminiy yetib kelish vaqti: 14:45</Text>
      </View>

      {/* Status steps */}
      <View style={styles.steps}>
        {[
          { label: "Qabul qilindi", done: true },
          { label: "Yo'lga chiqdi", done: true },
          { label: "Yetib keldi", done: false },
          { label: "Bajarildi", done: false },
        ].map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View
              style={[
                styles.stepDot,
                step.done && styles.stepDotDone,
              ]}
            >
              {step.done && <Ionicons name="checkmark" size={14} color={colors.onPrimary} />}
            </View>
            <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>
              {step.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Master info */}
      <View style={styles.masterCard}>
        <Avatar name="Farhod Alimov" size={48} />
        <View style={styles.masterInfo}>
          <Text style={styles.masterName}>Farhod Alimov</Text>
          <Text style={styles.masterSkill}>Santexnika mutaxassisi</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={styles.ratingText}>4.9</Text>
          </View>
        </View>
        <View style={styles.masterActions}>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="call-outline" size={20} color={colors.primary} />
          </Pressable>
          <Pressable style={styles.iconBtnFilled}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.onPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Action button */}
      <View style={styles.bottom}>
        <Button
          title="Yo'lga chiqdim"
          onPress={() => {}}
        />
      </View>
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
  headerSub: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.primary,
  },

  // Status
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

  // Steps
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

  // Master card
  masterCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing[6],
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: spacing[4],
    gap: spacing[3],
    ...shadows.ambient,
  },
  masterInfo: {
    flex: 1,
    gap: 2,
  },
  masterName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.onSurface,
  },
  masterSkill: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.onSurfaceMuted,
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
  masterActions: {
    flexDirection: "row",
    gap: spacing[2],
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

  // Bottom
  bottom: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[6],
  },
});
