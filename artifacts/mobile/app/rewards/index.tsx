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

type Tab = "Overview" | "Badges" | "Store" | "History";

const LEVEL_COLORS: Record<string, string> = { Bronze: "#b45309", Silver: "#9ca3af", Gold: "#fbbf24", Platinum: "#a78bfa", Diamond: "#38bdf8" };

interface Badge { id: string; name: string; description: string; icon: string; earned: boolean; earned_at?: string; progress?: number; target?: number; category: string }
interface Reward { id: string; title: string; description: string; cost: number; category: string; available: boolean; icon: string }
interface HistoryItem { id: string; type: string; description: string; points: number; date: string }

interface RewardsData {
  points: number; level: string; level_progress: number; next_level: string; points_to_next_level: number;
  badges: { earned: Badge[]; in_progress: Badge[] };
  available_rewards: Reward[];
  history: HistoryItem[];
}

export default function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [tab, setTab] = useState<Tab>("Overview");
  const [data, setData] = useState<RewardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  async function load(isRefresh = false) {
    try {
      if (!isRefresh) setLoading(true);
      const res = await api.get<RewardsData>("/api/rewards");
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function redeemReward(id: string, title: string, cost: number) {
    Alert.alert("Redeem Reward", `Use ${cost} points for "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Redeem", style: "default",
        onPress: async () => {
          setRedeeming(id);
          try {
            await api.post(`/api/rewards/${id}/claim`);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("✅ Redeemed!", `You've successfully redeemed "${title}". Check your email for details.`);
            load();
          } catch {
            Alert.alert("Error", "Could not redeem reward. Please try again.");
          } finally {
            setRedeeming(null);
          }
        },
      },
    ]);
  }

  const levelColor = LEVEL_COLORS[data?.level ?? "Gold"] ?? "#fbbf24";

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
            <Text style={s.title}>Rewards</Text>
            <Text style={s.sub}>Earn points. Unlock rewards.</Text>
          </View>
          <View style={[s.levelBadge, { backgroundColor: levelColor + "20", borderColor: levelColor + "40" }]}>
            <Text style={[s.levelText, { color: levelColor }]}>⭐ {data?.level ?? "Gold"}</Text>
          </View>
        </View>

        {loading ? (
          <View style={s.loadingWrap}><ActivityIndicator color={G} /></View>
        ) : !data ? (
          <View style={s.empty}><Text style={s.emptyText}>Could not load rewards. Pull to refresh.</Text></View>
        ) : (
          <>
            {/* Points Card */}
            <View style={s.pointsCard}>
              <View style={s.pointsLeft}>
                <Text style={s.pointsNum}>{data.points.toLocaleString()}</Text>
                <Text style={s.pointsLabel}>Total Points</Text>
              </View>
              <View style={s.pointsRight}>
                <View style={s.pointsProgress}>
                  <Text style={s.progressLabel}>{data.level} → {data.next_level}</Text>
                  <View style={s.progressBar}>
                    <View style={[s.progressFill, { width: `${data.level_progress}%` as `${number}%`, backgroundColor: levelColor }]} />
                  </View>
                  <Text style={s.progressSub}>{data.points_to_next_level} pts to {data.next_level}</Text>
                </View>
              </View>
            </View>

            {/* Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabs}>
              {(["Overview", "Badges", "Store", "History"] as Tab[]).map(t => (
                <Pressable
                  key={t}
                  style={[s.tab, tab === t && s.tabActive]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTab(t); }}
                >
                  <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Overview */}
            {tab === "Overview" && (
              <>
                <Text style={s.sectionTitle}>Earned Badges ({data.badges.earned.length})</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.badgesRow}>
                  {data.badges.earned.map(b => (
                    <View key={b.id} style={s.badgeCard}>
                      <Text style={s.badgeEmoji}>{b.icon}</Text>
                      <Text style={s.badgeName} numberOfLines={2}>{b.name}</Text>
                    </View>
                  ))}
                </ScrollView>

                <Text style={s.sectionTitle}>In Progress</Text>
                {data.badges.in_progress.slice(0, 4).map(b => (
                  <View key={b.id} style={s.ipRow}>
                    <Text style={s.ipEmoji}>{b.icon}</Text>
                    <View style={{ flex: 1, gap: 4 }}>
                      <View style={s.ipHeader}>
                        <Text style={s.ipName}>{b.name}</Text>
                        {b.progress !== undefined && b.target && <Text style={s.ipCount}>{b.progress}/{b.target}</Text>}
                      </View>
                      {b.progress !== undefined && b.target && (
                        <View style={s.ipBar}>
                          <View style={[s.ipFill, { width: `${Math.min((b.progress / b.target) * 100, 100)}%` as `${number}%` }]} />
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* Badges */}
            {tab === "Badges" && (
              <View style={s.badgesGrid}>
                {[...data.badges.earned, ...data.badges.in_progress].map(b => (
                  <View key={b.id} style={[s.badgeGridCard, !b.earned && { opacity: 0.5 }]}>
                    <Text style={s.badgeGridEmoji}>{b.icon}</Text>
                    <Text style={s.badgeGridName} numberOfLines={2}>{b.name}</Text>
                    <View style={[s.badgeGridCat, { backgroundColor: b.earned ? G + "20" : BORDER }]}>
                      <Text style={[s.badgeGridCatText, { color: b.earned ? G : "#4b5563" }]}>{b.category}</Text>
                    </View>
                    {b.earned && <View style={s.earnedDot}><Feather name="check" size={8} color="#000" /></View>}
                  </View>
                ))}
              </View>
            )}

            {/* Store */}
            {tab === "Store" && (
              <View style={{ gap: 12 }}>
                <View style={s.pointsInfo}>
                  <Feather name="star" size={14} color="#fbbf24" />
                  <Text style={s.pointsInfoText}>You have <Text style={{ color: "#fbbf24", fontWeight: "700" }}>{data.points.toLocaleString()}</Text> points to spend</Text>
                </View>
                {data.available_rewards.map(r => (
                  <View key={r.id} style={[s.rewardCard, !r.available && { opacity: 0.5 }]}>
                    <Text style={s.rewardEmoji}>{r.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.rewardTitle}>{r.title}</Text>
                      <Text style={s.rewardDesc}>{r.description}</Text>
                      <Text style={s.rewardCost}>{r.cost} pts</Text>
                    </View>
                    <Pressable
                      style={[s.redeemBtn, (data.points < r.cost || !r.available) && s.redeemBtnDisabled]}
                      onPress={() => r.available && data.points >= r.cost && redeemReward(r.id, r.title, r.cost)}
                      disabled={data.points < r.cost || !r.available || redeeming === r.id}
                    >
                      {redeeming === r.id
                        ? <ActivityIndicator size="small" color="#000" />
                        : <Text style={s.redeemText}>{!r.available ? "Unavailable" : data.points < r.cost ? "Not enough" : "Redeem"}</Text>}
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* History */}
            {tab === "History" && (
              <View style={s.histList}>
                {data.history.map((h, i) => (
                  <View key={h.id} style={[s.histRow, i < data.history.length - 1 && { borderBottomWidth: 1, borderBottomColor: "#111" }]}>
                    <View style={[s.histIcon, { backgroundColor: h.type === "earned" ? G + "20" : "#f8717120" }]}>
                      <Feather name={h.type === "earned" ? "arrow-up" : "arrow-down"} size={12} color={h.type === "earned" ? G : "#f87171"} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.histDesc}>{h.description}</Text>
                      <Text style={s.histDate}>{h.date}</Text>
                    </View>
                    <Text style={[s.histPoints, { color: h.type === "earned" ? G : "#f87171" }]}>
                      {h.type === "earned" ? "+" : ""}{h.points} pts
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
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
  levelBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1 },
  levelText: { fontSize: 12, fontWeight: "700" },
  loadingWrap: { paddingTop: 60, alignItems: "center" },
  empty: { paddingTop: 60, alignItems: "center" },
  emptyText: { color: "#6b7280", fontSize: 14 },
  pointsCard: { backgroundColor: CARD, borderRadius: 18, padding: 18, flexDirection: "row", alignItems: "center", gap: 20, borderWidth: 1, borderColor: BORDER },
  pointsLeft: { gap: 4 },
  pointsNum: { fontSize: 36, fontWeight: "800", color: "#fbbf24" },
  pointsLabel: { fontSize: 12, color: "#6b7280" },
  pointsRight: { flex: 1 },
  pointsProgress: { gap: 6 },
  progressLabel: { fontSize: 11, color: "#9ca3af" },
  progressBar: { height: 6, backgroundColor: BORDER, borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3 },
  progressSub: { fontSize: 10, color: "#6b7280" },
  tabs: { gap: 8, paddingBottom: 2 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
  tabActive: { backgroundColor: G, borderColor: G },
  tabText: { fontSize: 13, color: "#6b7280", fontWeight: "600" },
  tabTextActive: { color: "#000", fontWeight: "700" },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#fff" },
  badgesRow: { gap: 10, paddingBottom: 4 },
  badgeCard: { alignItems: "center", gap: 6, backgroundColor: CARD, borderRadius: 14, padding: 14, width: 80, borderWidth: 1, borderColor: BORDER },
  badgeEmoji: { fontSize: 28 },
  badgeName: { fontSize: 10, color: "#9ca3af", textAlign: "center" },
  ipRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: CARD, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: BORDER },
  ipEmoji: { fontSize: 22 },
  ipHeader: { flexDirection: "row", justifyContent: "space-between" },
  ipName: { fontSize: 13, fontWeight: "600", color: "#fff" },
  ipCount: { fontSize: 12, color: "#6b7280" },
  ipBar: { height: 4, backgroundColor: BORDER, borderRadius: 2 },
  ipFill: { height: 4, backgroundColor: "#fbbf24", borderRadius: 2 },
  badgesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badgeGridCard: { width: "30%", backgroundColor: CARD, borderRadius: 14, padding: 12, alignItems: "center", gap: 6, borderWidth: 1, borderColor: BORDER, position: "relative" },
  badgeGridEmoji: { fontSize: 26 },
  badgeGridName: { fontSize: 10, color: "#9ca3af", textAlign: "center" },
  badgeGridCat: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  badgeGridCatText: { fontSize: 9, fontWeight: "700" },
  earnedDot: { position: "absolute", top: 6, right: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: G, alignItems: "center", justifyContent: "center" },
  pointsInfo: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "#1a1200", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#fbbf2420" },
  pointsInfoText: { fontSize: 12, color: "#9ca3af" },
  rewardCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: CARD, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: BORDER },
  rewardEmoji: { fontSize: 28 },
  rewardTitle: { fontSize: 14, fontWeight: "700", color: "#fff" },
  rewardDesc: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  rewardCost: { fontSize: 12, fontWeight: "700", color: "#fbbf24", marginTop: 4 },
  redeemBtn: { backgroundColor: G, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  redeemBtnDisabled: { backgroundColor: BORDER },
  redeemText: { fontSize: 12, fontWeight: "700", color: "#000" },
  histList: { backgroundColor: CARD, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: BORDER },
  histRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  histIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  histDesc: { fontSize: 13, fontWeight: "500", color: "#fff" },
  histDate: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  histPoints: { fontSize: 14, fontWeight: "700" },
});
