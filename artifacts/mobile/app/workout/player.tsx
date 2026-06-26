import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/src/services/apiClient";

const G = "#20c55d";
const BG = "#050505";
const CARD = "#0d0d0d";
const BORDER = "#1e1e1e";

interface Exercise {
  id: string; name: string; muscle: string; sets: number; reps: number | null;
  rest_seconds: number; duration_seconds?: number; instructions: string; equipment: string;
}
interface Plan { id: string; name: string; exercises: Exercise[]; estimated_duration_mins: number }

type Phase = "exercise" | "rest" | "done";

function useTimer(target: number, running: boolean, onDone: () => void) {
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setElapsed(0);
  }, [target]);

  useEffect(() => {
    if (!running) { if (ref.current) clearInterval(ref.current); return; }
    ref.current = setInterval(() => {
      setElapsed(p => {
        if (p + 1 >= target) {
          if (ref.current) clearInterval(ref.current);
          onDone();
          return target;
        }
        return p + 1;
      });
    }, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running, target, onDone]);

  return { elapsed, remaining: Math.max(target - elapsed, 0) };
}

export default function WorkoutPlayerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; name: string }>();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [exIndex, setExIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("exercise");
  const [timerRunning, setTimerRunning] = useState(false);
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});
  const [sessionStart] = useState(Date.now());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<{ plan: Plan }>(`/api/workouts/plans/${params.id}`);
        setPlan(res.plan);
      } catch { setPlan(null); }
      finally { setLoading(false); }
    }
    load();
  }, [params.id]);

  const exercise = plan?.exercises[exIndex];
  const totalExercises = plan?.exercises.length ?? 0;
  const isLastEx = exIndex === totalExercises - 1;
  const isLastSet = exercise ? setIndex === exercise.sets - 1 : false;

  const restSeconds = exercise?.rest_seconds ?? 60;
  const exDuration = exercise?.duration_seconds ?? 0;
  const isTimedEx = exDuration > 0;

  const onTimerDone = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimerRunning(false);
    if (phase === "rest") {
      // Move to next set or exercise
      if (isLastSet) {
        if (isLastEx) setPhase("done");
        else { setExIndex(i => i + 1); setSetIndex(0); setPhase("exercise"); }
      } else { setSetIndex(s => s + 1); setPhase("exercise"); }
    } else {
      // Timed exercise done, go to rest
      setPhase("rest");
      setTimerRunning(true);
    }
  }, [phase, isLastSet, isLastEx]);

  const { remaining } = useTimer(
    phase === "rest" ? restSeconds : exDuration,
    timerRunning && (phase === "rest" || isTimedEx),
    onTimerDone
  );

  function completeSet() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (exercise) {
      setCompletedSets(prev => ({ ...prev, [exercise.id]: (prev[exercise.id] ?? 0) + 1 }));
    }
    if (isLastSet && isLastEx) {
      setPhase("done");
    } else if (isLastSet) {
      setExIndex(i => i + 1); setSetIndex(0); setPhase("rest"); setTimerRunning(true);
    } else {
      setSetIndex(s => s + 1); setPhase("rest"); setTimerRunning(true);
    }
  }

  function skipRest() {
    setTimerRunning(false);
    if (isLastSet) {
      if (isLastEx) setPhase("done");
      else { setExIndex(i => i + 1); setSetIndex(0); setPhase("exercise"); }
    } else { setSetIndex(s => s + 1); setPhase("exercise"); }
  }

  async function finishWorkout() {
    if (!plan) return;
    setSaving(true);
    const durationMins = Math.round((Date.now() - sessionStart) / 60000);
    try {
      await api.post("/api/workouts/session", {
        plan_id: plan.id,
        exercises_completed: Object.entries(completedSets).map(([id, sets]) => ({ id, sets })),
        duration_mins: durationMins,
        calories_burned: Math.round(durationMins * 6),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch { /* silent */ }
    setSaving(false);
    router.back();
    router.back();
  }

  function quit() {
    Alert.alert("Quit Workout", "Are you sure? Your progress will be lost.", [
      { text: "Keep Going", style: "cancel" },
      { text: "Quit", style: "destructive", onPress: () => router.back() },
    ]);
  }

  const totalSets = plan?.exercises.reduce((s, e) => s + e.sets, 0) ?? 0;
  const doneCount = Object.values(completedSets).reduce((a, b) => a + b, 0);
  const globalProgress = totalSets > 0 ? doneCount / totalSets : 0;

  if (loading) return (
    <View style={s.center}>
      <ActivityIndicator color={G} size="large" />
      <Text style={s.loadingText}>Loading workout…</Text>
    </View>
  );

  if (!plan) return (
    <View style={s.center}>
      <Feather name="alert-circle" size={48} color="#374151" />
      <Text style={s.loadingText}>Could not load workout</Text>
      <Pressable onPress={() => router.back()} style={s.quitBtn}>
        <Text style={s.quitText}>Go Back</Text>
      </Pressable>
    </View>
  );

  // Done State
  if (phase === "done") {
    const mins = Math.round((Date.now() - sessionStart) / 60000);
    return (
      <View style={[s.center, { gap: 20, paddingHorizontal: 32 }]}>
        <View style={s.doneIcon}>
          <Text style={{ fontSize: 36 }}>🎉</Text>
        </View>
        <Text style={s.doneTitle}>Workout Complete!</Text>
        <Text style={s.doneSub}>You crushed it! Here's your summary:</Text>

        <View style={s.summaryGrid}>
          {[
            { label: "Duration", value: `${mins} min`, color: "#60a5fa" },
            { label: "Sets Done", value: `${doneCount}`, color: G },
            { label: "Exercises", value: `${totalExercises}`, color: "#a78bfa" },
            { label: "Calories", value: `~${mins * 6} kcal`, color: "#f87171" },
          ].map(st => (
            <View key={st.label} style={s.summaryCard}>
              <Text style={[s.summaryVal, { color: st.color }]}>{st.value}</Text>
              <Text style={s.summaryLbl}>{st.label}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={[s.doneBtn, saving && { opacity: 0.7 }]}
          onPress={finishWorkout}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#000" /> : <Text style={s.doneBtnText}>Save & Exit 🚀</Text>}
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Top Bar */}
      <View style={[s.topBar, { paddingTop: topPad + 8 }]}>
        <Pressable style={s.quitBtn} onPress={quit}>
          <Feather name="x" size={18} color="#9ca3af" />
        </Pressable>
        <View style={{ flex: 1, gap: 4, marginHorizontal: 12 }}>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${globalProgress * 100}%` as `${number}%` }]} />
          </View>
          <Text style={s.progressText}>{doneCount}/{totalSets} sets done</Text>
        </View>
        <Text style={s.exCounter}>{exIndex + 1}/{totalExercises}</Text>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Exercise Header */}
        {exercise && (
          <>
            <View style={s.exHeader}>
              <View style={s.exMuscleTag}>
                <Text style={s.exMuscleText}>{exercise.muscle}</Text>
              </View>
              <Text style={s.exName}>{exercise.name}</Text>
              <Text style={s.exEquip}>{exercise.equipment}</Text>
            </View>

            {/* Set Tracker */}
            <View style={s.setTracker}>
              <Text style={s.setLabel}>Set {setIndex + 1} of {exercise.sets}</Text>
              <View style={s.setDots}>
                {Array.from({ length: exercise.sets }).map((_, i) => (
                  <View key={i} style={[s.setDot, i < setIndex && s.setDotDone, i === setIndex && s.setDotActive]} />
                ))}
              </View>
            </View>

            {/* Target */}
            <View style={s.targetCard}>
              {isTimedEx ? (
                <>
                  <Text style={s.targetNum}>{phase === "rest" ? remaining : (timerRunning ? remaining : exercise.duration_seconds)}s</Text>
                  <Text style={s.targetLabel}>{phase === "rest" ? "Rest" : "Hold / Complete"}</Text>
                </>
              ) : phase === "rest" ? (
                <>
                  <Text style={s.targetNum}>{remaining}s</Text>
                  <Text style={s.targetLabel}>Rest</Text>
                </>
              ) : (
                <>
                  <Text style={s.targetNum}>{exercise.reps ?? "—"}</Text>
                  <Text style={s.targetLabel}>Reps</Text>
                </>
              )}
            </View>

            {/* Instructions */}
            <View style={s.instrCard}>
              <Feather name="info" size={13} color="#6b7280" />
              <Text style={s.instrText}>{exercise.instructions}</Text>
            </View>

            {/* Upcoming */}
            {!isLastEx && plan.exercises[exIndex + 1] && (
              <View style={s.nextCard}>
                <Text style={s.nextLabel}>Up next</Text>
                <Text style={s.nextName}>{plan.exercises[exIndex + 1].name}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Action Button */}
      <View style={[s.footer, { paddingBottom: insets.bottom + 20 }]}>
        {phase === "rest" ? (
          <Pressable style={s.skipBtn} onPress={skipRest}>
            <Feather name="skip-forward" size={16} color="#000" />
            <Text style={s.skipBtnText}>Skip Rest · {remaining}s</Text>
          </Pressable>
        ) : isTimedEx ? (
          <Pressable
            style={[s.doneSetBtn, timerRunning && { backgroundColor: "#f87171" }]}
            onPress={() => {
              if (timerRunning) { setTimerRunning(false); }
              else { setTimerRunning(true); }
            }}
          >
            <Feather name={timerRunning ? "pause" : "play"} size={18} color="#000" />
            <Text style={s.doneSetText}>{timerRunning ? "Pause Timer" : "Start Timer"}</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [s.doneSetBtn, pressed && { opacity: 0.85 }]}
            onPress={completeSet}
          >
            <Feather name="check" size={18} color="#000" />
            <Text style={s.doneSetText}>
              {isLastSet && isLastEx ? "Complete Workout" : "Done · Next Set"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, backgroundColor: BG, alignItems: "center", justifyContent: "center", gap: 14 },
  loadingText: { color: "#9ca3af", fontSize: 14 },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12 },
  quitBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: CARD, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: BORDER },
  quitText: { color: "#f87171", fontWeight: "700" },
  progressBar: { height: 4, backgroundColor: BORDER, borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: G, borderRadius: 2 },
  progressText: { fontSize: 10, color: "#6b7280", textAlign: "right" },
  exCounter: { fontSize: 13, fontWeight: "700", color: "#9ca3af" },
  content: { paddingHorizontal: 20, paddingBottom: 120, gap: 20 },
  exHeader: { gap: 6 },
  exMuscleTag: { backgroundColor: G + "20", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
  exMuscleText: { fontSize: 11, fontWeight: "700", color: G },
  exName: { fontSize: 28, fontWeight: "800", color: "#fff" },
  exEquip: { fontSize: 13, color: "#6b7280" },
  setTracker: { gap: 10 },
  setLabel: { fontSize: 14, fontWeight: "600", color: "#9ca3af" },
  setDots: { flexDirection: "row", gap: 8 },
  setDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: BORDER },
  setDotDone: { backgroundColor: G },
  setDotActive: { backgroundColor: G, width: 28, borderRadius: 6 },
  targetCard: { backgroundColor: CARD, borderRadius: 20, padding: 32, alignItems: "center", gap: 8, borderWidth: 1, borderColor: BORDER },
  targetNum: { fontSize: 72, fontWeight: "800", color: "#fff", lineHeight: 80 },
  targetLabel: { fontSize: 14, color: "#6b7280", fontWeight: "600" },
  instrCard: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: CARD, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: BORDER },
  instrText: { fontSize: 13, color: "#9ca3af", lineHeight: 20, flex: 1 },
  nextCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: CARD, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: BORDER },
  nextLabel: { fontSize: 11, color: "#6b7280" },
  nextName: { fontSize: 14, fontWeight: "600", color: "#fff" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: BG, borderTopWidth: 1, borderTopColor: BORDER, paddingHorizontal: 20, paddingTop: 14 },
  doneSetBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: G, borderRadius: 16, paddingVertical: 18 },
  doneSetText: { fontSize: 17, fontWeight: "700", color: "#000" },
  skipBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#38bdf8", borderRadius: 16, paddingVertical: 18 },
  skipBtnText: { fontSize: 17, fontWeight: "700", color: "#000" },
  doneIcon: { width: 90, height: 90, borderRadius: 45, backgroundColor: G, alignItems: "center", justifyContent: "center" },
  doneTitle: { fontSize: 28, fontWeight: "800", color: "#fff" },
  doneSub: { fontSize: 14, color: "#9ca3af" },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, width: "100%" },
  summaryCard: { flex: 1, minWidth: "44%", backgroundColor: CARD, borderRadius: 14, padding: 16, alignItems: "center", gap: 4, borderWidth: 1, borderColor: BORDER },
  summaryVal: { fontSize: 24, fontWeight: "800" },
  summaryLbl: { fontSize: 11, color: "#6b7280" },
  doneBtn: { backgroundColor: G, borderRadius: 16, paddingVertical: 16, alignItems: "center", width: "100%" },
  doneBtnText: { fontSize: 17, fontWeight: "700", color: "#000" },
});
