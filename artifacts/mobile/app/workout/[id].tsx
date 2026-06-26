import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/src/services/apiClient";

const G = "#20c55d";
const BG = "#050505";
const CARD = "#0d0d0d";
const BORDER = "#1e1e1e";

interface Exercise {
  id: string; name: string; muscle: string; equipment: string; difficulty: string;
  sets: number; reps: number | null; rest_seconds: number; duration_seconds?: number; instructions: string;
}
interface Plan {
  id: string; name: string; level: string; goal: string; days_per_week: number;
  duration_weeks: number; estimated_duration_mins: number; description: string;
  exercises: Exercise[];
}

const MUSCLE_COLORS: Record<string, string> = {
  Chest: "#f87171", Back: "#60a5fa", Legs: "#a78bfa", Core: G,
  Arms: "#fb923c", Shoulders: "#fbbf24", "Full Body": "#34d399",
};

export default function WorkoutDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string; name?: string }>();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<{ plan: Plan }>(`/api/workouts/plans/${id}`);
        setPlan(res.plan);
      } catch {
        setPlan(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const totalSets = plan?.exercises.reduce((s, e) => s + e.sets, 0) ?? 0;
  const totalExercises = plan?.exercises.length ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        contentContainerStyle={[s.container, { paddingTop: topPad + 16, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Pressable style={s.back} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>
          <Text style={s.headerTitle} numberOfLines={1}>{plan?.name ?? "Workout"}</Text>
        </View>

        {loading ? (
          <View style={s.loadingWrap}><ActivityIndicator color={G} size="large" /></View>
        ) : !plan ? (
          <View style={s.empty}>
            <Feather name="alert-circle" size={48} color="#374151" />
            <Text style={s.emptyText}>Workout not found</Text>
            <Pressable style={s.backBtn} onPress={() => router.back()}>
              <Text style={s.backBtnText}>Go Back</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Plan Meta */}
            <View style={s.metaCard}>
              <View style={s.metaIconWrap}>
                <Feather name="zap" size={28} color="#000" />
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={s.planName}>{plan.name}</Text>
                <View style={s.tagRow}>
                  <View style={[s.tag, { backgroundColor: G + "20" }]}>
                    <Text style={[s.tagText, { color: G }]}>{plan.level}</Text>
                  </View>
                  <View style={[s.tag, { backgroundColor: "#60a5fa20" }]}>
                    <Text style={[s.tagText, { color: "#60a5fa" }]}>{plan.goal}</Text>
                  </View>
                </View>
                <Text style={s.planDesc}>{plan.description}</Text>
              </View>
            </View>

            {/* Stats Row */}
            <View style={s.statsRow}>
              {[
                { label: "Duration", value: `${plan.duration_weeks}wk`, icon: "calendar" as const, color: "#60a5fa" },
                { label: "Days/Week", value: `${plan.days_per_week}x`, icon: "repeat" as const, color: "#a78bfa" },
                { label: "Time", value: `${plan.estimated_duration_mins}min`, icon: "clock" as const, color: "#fbbf24" },
                { label: "Exercises", value: `${totalExercises}`, icon: "activity" as const, color: G },
              ].map(st => (
                <View key={st.label} style={s.statCard}>
                  <View style={[s.statIcon, { backgroundColor: st.color + "20" }]}>
                    <Feather name={st.icon} size={14} color={st.color} />
                  </View>
                  <Text style={s.statValue}>{st.value}</Text>
                  <Text style={s.statLabel}>{st.label}</Text>
                </View>
              ))}
            </View>

            {/* Exercise List */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>Exercises ({totalExercises})</Text>
              <View style={s.exerciseList}>
                {plan.exercises.map((ex, i) => (
                  <View key={ex.id} style={[s.exRow, i < plan.exercises.length - 1 && { borderBottomWidth: 1, borderBottomColor: "#111" }]}>
                    <View style={s.exNum}>
                      <Text style={s.exNumText}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={s.exName}>{ex.name}</Text>
                      <View style={s.exTagRow}>
                        <View style={[s.exMuscle, { backgroundColor: (MUSCLE_COLORS[ex.muscle] ?? G) + "20" }]}>
                          <Text style={[s.exMuscleText, { color: MUSCLE_COLORS[ex.muscle] ?? G }]}>{ex.muscle}</Text>
                        </View>
                        <Text style={s.exEquip}>{ex.equipment}</Text>
                      </View>
                      <Text style={s.exInstructions} numberOfLines={2}>{ex.instructions}</Text>
                    </View>
                    <View style={s.exSets}>
                      <Text style={s.exSetsNum}>{ex.sets}</Text>
                      <Text style={s.exSetsLabel}>sets</Text>
                      {ex.reps && <Text style={s.exReps}>×{ex.reps}</Text>}
                      {ex.duration_seconds && <Text style={s.exReps}>{ex.duration_seconds}s</Text>}
                      <Text style={s.exRest}>Rest {ex.rest_seconds}s</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Tip */}
            <View style={s.tipCard}>
              <Feather name="info" size={14} color="#60a5fa" />
              <Text style={s.tipText}>Warm up for 5–10 minutes before starting. Focus on form over speed. Rest fully between sets.</Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Start Button */}
      {!loading && plan && (
        <View style={[s.footer, { paddingBottom: insets.bottom + 20 }]}>
          <Pressable
            style={({ pressed }) => [s.startBtn, pressed && { opacity: 0.88 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              router.push({ pathname: "/workout/player", params: { id: plan.id, name: plan.name } });
            }}
          >
            <Feather name="play" size={18} color="#000" />
            <Text style={s.startBtnText}>Start Workout</Text>
          </Pressable>
          <Text style={s.startSub}>{totalSets} sets · ~{plan.estimated_duration_mins} minutes</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 14 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: CARD, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: BORDER },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "700", color: "#fff" },
  loadingWrap: { flex: 1, alignItems: "center", paddingTop: 80 },
  empty: { flex: 1, alignItems: "center", gap: 16, paddingTop: 80 },
  emptyText: { fontSize: 16, color: "#6b7280" },
  backBtn: { backgroundColor: CARD, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, borderColor: BORDER },
  backBtnText: { color: "#fff", fontWeight: "600" },
  metaCard: { flexDirection: "row", gap: 14, backgroundColor: CARD, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: G + "40" },
  metaIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: G, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  planName: { fontSize: 17, fontWeight: "800", color: "#fff" },
  tagRow: { flexDirection: "row", gap: 6 },
  tag: { borderRadius: 7, paddingHorizontal: 9, paddingVertical: 3 },
  tagText: { fontSize: 10, fontWeight: "700" },
  planDesc: { fontSize: 12, color: "#9ca3af", lineHeight: 18 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: CARD, borderRadius: 14, padding: 12, gap: 6, alignItems: "center", borderWidth: 1, borderColor: BORDER },
  statIcon: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 16, fontWeight: "800", color: "#fff" },
  statLabel: { fontSize: 10, color: "#6b7280" },
  section: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  exerciseList: { backgroundColor: CARD, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: BORDER },
  exRow: { flexDirection: "row", alignItems: "flex-start", padding: 14, gap: 12 },
  exNum: { width: 26, height: 26, borderRadius: 8, backgroundColor: BORDER, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  exNumText: { fontSize: 12, fontWeight: "700", color: "#9ca3af" },
  exName: { fontSize: 14, fontWeight: "700", color: "#fff" },
  exTagRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  exMuscle: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  exMuscleText: { fontSize: 10, fontWeight: "700" },
  exEquip: { fontSize: 10, color: "#4b5563" },
  exInstructions: { fontSize: 11, color: "#6b7280", lineHeight: 16 },
  exSets: { alignItems: "center", gap: 1, flexShrink: 0 },
  exSetsNum: { fontSize: 20, fontWeight: "800", color: G },
  exSetsLabel: { fontSize: 9, color: "#6b7280" },
  exReps: { fontSize: 11, color: "#9ca3af", fontWeight: "600" },
  exRest: { fontSize: 9, color: "#4b5563", marginTop: 2 },
  tipCard: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "#0a1020", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#60a5fa30" },
  tipText: { fontSize: 12, color: "#60a5fa", lineHeight: 18, flex: 1 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: BG, borderTopWidth: 1, borderTopColor: BORDER, paddingHorizontal: 20, paddingTop: 12, gap: 6 },
  startBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: G, borderRadius: 16, paddingVertical: 16 },
  startBtnText: { fontSize: 17, fontWeight: "700", color: "#000" },
  startSub: { fontSize: 12, color: "#6b7280", textAlign: "center" },
});
