import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { updateProfile, updateMasterProfile, uploadAvatar } from "../../services/profiles";
import { Button } from "../../components/ui/Button";
import { t } from "../../i18n";
import { supabase } from "../../lib/supabase";

const SKILL_OPTIONS = [
  "Elektrika",
  "Santexnika",
  "Maishiy texnika",
  "Mebel",
  "Qurilish",
  "Boshqa",
];

export default function CreateProfileScreen() {
  const session = useAuthStore((s) => s.session);
  const role = useAuthStore((s) => s.role);
  const setProfile = useAuthStore((s) => s.setProfile);
  const profile = useAuthStore((s) => s.profile);

  const [name, setName] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const isMaster = role === "master";

  const canSave =
    name.trim().length > 0 && (!isMaster || selectedSkills.length > 0);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSave = async () => {
    if (!session?.user || !canSave) return;

    setLoading(true);
    try {
      let avatarUrl: string | null = null;

      if (avatarUri) {
        avatarUrl = await uploadAvatar(session.user.id, avatarUri);
      }

      await updateProfile(session.user.id, {
        full_name: name.trim(),
        avatar_url: avatarUrl,
      });

      if (isMaster) {
        await updateMasterProfile(session.user.id, {
          skills: selectedSkills,
        });
      }

      // Refresh profile in store
      const { data } = await supabase
        .from("profiles")
        .select("id, phone, full_name, avatar_url, role")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setProfile(data);
      }

      router.replace(
        role === "customer" ? "/(customer)/" : "/(master)/"
      );
    } catch {
      Alert.alert("", t("error.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>{t("auth.profile.title")}</Text>

      <Pressable onPress={pickImage} style={styles.avatarPicker}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>
              {t("auth.profile.avatar")}
            </Text>
          </View>
        )}
      </Pressable>

      <Text style={styles.label}>{t("auth.profile.full_name")}</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder={t("auth.profile.full_name_placeholder")}
        placeholderTextColor="#9CA3AF"
        editable={!loading}
      />

      {isMaster && (
        <>
          <Text style={styles.label}>{t("auth.profile.skills")}</Text>
          <Text style={styles.hint}>{t("auth.profile.skills_hint")}</Text>
          <View style={styles.chips}>
            {SKILL_OPTIONS.map((skill) => {
              const selected = selectedSkills.includes(skill);
              return (
                <Pressable
                  key={skill}
                  onPress={() => toggleSkill(skill)}
                  style={[
                    styles.chip,
                    selected && styles.chipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected && styles.chipTextSelected,
                    ]}
                  >
                    {skill}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      <Button
        title={t("auth.profile.save")}
        onPress={handleSave}
        disabled={!canSave}
        loading={loading}
        style={styles.saveBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 24,
  },
  avatarPicker: {
    alignSelf: "center",
    marginBottom: 32,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#F9FAFB",
    marginBottom: 24,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 32,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },
  chipSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  chipTextSelected: {
    color: "#2563EB",
  },
  saveBtn: {
    marginTop: 8,
  },
});
