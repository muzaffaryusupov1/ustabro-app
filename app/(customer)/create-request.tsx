import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { colors, fonts, spacing, radii, shadows } from "../../lib/theme";
import { Button } from "../../components/ui/Button";
import { t } from "../../i18n";
import { useAuthStore } from "../../store/authStore";
import { createOrder, uploadOrderPhotos } from "../../services/orders";
import { queryClient } from "../../lib/queryClient";

export default function CreateRequestScreen() {
  const { categoryId, categoryName } = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
  }>();

  const [photos, setPhotos] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const canSubmit = photos.length > 0 || description.trim().length > 0;

  const detectLocation = async () => {
    setDetectingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("", "Joylashuvga ruxsat berilmadi");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [place] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (place) {
        const parts = [place.street, place.district, place.city].filter(Boolean);
        setAddress(parts.join(", ") || `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
      }
    } catch {
      Alert.alert("", "Joylashuvni aniqlab bo'lmadi");
    } finally {
      setDetectingLocation(false);
    }
  };

  const pickPhoto = async () => {
    if (photos.length >= 3) {
      Alert.alert("", t("error.max_photos"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const session = useAuthStore((s) => s.session);

  const handleSubmit = async () => {
    if (!canSubmit || !session?.user || !categoryId) return;
    setLoading(true);

    try {
      // 1. Create order first (to get order ID)
      const order = await createOrder({
        customer_id: session.user.id,
        category_id: categoryId,
        description: description.trim() || undefined,
        address: address.trim() || undefined,
      });

      // 2. Upload photos if any
      if (photos.length > 0) {
        const photoUrls = await uploadOrderPhotos(order.id, photos);
        // Update order with photo URLs
        const { supabase } = await import("../../lib/supabase");
        await supabase
          .from("orders")
          .update({ photo_urls: photoUrls })
          .eq("id", order.id);
      }

      // 3. Invalidate queries so lists refresh
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });

      Alert.alert(
        "So'rov yuborildi!",
        "So'rovingiz barcha ustalarga yuborildi. Usta qabul qilganda sizga xabar beramiz."
      );
      router.replace("/(customer)/(tabs)/orders");
    } catch (err) {
      console.error("Order creation error:", err);
      Alert.alert("", t("error.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Yangi buyurtma</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo section */}
        <Text style={styles.sectionTitle}>{t("request.title")}</Text>
        <Text style={styles.subtitle}>
          Muammongizni tavsiflang — so'rovingiz barcha{"\n"}ustaLARga yuboriladi. Birinchi qabul qilgan{"\n"}usta siz bilan bog'lanadi.
        </Text>

        <Text style={styles.label}>Muammoni rasmga oling</Text>
        <View style={styles.photoRow}>
          {photos.map((uri, i) => (
            <View key={i} style={styles.photoWrap}>
              <Image source={{ uri }} style={styles.photo} />
              <Pressable style={styles.photoRemove} onPress={() => removePhoto(i)}>
                <Ionicons name="close-circle" size={22} color={colors.error} />
              </Pressable>
            </View>
          ))}
          {photos.length < 3 && (
            <Pressable
              style={({ pressed }) => [
                styles.photoAdd,
                pressed && { backgroundColor: colors.surfaceContainerLow },
              ]}
              onPress={pickPhoto}
            >
              <Ionicons name="camera-outline" size={28} color={colors.primary} />
              <Text style={styles.photoAddText}>Rasm qo'shish</Text>
            </Pressable>
          )}
        </View>

        {/* Description */}
        <Text style={styles.label}>Nima bo'ldi?</Text>
        <TextInput
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
          placeholder={t("request.description_placeholder")}
          placeholderTextColor={colors.onSurfacePlaceholder}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Address */}
        <Text style={styles.label}>{t("request.address")}</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder={t("request.address_placeholder")}
          placeholderTextColor={colors.onSurfacePlaceholder}
        />

        {/* Location detect */}
        <Pressable style={styles.locationBtn} onPress={detectLocation} disabled={detectingLocation}>
          <Ionicons name="location-outline" size={20} color={colors.primary} />
          <Text style={styles.locationText}>
            {detectingLocation ? "Aniqlanmoqda..." : t("request.detect_location")}
          </Text>
        </Pressable>

        {/* Submit */}
        <Button
          title="Buyurtma berish"
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={loading}
          style={styles.submitBtn}
        />

        <Text style={styles.disclaimer}>
          "Buyurtma berish" tugmasini bosganingiz{"\n"}siz xizmat ko'rsatish shartlariga rozisiz
        </Text>
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
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.onSurface,
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[6],
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 22,
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
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.onSurfaceVariant,
    marginBottom: spacing[2],
  },
  photoRow: {
    flexDirection: "row",
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  photoWrap: {
    position: "relative",
  },
  photo: {
    width: 90,
    height: 90,
    borderRadius: radii.lg,
  },
  photoRemove: {
    position: "absolute",
    top: -6,
    right: -6,
  },
  photoAdd: {
    width: 90,
    height: 90,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  photoAddText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.primary,
  },
  textArea: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.xl,
    padding: spacing[4],
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.onSurface,
    minHeight: 100,
    marginBottom: spacing[6],
  },
  input: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.xl,
    padding: spacing[4],
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.onSurface,
    marginBottom: spacing[3],
  },
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  locationText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.primary,
  },
  submitBtn: {
    marginBottom: spacing[3],
  },
  disclaimer: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.onSurfacePlaceholder,
    textAlign: "center",
    lineHeight: 18,
  },
});
