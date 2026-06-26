import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Platform, Pressable, RefreshControl,
  ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { getDashboard } from "@/src/services/userService";
import { getDailyTip } from "@/src/services/aiService";
import type { DashboardData } from "@/src/types";

const G = "#20c55d";
const BG = "#050505";
const CARD = "#0d0d0d";
const BORDER = "#1e1e1e";

const QUICK_ACTIONS = [
  { icon: "zap" as const, label: "Workout", color: G, route: "/(user-tabs)/workouts" },
  { icon: "cpu" as const, label: "AI Coach", color: "#a78bfa", route: "/(user-tabs)/nutrition" },
  { icon: "heart" as const, label: "Health", color: "#f87171", route: "/(user-tabs)/challenges" },
  { icon: "droplet" as const, label: "Water", color: "#38bdf8", route: null },
  { icon: "camera" as const, label: "Scan Food", color: "#fb923c", route: null },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function today() {
  return new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [tip, setTip] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [water, setWater] = useState(0);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const firstName = user?.name?.split(" ")[0] ?? "User";

  async function load(isRefresh = false) {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const [dash, dailyTip] = await Promise.allSettled([getDashboard(), getDailyTip()]);
      if (dash.status === "fulfilled") setDashboard(dash.value);
      if (dailyTip.status === "fulfilled") setTip(dailyTip.value);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  function addWater(ml: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWater(w => Math.min(w + ml, (dashboard?.water_target ?? 3000)));
  }

  const waterTarget = dashboard?.water_target ?? 3000;
  const waterConsumed = water || (dashboard?.water_consumed ?? 0);
  const calConsumed = dashboard?.calories_consumed ?? 0;
  const calTarget = dashboard?.calories_target ?? 2200;
  const streak = dashboard?.streak ?? 0;
  const points = dashboard?.points ?? 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[s.container, { paddingTop: topPad + 16, paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0) }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(true); }}
          tintColor={G}
        />
      }
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>{getGreeting()},</Text>
          <Text style={s.name}>{firstName} 👋</Text>
          <Text style={s.date}>{today()}</Text>
        </View>
        <View style={s.headerRight}>
          <Pressable style={s.notifBtn}>
            <Feather name="bell" size={20} color="#9ca3af" />
          </Pressable>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{firstName[0]?.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {loading && (
        <View style={s.loadingCard}>
          <ActivityIndicator color={G} />
          <Text style={s.loadingText}>Loading your dashboard…</Text>
        </View>
      )}

      {error && (
        <View style={s.errorCard}>
          <Feather name="wifi-off" size={20} color="#f87171" />
          <Text style={s.errorText}>{error}</Text>
          <Pressable style={s.retryBtn} onPress={() => load()}>
            <Text style={s.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {/* Streak */}
      {streak > 0 && (
        <View style={s.streakBanner}>
          <View style={s.streakLeft}>
            <Text style={s.streakEmoji}>🔥</Text>
            <View>
              <Text style={s.streakTitle}>{streak}-Day Streak!</Text>
              <Text style={s.streakSub}>Keep it up — you're on fire!</Text>
            </View>
          </View>
          <View style={s.streakBadge}><Text style={s.streakBadgeText}>ACTIVE</Text></View>
        </View>
      )}

      {/* Stats */}
      <View style={s.statsGrid}>
        {[
          { label: "Calories", value: calConsumed > 0 ? calConsumed.toString() : "—", unit: `of ${calTarget} kcal`, icon: "zap" as const, color: G },
          { label: "Streak", value: streak > 0 ? `${streak}` : "—", unit: "days", icon: "activity" as const, color: "#fb923c" },
          { label: "Points", value: points > 0 ? points.toLocaleString() : "—", unit: "earned", icon: "star" as const, color: "#fbbf24" },
          { label: "Water", value: `${(waterConsumed / 1000).toFixed(1)}`, unit: `of ${(waterTarget / 1000).toFixed(1)} L`, icon: "droplet" as const, color: "#38bdf8" },
        ].map(stat => (
          <View key={stat.label} style={s.statCard}>
            <View style={[s.statIcon, { backgroundColor: stat.color + "20" }]}>
              <Feather name={stat.icon} size={16} color={stat.color} />
            </View>
            <Text style={s.statValue}>{stat.value}</Text>
            <Text style={s.statLabel}>{stat.label}</Text>
            <Text style={s.statUnit}>{stat.unit}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Quick Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {QUICK_ACTIONS.map(a => (
            <Pressable
              key={a.label}
              style={({ pressed }) => [s.quickBtn, pressed && { opacity: 0.75 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (a.route) router.push(a.route as never);
              }}
            >
              <View style={[s.quickIcon, { backgroundColor: a.color + "20" }]}>
                <Feather name={a.icon} size={20} color={a.color} />
              </View>
              <Text style={s.quickLabel}>{a.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Today's Workout */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Today's Workout</Text>
        {dashboard?.today_workout ? (
          <Pressable style={({ pressed }) => [s.workoutCard, pressed && { opacity: 0.9 }]} onPress={() => router.push("/(user-tabs)/workouts" as never)}>
            <View style={s.workoutLeft}>
              <View style={[s.workoutIcon, { backgroundColor: G + "20" }]}>
                <Feather name="zap" size={22} color={G} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={s.workoutName}>{dashboard.today_workout.name}</Text>
                <Text style={s.workoutMeta}>
                  {dashboard.today_workout.days_per_week && `${dashboard.today_workout.days_per_week} days/week`}
                  {dashboard.today_workout.level && ` · ${dashboard.today_workout.level}`}
                </Text>
              </View>
            </View>
            <Pressable style={s.startBtn} onPress={() => router.push("/(user-tabs)/workouts" as never)}>
              <Feather name="play" size={14} color="#000" />
            </Pressable>
          </Pressable>
        ) : !loading ? (
          <View style={s.emptyCard}>
            <Feather name="calendar" size={32} color="#374151" />
            <Text style={s.emptyTitle}>No workout assigned</Text>
            <Text style={s.emptyText}>Go to Workout tab to get an AI plan or browse exercises.</Text>
            <Pressable style={s.emptyBtn} onPress={() => router.push("/(user-tabs)/workouts" as never)}>
              <Text style={s.emptyBtnText}>Browse Workouts</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      {/* AI Daily Tip */}
      <View style={s.aiCard}>
        <View style={s.aiHeader}>
          <View style={s.aiIcon}><Feather name="cpu" size={16} color={G} /></View>
          <Text style={s.aiTitle}>AI Coach Tip</Text>
          <View style={s.aiBadge}><Text style={s.aiBadgeText}>GEMINI</Text></View>
        </View>
        <Text style={s.aiText}>
          {tip ?? (loading ? "Loading your personalized tip…" : "Stay consistent — every workout counts toward your goal! 💪")}
        </Text>
        <Pressable style={s.aiBtn} onPress={() => router.push("/(user-tabs)/nutrition" as never)}>
          <Text style={s.aiBtnText}>Chat with AI Coach</Text>
          <Feather name="arrow-right" size={13} color="#000" />
        </Pressable>
      </View>

      {/* Water Tracker */}
      <View style={s.waterCard}>
        <View style={s.waterHeader}>
          <View style={s.waterLeft}>
            <Feather name="droplet" size={16} color="#38bdf8" />
            <Text style={s.waterTitle}>Water Intake</Text>
          </View>
          <Text style={s.waterAmt}>{(waterConsumed / 1000).toFixed(2)} / {(waterTarget / 1000).toFixed(1)} L</Text>
        </View>
        <View style={s.waterBarBg}>
          <View style={[s.waterBarFill, { width: `${Math.min((waterConsumed / waterTarget) * 100, 100)}%` as `${number}%` }]} />
        </View>
        <View style={s.waterBtns}>
          {[250, 500, 750].map(ml => (
            <Pressable key={ml} style={s.waterAddBtn} onPress={() => addWater(ml)}>
              <Text style={s.waterAddText}>+{ml}ml</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Subscription */}
      {user?.subscription_status === "free" || !user?.subscription_status ? (
        <View style={s.upgradeBanner}>
          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Feather name="zap" size={16} color="#fbbf24" />
              <Text style={s.upgradeTitle}>Unlock SE7ENFIT PRIME</Text>
            </View>
            <Text style={s.upgradeSub}>Unlimited AI coaching, advanced plans & food scan</Text>
          </View>
          <Pressable style={s.upgradeBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
            <Text style={s.upgradeBtnText}>Upgrade</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  greeting: { fontSize: 13, color: "#6b7280" },
  name: { fontSize: 24, fontWeight: "800", color: "#fff" },
  date: { fontSize: 12, color: "#4b5563", marginTop: 2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  notifBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, alignItems: "center", justifyContent: "center" },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: G, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontWeight: "700", color: "#000" },
  loadingCard: { flexDirection: "row", gap: 10, backgroundColor: CARD, borderRadius: 14, padding: 16, alignItems: "center", borderWidth: 1, borderColor: BORDER },
  loadingText: { color: "#9ca3af", fontSize: 14 },
  errorCard: { gap: 10, backgroundColor: "rgba(239,68,68,0.08)", borderRadius: 14, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" },
  errorText: { color: "#f87171", fontSize: 13, textAlign: "center" },
  retryBtn: { backgroundColor: "#f87171", borderRadius: 10, paddingHorizontal: 20, paddingVertical: 8 },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  streakBanner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#1a0f00", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#fb923c20" },
  streakLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  streakEmoji: { fontSize: 28 },
  streakTitle: { fontSize: 15, fontWeight: "700", color: "#fff" },
  streakSub: { fontSize: 11, color: "#6b7280" },
  streakBadge: { backgroundColor: "#fb923c20", borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  streakBadgeText: { fontSize: 10, fontWeight: "700", color: "#fb923c" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: { flex: 1, minWidth: "44%", backgroundColor: CARD, borderRadius: 16, padding: 14, gap: 5, borderWidth: 1, borderColor: BORDER },
  statIcon: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 21, fontWeight: "800", color: "#fff", marginTop: 4 },
  statLabel: { fontSize: 12, fontWeight: "600", color: "#d1d5db" },
  statUnit: { fontSize: 10, color: "#6b7280" },
  section: { gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#fff" },
  quickBtn: { alignItems: "center", gap: 6, width: 68 },
  quickIcon: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 11, color: "#9ca3af", fontWeight: "500" },
  workoutCard: { flexDirection: "row", alignItems: "center", backgroundColor: CARD, borderRadius: 14, padding: 14, gap: 12, borderWidth: 1, borderColor: BORDER },
  workoutLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  workoutIcon: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  workoutName: { fontSize: 15, fontWeight: "700", color: "#fff" },
  workoutMeta: { fontSize: 12, color: "#6b7280" },
  startBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: G, alignItems: "center", justifyContent: "center" },
  emptyCard: { backgroundColor: CARD, borderRadius: 14, padding: 24, alignItems: "center", gap: 10, borderWidth: 1, borderColor: BORDER },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: "#fff" },
  emptyText: { fontSize: 13, color: "#6b7280", textAlign: "center" },
  emptyBtn: { backgroundColor: G + "20", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  emptyBtnText: { color: G, fontWeight: "600", fontSize: 13 },
  aiCard: { backgroundColor: "#071a0e", borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: G + "30" },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  aiIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: G + "20", alignItems: "center", justifyContent: "center" },
  aiTitle: { fontSize: 14, fontWeight: "700", color: "#fff", flex: 1 },
  aiBadge: { backgroundColor: G + "20", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  aiBadgeText: { fontSize: 9, fontWeight: "700", color: G },
  aiText: { fontSize: 14, color: "#d1d5db", lineHeight: 21 },
  aiBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: G, borderRadius: 9, paddingHorizontal: 14, paddingVertical: 9, alignSelf: "flex-start" },
  aiBtnText: { fontSize: 12, fontWeight: "700", color: "#000" },
  waterCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: "#38bdf820" },
  waterHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  waterLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  waterTitle: { fontSize: 14, fontWeight: "700", color: "#fff" },
  waterAmt: { fontSize: 13, fontWeight: "700", color: "#38bdf8" },
  waterBarBg: { height: 8, backgroundColor: "#1e1e1e", borderRadius: 4 },
  waterBarFill: { height: 8, backgroundColor: "#38bdf8", borderRadius: 4 },
  waterBtns: { flexDirection: "row", gap: 10 },
  waterAddBtn: { flex: 1, backgroundColor: "#38bdf815", borderRadius: 9, paddingVertical: 8, alignItems: "center", borderWidth: 1, borderColor: "#38bdf820" },
  waterAddText: { fontSize: 12, color: "#38bdf8", fontWeight: "700" },
  upgradeBanner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#1a1200", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#fbbf2420" },
  upgradeTitle: { fontSize: 14, fontWeight: "700", color: "#fff" },
  upgradeSub: { fontSize: 11, color: "#6b7280" },
  upgradeBtn: { backgroundColor: "#fbbf24", borderRadius: 9, paddingHorizontal: 14, paddingVertical: 8 },
  upgradeBtnText: { fontSize: 12, fontWeight: "700", color: "#000" },
});
