import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const G = "#20c55d";
const BG = "#050505";
const CARD = "#0d0d0d";
const BORDER = "#1e1e1e";

const GOALS = [
  { id: "lose_weight", label: "Lose Weight", icon: "trending-down" as const, desc: "Burn fat, look leaner", color: "#38bdf8" },
  { id: "build_muscle", label: "Build Muscle", icon: "zap" as const, desc: "Gain strength and size", color: G },
  { id: "improve_fitness", label: "Improve Fitness", icon: "activity" as const, desc: "Boost endurance & stamina", color: "#a78bfa" },
  { id: "stay_healthy", label: "Stay Healthy", icon: "heart" as const, desc: "Maintain a balanced lifestyle", color: "#f87171" },
  { id: "sport_performance", label: "Sport Performance", icon: "award" as const, desc: "Train for a specific sport", color: "#fbbf24" },
  { id: "stress_relief", label: "Stress Relief", icon: "sun" as const, desc: "Yoga, flexibility & mindfulness", color: "#fb923c" },
];

const ACTIVITY_LEVELS = [
  { id: "sedentary", label: "Sedentary", desc: "Little or no exercise, desk job" },
  { id: "light", label: "Light", desc: "Light exercise 1–2 days/week" },
  { id: "moderate", label: "Moderate", desc: "Moderate exercise 3–5 days/week" },
  { id: "active", label: "Active", desc: "Hard exercise 6–7 days/week" },
  { id: "very_active", label: "Very Active", desc: "Hard daily exercise + physical job" },
];

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ gender: string; age_group: string; height: string; weight: string }>();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [goal, setGoal] = useState("");
  const [activityLevel, setActivityLevel] = useState("");

  const isValid = goal && activityLevel;

  function next() {
    if (!isValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(onboarding)/diet",
      params: { ...params, goal, activity_level: activityLevel },
    });
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
            <View style={[s.progressFill, { width: "75%" }]} />
          </View>
          <Text style={s.progressText}>Step 3 of 4</Text>
        </View>

        <Text style={s.title}>Your Fitness Goals</Text>
        <Text style={s.sub}>AI Coach will personalize your plan around your primary goal</Text>

        {/* Fitness Goal */}
        <View style={s.section}>
          <Text style={s.label}>Primary Goal</Text>
          <View style={s.goalGrid}>
            {GOALS.map(g => (
              <Pressable
                key={g.id}
                style={[s.goalCard, goal === g.id && [s.goalCardActive, { borderColor: g.color }]]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setGoal(g.id); }}
              >
                <View style={[s.goalIcon, { backgroundColor: g.color + "20" }]}>
                  <Feather name={g.icon} size={20} color={g.color} />
                </View>
                <Text style={[s.goalLabel, goal === g.id && { color: "#fff" }]}>{g.label}</Text>
                <Text style={s.goalDesc}>{g.desc}</Text>
                {goal === g.id && (
                  <View style={[s.goalCheck, { backgroundColor: g.color }]}>
                    <Feather name="check" size={10} color="#000" />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Activity Level */}
        <View style={s.section}>
          <Text style={s.label}>Current Activity Level</Text>
          <View style={s.activityList}>
            {ACTIVITY_LEVELS.map((a, i) => (
              <Pressable
                key={a.id}
                style={[s.activityRow, activityLevel === a.id && s.activityRowActive, i < ACTIVITY_LEVELS.length - 1 && { borderBottomWidth: 1, borderBottomColor: "#111" }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActivityLevel(a.id); }}
              >
                <View style={[s.activityDot, activityLevel === a.id && s.activityDotActive]}>
                  {activityLevel === a.id && <View style={s.activityDotInner} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.activityLabel, activityLevel === a.id && { color: G }]}>{a.label}</Text>
                  <Text style={s.activityDesc}>{a.desc}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[s.footer, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable
          style={({ pressed }) => [s.btn, !isValid && s.btnDisabled, pressed && isValid && { opacity: 0.85 }]}
          onPress={next}
          disabled={!isValid}
        >
          <Text style={[s.btnText, !isValid && { color: "#374151" }]}>Continue</Text>
          <Feather name="arrow-right" size={18} color={isValid ? "#000" : "#374151"} />
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
  goalGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  goalCard: {
    width: "47%", backgroundColor: CARD, borderRadius: 14, padding: 14, gap: 6,
    borderWidth: 1, borderColor: BORDER, position: "relative",
  },
  goalCardActive: { backgroundColor: "#0d1a0d" },
  goalIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  goalLabel: { fontSize: 13, fontWeight: "700", color: "#9ca3af" },
  goalDesc: { fontSize: 11, color: "#4b5563", lineHeight: 15 },
  goalCheck: { position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  activityList: { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },
  activityRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  activityRowActive: { backgroundColor: "#071a0e" },
  activityDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: BORDER, alignItems: "center", justifyContent: "center" },
  activityDotActive: { borderColor: G },
  activityDotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: G },
  activityLabel: { fontSize: 14, fontWeight: "600", color: "#fff" },
  activityDesc: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: BG, paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: BORDER },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: G, borderRadius: 14, paddingVertical: 16 },
  btnDisabled: { backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
  btnText: { fontSize: 16, fontWeight: "700", color: "#000" },
});
