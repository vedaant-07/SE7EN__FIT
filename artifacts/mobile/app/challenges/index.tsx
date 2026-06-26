import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, Platform, Pressable, RefreshControl,
  ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/src/services/apiClient";

const G = "#20c55d";
const BG = "#050505";
const CARD = "#0d0d0d";
const BORDER = "#1e1e1e";

type ChallengeStatus = "not_joined" | "joined" | "completed";
type Tab = "Active" | "My Challenges" | "Leaderboard";

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_days: number;
  points_reward: number;
  participants: number;
  target: number;
  badge: string;
  is_active: boolean;
  status: ChallengeStatus;
  progress?: number;
  progress_pct?: number;
}

interface LeaderEntry { rank: number; name: string; points: number; avatar: string; badge: string | null }

const DIFF_COLORS: Record<string, string> = { Beginner: G, Intermediate: "#fbbf24", Advanced: "#f87171" };
const CAT_ICONS: Record<string, string> = { Strength: "zap", Cardio: "activity", Nutrition: "coffee", Flexibility: "sun", Wellness: "heart", HIIT: "flame" };

export default function ChallengesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [tab, setTab] = useState<Tab>("Active");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);

  async function load(isRefresh = false) {
    try {
      if (!isRefresh) setLoading(true);
      const [chRes, lbRes] = await Promise.allSettled([
        api.get<{ challenges: Challenge[] }>("/api/challenges"),
        api.get<{ leaderboard: LeaderEntry[]; user_rank: number }>("/api/challenges/leaderboard/global"),
      ]);
      if (chRes.status === "fulfilled") setChallenges(chRes.value.challenges ?? []);
      if (lbRes.status === "fulfilled") {
        setLeaderboard(lbRes.value.leaderboard ?? []);
        setUserRank(lbRes.value.user_rank ?? 0);
      }
    } catch {
      setChallenges([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function joinChallenge(id: string) {
    setJoining(id);
    try {
      await api.post<{ challenge: Challenge }>(`/api/challenges/${id}/join`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setChallenges(prev => prev.map(c => c.id === id ? { ...c, status: "joined", participants: c.participants + 1 } : c));
    } catch {
      Alert.alert("Error", "Could not join challenge.");
    } finally {
      setJoining(null);
    }
  }

  const active = challenges.filter(c => c.is_active && c.status !== "completed");
  const mine = challenges.filter(c => c.status === "joined" || c.status === "completed");

  const displayed = tab === "Active" ? active : tab === "My Challenges" ? mine : [];

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        contentContainerStyle={[s.container, { paddingTop: topPad + 16, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={G} />}
      >
        {/* Header */}
        <View style={s.header}>
          <Pressable style={s.back} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Challenges</Text>
            <Text style={s.sub}>Compete. Win. Level up.</Text>
          </View>
          <View style={s.rankBadge}>
            <Feather name="award" size={12} color="#fbbf24" />
            <Text style={s.rankText}>#{userRank > 0 ? userRank : "—"}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={s.tabs}>
          {(["Active", "My Challenges", "Leaderboard"] as Tab[]).map(t => (
            <Pressable
              key={t}
              style={[s.tabBtn, tab === t && s.tabBtnActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTab(t); }}
            >
              <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <View style={s.loadingWrap}><ActivityIndicator color={G} /></View>
        ) : tab === "Leaderboard" ? (
          <View style={s.lbCard}>
            {userRank > 0 && (
              <View style={s.yourRank}>
                <Text style={s.yourRankLabel}>Your Rank</Text>
                <Text style={s.yourRankNum}>#{userRank}</Text>
              </View>
            )}
            {leaderboard.map((entry, i) => (
              <View key={entry.rank} style={[s.lbRow, i < leaderboard.length - 1 && { borderBottomWidth: 1, borderBottomColor: "#111" }]}>
                <View style={[s.lbRankWrap, entry.rank <= 3 && { backgroundColor: ["#fbbf2420", "#9ca3af20", "#b45309"][entry.rank - 1] }]}>
                  <Text style={[s.lbRankNum, entry.rank === 1 && { color: "#fbbf24" }, entry.rank === 2 && { color: "#9ca3af" }, entry.rank === 3 && { color: "#b45309" }]}>
                    {entry.badge ?? `#${entry.rank}`}
                  </Text>
                </View>
                <View style={s.lbAvatar}>
                  <Text style={s.lbAvatarText}>{entry.avatar}</Text>
                </View>
                <Text style={s.lbName}>{entry.name}</Text>
                <Text style={s.lbPoints}>{entry.points.toLocaleString()} pts</Text>
              </View>
            ))}
          </View>
        ) : displayed.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>🏆</Text>
            <Text style={s.emptyTitle}>{tab === "My Challenges" ? "No active challenges" : "No challenges available"}</Text>
            <Text style={s.emptyText}>{tab === "My Challenges" ? "Join a challenge from the Active tab" : "Check back soon for new challenges"}</Text>
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            {displayed.map(ch => (
              <View key={ch.id} style={[s.card, ch.status === "completed" && { borderColor: G + "40" }]}>
                <View style={s.cardTop}>
                  <View style={s.cardBadge}>
                    <Text style={s.cardBadgeEmoji}>{ch.badge}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={s.cardTagRow}>
                      <View style={[s.diffTag, { backgroundColor: (DIFF_COLORS[ch.difficulty] ?? G) + "20" }]}>
                        <Text style={[s.diffText, { color: DIFF_COLORS[ch.difficulty] ?? G }]}>{ch.difficulty}</Text>
                      </View>
                      <View style={s.catTag}>
                        <Feather name={(CAT_ICONS[ch.category] ?? "star") as never} size={10} color="#6b7280" />
                        <Text style={s.catText}>{ch.category}</Text>
                      </View>
                    </View>
                    <Text style={s.cardTitle}>{ch.title}</Text>
                  </View>
                  {ch.status === "completed" && (
                    <View style={s.completedBadge}>
                      <Feather name="check-circle" size={18} color={G} />
                    </View>
                  )}
                </View>

                <Text style={s.cardDesc} numberOfLines={2}>{ch.description}</Text>

                <View style={s.cardStats}>
                  <View style={s.cardStat}>
                    <Feather name="clock" size={11} color="#6b7280" />
                    <Text style={s.cardStatText}>{ch.duration_days} days</Text>
                  </View>
                  <View style={s.cardStat}>
                    <Feather name="users" size={11} color="#6b7280" />
                    <Text style={s.cardStatText}>{ch.participants.toLocaleString()}</Text>
                  </View>
                  <View style={s.cardStat}>
                    <Feather name="star" size={11} color="#fbbf24" />
                    <Text style={[s.cardStatText, { color: "#fbbf24" }]}>+{ch.points_reward} pts</Text>
                  </View>
                </View>

                {(ch.status === "joined" || ch.status === "completed") && ch.progress_pct !== undefined && (
                  <View style={s.progressWrap}>
                    <View style={s.progressRow}>
                      <Text style={s.progressLabel}>Progress</Text>
                      <Text style={s.progressPct}>{ch.progress_pct}%</Text>
                    </View>
                    <View style={s.progressBar}>
                      <View style={[s.progressFill, { width: `${ch.progress_pct}%` as `${number}%`, backgroundColor: ch.status === "completed" ? G : "#fbbf24" }]} />
                    </View>
                  </View>
                )}

                {ch.status === "not_joined" && (
                  <Pressable
                    style={({ pressed }) => [s.joinBtn, pressed && { opacity: 0.85 }, joining === ch.id && { opacity: 0.7 }]}
                    onPress={() => joinChallenge(ch.id)}
                    disabled={joining === ch.id}
                  >
                    {joining === ch.id
                      ? <ActivityIndicator size="small" color="#000" />
                      : <Text style={s.joinBtnText}>Join Challenge</Text>}
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 14 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: CARD, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: BORDER },
  title: { fontSize: 20, fontWeight: "800", color: "#fff" },
  sub: { fontSize: 12, color: "#6b7280" },
  rankBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#1a1200", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "#fbbf2420" },
  rankText: { fontSize: 12, fontWeight: "700", color: "#fbbf24" },
  tabs: { flexDirection: "row", backgroundColor: CARD, borderRadius: 12, padding: 3, borderWidth: 1, borderColor: BORDER },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
  tabBtnActive: { backgroundColor: G },
  tabText: { fontSize: 12, color: "#6b7280", fontWeight: "600" },
  tabTextActive: { color: "#000", fontWeight: "700" },
  loadingWrap: { paddingTop: 60, alignItems: "center" },
  lbCard: { backgroundColor: CARD, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: BORDER },
  yourRank: { backgroundColor: G + "15", borderBottomWidth: 1, borderBottomColor: G + "30", paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  yourRankLabel: { fontSize: 12, color: "#9ca3af" },
  yourRankNum: { fontSize: 16, fontWeight: "800", color: G },
  lbRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  lbRankWrap: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  lbRankNum: { fontSize: 14, fontWeight: "800", color: "#9ca3af" },
  lbAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: G + "20", alignItems: "center", justifyContent: "center" },
  lbAvatarText: { fontSize: 15, fontWeight: "700", color: G },
  lbName: { flex: 1, fontSize: 14, fontWeight: "600", color: "#fff" },
  lbPoints: { fontSize: 13, fontWeight: "700", color: "#fbbf24" },
  empty: { alignItems: "center", gap: 12, paddingTop: 60 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#fff" },
  emptyText: { fontSize: 13, color: "#6b7280", textAlign: "center" },
  card: { backgroundColor: CARD, borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: BORDER },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  cardBadge: { width: 48, height: 48, borderRadius: 14, backgroundColor: BORDER, alignItems: "center", justifyContent: "center" },
  cardBadgeEmoji: { fontSize: 24 },
  cardTagRow: { flexDirection: "row", gap: 6, marginBottom: 4 },
  diffTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  diffText: { fontSize: 10, fontWeight: "700" },
  catTag: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: BORDER, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  catText: { fontSize: 10, color: "#6b7280" },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#fff" },
  completedBadge: { marginTop: 2 },
  cardDesc: { fontSize: 12, color: "#9ca3af", lineHeight: 18 },
  cardStats: { flexDirection: "row", gap: 16 },
  cardStat: { flexDirection: "row", alignItems: "center", gap: 5 },
  cardStatText: { fontSize: 11, color: "#6b7280" },
  progressWrap: { gap: 6 },
  progressRow: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 11, color: "#6b7280" },
  progressPct: { fontSize: 11, fontWeight: "700", color: "#fff" },
  progressBar: { height: 6, backgroundColor: BORDER, borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3 },
  joinBtn: { backgroundColor: G, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  joinBtnText: { fontSize: 14, fontWeight: "700", color: "#000" },
});
