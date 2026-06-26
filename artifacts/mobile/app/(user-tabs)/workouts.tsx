import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Platform, Pressable, RefreshControl,
  ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getWorkouts, getExercises } from "@/src/services/workoutService";
import type { WorkoutPlan, Exercise } from "@/src/types";

const G = "#20c55d";
const BG = "#050505";
const CARD = "#0d0d0d";
const BORDER = "#1e1e1e";

type Tab = "plans" | "exercises";
type FilterCat = "All" | "Strength" | "Cardio" | "HIIT" | "Yoga" | "Flexibility";
const CATS: FilterCat[] = ["All", "Strength", "Cardio", "HIIT", "Yoga", "Flexibility"];

const FALLBACK_WORKOUTS: WorkoutPlan[] = [
  { id: "1", name: "Full Body Blast", goal: "Strength", level: "Intermediate", days_per_week: 3 },
  { id: "2", name: "Morning HIIT", goal: "Fat Loss", level: "Advanced", days_per_week: 5 },
  { id: "3", name: "Core Power", goal: "Strength", level: "Beginner", days_per_week: 4 },
  { id: "4", name: "Cardio Burn", goal: "Endurance", level: "Intermediate", days_per_week: 3 },
];

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>("plans");
  const [activeFilter, setActiveFilter] = useState<FilterCat>("All");
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  async function load(isRefresh = false) {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const [w, e] = await Promise.allSettled([getWorkouts(), getExercises()]);
      if (w.status === "fulfilled" && w.value.length > 0) setWorkouts(w.value);
      else setWorkouts(FALLBACK_WORKOUTS);
      if (e.status === "fulfilled") setExercises(e.value);
    } catch {
      setWorkouts(FALLBACK_WORKOUTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const LEVEL_COLOR: Record<string, string> = { Beginner: "#34d399", Intermediate: "#fbbf24", Advanced: "#f87171" };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Header */}
      <View style={[s.header, { paddingTop: topPad + 16 }]}>
        <View>
          <Text style={s.title}>Workout</Text>
          <Text style={s.subtitle}>Your fitness plans & exercises</Text>
        </View>
        <View style={s.aiBadge}>
          <Feather name="cpu" size={12} color={G} />
          <Text style={s.aiBadgeText}>AI Powered</Text>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={s.tabRow}>
        {(["plans", "exercises"] as Tab[]).map(t => (
          <Pressable key={t} style={[s.tabBtn, tab === t && s.tabBtnActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabBtnText, tab === t && s.tabBtnTextActive]}>
              {t === "plans" ? "My Plans" : "Exercise Library"}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={G} size="large" />
          <Text style={s.loadText}>Loading workouts…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[s.list, { paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0) }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={G} />
          }
        >
          {tab === "plans" && (
            <>
              {/* AI Banner */}
              <View style={s.aiBanner}>
                <Feather name="zap" size={14} color={G} />
                <Text style={s.aiBannerText}>
                  Ask AI Coach to generate a personalized plan
                </Text>
                <Pressable style={s.aiBannerBtn}>
                  <Text style={s.aiBannerBtnText}>Generate</Text>
                </Pressable>
              </View>

              {workouts.length === 0 ? (
                <View style={s.emptyCard}>
                  <Feather name="clipboard" size={36} color="#374151" />
                  <Text style={s.emptyTitle}>No workout plans yet</Text>
                  <Text style={s.emptyText}>Your assigned and AI-generated workout plans will appear here.</Text>
                </View>
              ) : workouts.map(w => (
                <Pressable
                  key={w.id}
                  style={({ pressed }) => [s.card, pressed && { opacity: 0.9 }, activePlan === w.id && s.cardActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setActivePlan(activePlan === w.id ? null : w.id);
                  }}
                >
                  <View style={s.cardLeft}>
                    <View style={s.cardIcon}><Feather name="zap" size={22} color={G} /></View>
                    <View style={{ flex: 1, gap: 6 }}>
                      <Text style={s.cardName}>{w.name}</Text>
                      <View style={s.cardMeta}>
                        {w.level && (
                          <View style={[s.levelBadge, { backgroundColor: (LEVEL_COLOR[w.level] ?? G) + "20" }]}>
                            <Text style={[s.levelText, { color: LEVEL_COLOR[w.level] ?? G }]}>{w.level}</Text>
                          </View>
                        )}
                        {w.goal && <Text style={s.metaText}>{w.goal}</Text>}
                        {w.days_per_week && <Text style={s.metaText}>{w.days_per_week}d/week</Text>}
                      </View>
                    </View>
                  </View>
                  <Pressable style={s.playBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
                    <Feather name="play" size={14} color="#000" />
                  </Pressable>
                </Pressable>
              ))}
            </>
          )}

          {tab === "exercises" && (
            <>
              {/* Filter Row */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
                {CATS.map(cat => (
                  <Pressable
                    key={cat}
                    style={[s.chip, activeFilter === cat && s.chipActive]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setActiveFilter(cat);
                    }}
                  >
                    <Text style={[s.chipText, activeFilter === cat && s.chipTextActive]}>{cat}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              {exercises.length === 0 ? (
                <View style={s.emptyCard}>
                  <Feather name="database" size={36} color="#374151" />
                  <Text style={s.emptyTitle}>Exercise library loading</Text>
                  <Text style={s.emptyText}>Exercises will appear once the backend is connected.</Text>
                </View>
              ) : exercises.map(ex => (
                <View key={ex.id} style={s.exCard}>
                  <View style={s.exIcon}><Feather name="activity" size={20} color={G} /></View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={s.cardName}>{ex.name}</Text>
                    <View style={s.cardMeta}>
                      {ex.muscle_group && <Text style={s.metaText}>{ex.muscle_group}</Text>}
                      {ex.difficulty && <Text style={s.metaText}>{ex.difficulty}</Text>}
                      {ex.equipment && <Text style={s.metaText}>{ex.equipment}</Text>}
                    </View>
                  </View>
                  {ex.video_url && (
                    <View style={s.videoBadge}><Feather name="play-circle" size={14} color={G} /></View>
                  )}
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingBottom: 14 },
  title: { fontSize: 26, fontWeight: "800", color: "#fff" },
  subtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  aiBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: G + "15", borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 },
  aiBadgeText: { fontSize: 11, color: G, fontWeight: "700" },
  tabRow: { flexDirection: "row", marginHorizontal: 20, marginBottom: 16, backgroundColor: CARD, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: BORDER },
  tabBtn: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: 9 },
  tabBtnActive: { backgroundColor: G },
  tabBtnText: { fontSize: 13, color: "#6b7280", fontWeight: "600" },
  tabBtnTextActive: { color: "#000" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 60 },
  loadText: { color: "#6b7280", fontSize: 14 },
  list: { paddingHorizontal: 20, gap: 12 },
  aiBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#071a0e", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: G + "20" },
  aiBannerText: { fontSize: 13, color: "#9ca3af", flex: 1 },
  aiBannerBtn: { backgroundColor: G, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  aiBannerBtnText: { fontSize: 11, fontWeight: "700", color: "#000" },
  emptyCard: { backgroundColor: CARD, borderRadius: 16, padding: 32, alignItems: "center", gap: 10, borderWidth: 1, borderColor: BORDER },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  emptyText: { fontSize: 13, color: "#6b7280", textAlign: "center" },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: CARD, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: BORDER },
  cardActive: { borderColor: G },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  cardIcon: { width: 50, height: 50, borderRadius: 14, backgroundColor: G + "15", alignItems: "center", justifyContent: "center" },
  cardName: { fontSize: 15, fontWeight: "700", color: "#fff" },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  levelBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  levelText: { fontSize: 10, fontWeight: "700" },
  metaText: { fontSize: 12, color: "#6b7280" },
  playBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: G, alignItems: "center", justifyContent: "center" },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
  chipActive: { backgroundColor: G, borderColor: G },
  chipText: { fontSize: 12, color: "#6b7280", fontWeight: "600" },
  chipTextActive: { color: "#000" },
  exCard: { flexDirection: "row", alignItems: "center", backgroundColor: CARD, borderRadius: 14, padding: 14, gap: 12, borderWidth: 1, borderColor: BORDER },
  exIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: G + "15", alignItems: "center", justifyContent: "center" },
  videoBadge: { padding: 4 },
});
