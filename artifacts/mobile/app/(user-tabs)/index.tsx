import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

const WORKOUTS = [
  { id: "1", name: "Full Body Blast", duration: "45 min", level: "Intermediate", calories: 380, icon: "zap" as const },
  { id: "2", name: "Core & Abs", duration: "20 min", level: "Beginner", calories: 180, icon: "target" as const },
  { id: "3", name: "HIIT Cardio", duration: "30 min", level: "Advanced", calories: 420, icon: "activity" as const },
];

const STATS = [
  { label: "Streak", value: "7", unit: "days", icon: "flame" as const, color: "#F97316" },
  { label: "Calories", value: "1,840", unit: "kcal", icon: "zap" as const, color: "#22C55E" },
  { label: "Workouts", value: "24", unit: "this month", icon: "award" as const, color: "#3B82F6" },
  { label: "Water", value: "2.1", unit: "L today", icon: "droplet" as const, color: "#06B6D4" },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeWorkout, setActiveWorkout] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const firstName = user?.name?.split(" ")[0] ?? "User";

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.container, { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>{firstName} 👋</Text>
        </View>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Streak Banner */}
      <View style={styles.streakBanner}>
        <View style={styles.streakLeft}>
          <Text style={styles.streakFire}>🔥</Text>
          <View>
            <Text style={styles.streakTitle}>7-Day Streak!</Text>
            <Text style={styles.streakSub}>Keep it up — you're on fire!</Text>
          </View>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakBadgeText}>ACTIVE</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {STATS.map((s) => (
          <View key={s.label} style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: s.color + "20" }]}>
              <Feather name={s.icon} size={18} color={s.color} />
            </View>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={styles.statUnit}>{s.unit}</Text>
          </View>
        ))}
      </View>

      {/* AI Coach Card */}
      <View style={styles.aiCard}>
        <View style={styles.aiCardHeader}>
          <View style={styles.aiIconWrap}>
            <Feather name="cpu" size={18} color="#22C55E" />
          </View>
          <Text style={styles.aiCardTitle}>AI Coach</Text>
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>PRIME</Text>
          </View>
        </View>
        <Text style={styles.aiCardText}>
          Based on your progress, today is perfect for a{" "}
          <Text style={styles.aiHighlight}>Full Body Blast</Text>. You've been
          skipping leg day — let's fix that today! 💪
        </Text>
        <Pressable style={styles.aiBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <Text style={styles.aiBtnText}>View AI Plan</Text>
          <Feather name="arrow-right" size={14} color="#000" />
        </Pressable>
      </View>

      {/* Today's Workouts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Workouts</Text>
          <Pressable>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>
        {WORKOUTS.map((w) => (
          <Pressable
            key={w.id}
            style={({ pressed }) => [styles.workoutCard, pressed && { opacity: 0.85 }, activeWorkout === w.id && styles.workoutCardActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveWorkout(activeWorkout === w.id ? null : w.id);
            }}
          >
            <View style={styles.workoutIconWrap}>
              <Feather name={w.icon} size={22} color="#22C55E" />
            </View>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>{w.name}</Text>
              <View style={styles.workoutMeta}>
                <Text style={styles.workoutMetaText}>{w.duration}</Text>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.workoutMetaText}>{w.level}</Text>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.workoutMetaText}>{w.calories} cal</Text>
              </View>
            </View>
            <Feather name="play-circle" size={28} color="#22C55E" />
          </Pressable>
        ))}
      </View>

      {/* Progress Ring Placeholder */}
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>Weekly Goal</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressRing}>
            <Text style={styles.progressPct}>68%</Text>
            <Text style={styles.progressPctLabel}>complete</Text>
          </View>
          <View style={styles.progressDetails}>
            <View style={styles.progressItem}>
              <View style={[styles.progressDot, { backgroundColor: "#22C55E" }]} />
              <Text style={styles.progressItemText}>Workouts: 4 / 6</Text>
            </View>
            <View style={styles.progressItem}>
              <View style={[styles.progressDot, { backgroundColor: "#3B82F6" }]} />
              <Text style={styles.progressItemText}>Calories: 6,240 / 9,000</Text>
            </View>
            <View style={styles.progressItem}>
              <View style={[styles.progressDot, { backgroundColor: "#F97316" }]} />
              <Text style={styles.progressItemText}>Active Days: 5 / 7</Text>
            </View>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "68%" }]} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#0A0A0A" },
  container: { paddingHorizontal: 20, gap: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greeting: { fontSize: 14, color: "#6B7280" },
  name: { fontSize: 22, fontWeight: "800" as const, color: "#FFF" },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "700" as const, color: "#000" },

  streakBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F9731620",
  },
  streakLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  streakFire: { fontSize: 28 },
  streakTitle: { fontSize: 16, fontWeight: "700" as const, color: "#FFF" },
  streakSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  streakBadge: {
    backgroundColor: "#F9731620",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakBadgeText: { fontSize: 11, fontWeight: "700" as const, color: "#F97316" },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    flex: 1,
    minWidth: "44%",
    backgroundColor: "#141414",
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: "#262626",
  },
  statIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 22, fontWeight: "800" as const, color: "#FFF", marginTop: 4 },
  statLabel: { fontSize: 13, fontWeight: "600" as const, color: "#D1D5DB" },
  statUnit: { fontSize: 11, color: "#6B7280" },

  aiCard: {
    backgroundColor: "#0F1F0F",
    borderRadius: 16,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: "#22C55E30",
  },
  aiCardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  aiIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: "#22C55E20",
    alignItems: "center",
    justifyContent: "center",
  },
  aiCardTitle: { fontSize: 15, fontWeight: "700" as const, color: "#FFF", flex: 1 },
  aiBadge: { backgroundColor: "#22C55E20", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  aiBadgeText: { fontSize: 10, fontWeight: "700" as const, color: "#22C55E" },
  aiCardText: { fontSize: 14, color: "#D1D5DB", lineHeight: 21 },
  aiHighlight: { color: "#22C55E", fontWeight: "700" as const },
  aiBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#22C55E",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: "flex-start",
  },
  aiBtnText: { fontSize: 13, fontWeight: "700" as const, color: "#000" },

  section: { gap: 12 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const, color: "#FFF" },
  seeAll: { fontSize: 13, color: "#22C55E" },

  workoutCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141414",
    borderRadius: 14,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: "#262626",
  },
  workoutCardActive: { borderColor: "#22C55E" },
  workoutIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: "#22C55E15",
    alignItems: "center",
    justifyContent: "center",
  },
  workoutInfo: { flex: 1, gap: 4 },
  workoutName: { fontSize: 15, fontWeight: "700" as const, color: "#FFF" },
  workoutMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  workoutMetaText: { fontSize: 12, color: "#6B7280" },
  dot: { color: "#262626" },

  progressCard: {
    backgroundColor: "#141414",
    borderRadius: 16,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: "#262626",
  },
  progressTitle: { fontSize: 16, fontWeight: "700" as const, color: "#FFF" },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 20 },
  progressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#22C55E20",
    borderWidth: 4,
    borderColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
  },
  progressPct: { fontSize: 18, fontWeight: "800" as const, color: "#22C55E" },
  progressPctLabel: { fontSize: 9, color: "#6B7280" },
  progressDetails: { flex: 1, gap: 10 },
  progressItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressDot: { width: 8, height: 8, borderRadius: 4 },
  progressItemText: { fontSize: 12, color: "#D1D5DB" },
  progressBar: { height: 6, backgroundColor: "#262626", borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: "#22C55E", borderRadius: 3 },
});
