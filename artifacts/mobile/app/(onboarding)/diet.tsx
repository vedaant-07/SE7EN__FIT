import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { completeOnboarding } from "@/src/services/userService";

const G = "#20c55d";
const BG = "#050505";
const CARD = "#0d0d0d";
const BORDER = "#1e1e1e";

const DIET_OPTIONS = [
  { id: "veg", label: "Vegetarian", icon: "🥦", desc: "No meat, includes dairy & eggs" },
  { id: "vegan", label: "Vegan", icon: "🌱", desc: "No animal products at all" },
  { id: "non_veg", label: "Non-Vegetarian", icon: "🍗", desc: "Includes meat, fish, eggs" },
  { id: "eggetarian", label: "Eggetarian", icon: "🥚", desc: "Vegetarian + eggs" },
  { id: "jain", label: "Jain", icon: "🙏", desc: "No root vegetables" },
  { id: "keto", label: "Keto / Low Carb", icon: "🥩", desc: "High fat, very low carb" },
  { id: "no_preference", label: "No Preference", icon: "🍽️", desc: "Happy to eat anything" },
];

const WORKOUT_LOCATIONS = [
  { id: "gym", label: "Gym", icon: "home" as const },
  { id: "home", label: "Home", icon: "grid" as const },
  { id: "outdoor", label: "Outdoor", icon: "sun" as const },
  { id: "both", label: "Mixed", icon: "repeat" as const },
];

export default function DietScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setUser } = useAuth();
  const params = useLocalSearchParams<{
    gender: string; age_group: string; height: string; weight: string;
    goal: string; activity_level: string;
  }>();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [diet, setDiet] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const isValid = diet && location;

  async function finish() {
    if (!isValid || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      const payload = {
        gender: params.gender,
        age_group: params.age_group,
        height: parseInt(params.height) || undefined,
        weight: parseFloat(params.weight) || undefined,
        goal: params.goal,
        activity_level: params.activity_level,
        diet_preference: diet,
        workout_location: location,
        onboarding_completed: true,
      };

      const updatedUser = await completeOnboarding(payload);
      setUser(updatedUser);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDone(true);

      setTimeout(() => router.replace("/(user-tabs)"), 1800);
    } catch {
      // Even if backend fails, continue to the app
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDone(true);
      setTimeout(() => router.replace("/(user-tabs)"), 1800);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <View style={s.successRoot}>
        <View style={s.successIcon}>
          <Feather name="check" size={42} color="#000" />
        </View>
        <Text style={s.successTitle}>You're all set! 🎉</Text>
        <Text style={s.successSub}>
          Your AI Coach is generating a personalized plan based on your profile. Get ready to transform!
        </Text>
        <ActivityIndicator color={G} style={{ marginTop: 8 }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        contentContainerStyle={[s.container, { paddingTop: topPad + 16, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={s.back} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>

        <View style={s.progress}>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: "100%" }]} />
          </View>
          <Text style={s.progressText}>Step 4 of 4 · Almost done!</Text>
        </View>

        <Text style={s.title}>Diet & Workout Preference</Text>
        <Text style={s.sub}>Helps AI create an Indian diet plan tailored to you</Text>

        {/* Diet */}
        <View style={s.section}>
          <Text style={s.label}>Diet Type</Text>
          <View style={s.dietList}>
            {DIET_OPTIONS.map((d, i) => (
              <Pressable
                key={d.id}
                style={[
                  s.dietRow,
                  diet === d.id && s.dietRowActive,
                  i < DIET_OPTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: "#111" },
                ]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDiet(d.id); }}
              >
                <Text style={s.dietEmoji}>{d.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.dietLabel, diet === d.id && { color: G }]}>{d.label}</Text>
                  <Text style={s.dietDesc}>{d.desc}</Text>
                </View>
                {diet === d.id && (
                  <View style={s.checkCircle}>
                    <Feather name="check" size={12} color="#000" />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Workout Location */}
        <View style={s.section}>
          <Text style={s.label}>Preferred Workout Location</Text>
          <View style={s.locationRow}>
            {WORKOUT_LOCATIONS.map(l => (
              <Pressable
                key={l.id}
                style={[s.locationBtn, location === l.id && s.locationBtnActive]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLocation(l.id); }}
              >
                <View style={[s.locationIcon, location === l.id && s.locationIconActive]}>
                  <Feather name={l.icon} size={18} color={location === l.id ? "#000" : "#6b7280"} />
                </View>
                <Text style={[s.locationLabel, location === l.id && s.locationLabelActive]}>{l.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Summary */}
        {isValid && (
          <View style={s.summaryCard}>
            <View style={s.summaryHeader}>
              <Feather name="cpu" size={14} color={G} />
              <Text style={s.summaryTitle}>AI will generate your plan based on:</Text>
            </View>
            <View style={s.summaryItems}>
              {[
                params.goal?.replace("_", " "),
                params.activity_level + " activity",
                DIET_OPTIONS.find(d => d.id === diet)?.label + " diet",
                WORKOUT_LOCATIONS.find(l => l.id === location)?.label + " workouts",
              ].map(item => (
                <View key={item} style={s.summaryItem}>
                  <View style={s.summaryDot} />
                  <Text style={s.summaryItemText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[s.footer, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable
          style={({ pressed }) => [s.btn, !isValid && s.btnDisabled, pressed && isValid && { opacity: 0.85 }]}
          onPress={finish}
          disabled={!isValid || loading}
        >
          {loading
            ? <ActivityIndicator color="#000" />
            : <>
                <Text style={[s.btnText, !isValid && { color: "#374151" }]}>Complete Setup 🚀</Text>
              </>}
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 24, gap: 24 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: CARD, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: BORDER },
  progress: { gap: 8 },
  progressBar: { height: 5, backgroundColor: BORDER, borderRadius: 3 },
  progressFill: { height: 5, backgroundColor: G, borderRadius: 3 },
  progressText: { fontSize: 12, color: "#6b7280", textAlign: "right" },
  title: { fontSize: 26, fontWeight: "800", color: "#fff" },
  sub: { fontSize: 14, color: "#9ca3af", lineHeight: 21, marginTop: -8 },
  section: { gap: 10 },
  label: { fontSize: 13, fontWeight: "600", color: "#d1d5db" },
  dietList: { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },
  dietRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  dietRowActive: { backgroundColor: "#071a0e" },
  dietEmoji: { fontSize: 22 },
  dietLabel: { fontSize: 14, fontWeight: "600", color: "#fff" },
  dietDesc: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  checkCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: G, alignItems: "center", justifyContent: "center" },
  locationRow: { flexDirection: "row", gap: 10 },
  locationBtn: { flex: 1, alignItems: "center", gap: 8, backgroundColor: CARD, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: BORDER },
  locationBtnActive: { backgroundColor: G, borderColor: G },
  locationIcon: { width: 40, height: 40, borderRadius: 11, backgroundColor: "#1e1e1e", alignItems: "center", justifyContent: "center" },
  locationIconActive: { backgroundColor: "rgba(0,0,0,0.2)" },
  locationLabel: { fontSize: 12, color: "#6b7280", fontWeight: "600" },
  locationLabelActive: { color: "#000", fontWeight: "700" },
  summaryCard: { backgroundColor: "#071a0e", borderRadius: 14, padding: 14, gap: 10, borderWidth: 1, borderColor: G + "30" },
  summaryHeader: { flexDirection: "row", alignItems: "center", gap: 7 },
  summaryTitle: { fontSize: 12, color: "#9ca3af", fontWeight: "600" },
  summaryItems: { gap: 6 },
  summaryItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  summaryDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: G },
  summaryItemText: { fontSize: 13, color: "#d1d5db", textTransform: "capitalize" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: BG, paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: BORDER },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: G, borderRadius: 14, paddingVertical: 16 },
  btnDisabled: { backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
  btnText: { fontSize: 16, fontWeight: "700", color: "#000" },
  successRoot: { flex: 1, backgroundColor: BG, alignItems: "center", justifyContent: "center", gap: 20, paddingHorizontal: 40 },
  successIcon: { width: 90, height: 90, borderRadius: 45, backgroundColor: G, alignItems: "center", justifyContent: "center", shadowColor: G, shadowOpacity: 0.4, shadowRadius: 24, shadowOffset: { width: 0, height: 8 } },
  successTitle: { fontSize: 26, fontWeight: "800", color: "#fff", textAlign: "center" },
  successSub: { fontSize: 15, color: "#9ca3af", textAlign: "center", lineHeight: 23 },
});
