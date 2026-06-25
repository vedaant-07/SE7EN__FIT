import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CHALLENGES = [
  {
    id: "1", name: "30-Day Plank Challenge", category: "Strength",
    progress: 0.7, days: 21, totalDays: 30, reward: 500, icon: "target" as const, color: "#22C55E", joined: true,
    desc: "Hold a plank for increasing durations over 30 days",
  },
  {
    id: "2", name: "10K Steps Daily", category: "Cardio",
    progress: 0.9, days: 6, totalDays: 7, reward: 200, icon: "activity" as const, color: "#3B82F6", joined: true,
    desc: "Walk at least 10,000 steps every day for a week",
  },
  {
    id: "3", name: "Clean Eating Week", category: "Nutrition",
    progress: 0.4, days: 3, totalDays: 7, reward: 350, icon: "coffee" as const, color: "#F97316", joined: true,
    desc: "No junk food for 7 consecutive days",
  },
  {
    id: "4", name: "HIIT Master", category: "HIIT",
    progress: 0, days: 0, totalDays: 14, reward: 800, icon: "zap" as const, color: "#EF4444", joined: false,
    desc: "Complete 14 HIIT sessions in 14 days",
  },
  {
    id: "5", name: "Hydration Hero", category: "Wellness",
    progress: 0, days: 0, totalDays: 21, reward: 300, icon: "droplet" as const, color: "#06B6D4", joined: false,
    desc: "Drink 3L of water every day for 3 weeks",
  },
];

const LEADERBOARD = [
  { rank: 1, name: "Arjun S.", pts: 4820, avatar: "A" },
  { rank: 2, name: "Priya R.", pts: 4210, avatar: "P" },
  { rank: 3, name: "Rahul K.", pts: 3980, avatar: "R" },
  { rank: 4, name: "You", pts: 3450, avatar: "Y", isMe: true },
  { rank: 5, name: "Sneha M.", pts: 3200, avatar: "S" },
];

const REWARDS = [
  { id: "1", name: "Workout Beast", pts: 500, icon: "award" as const, earned: true },
  { id: "2", name: "Consistency King", pts: 1000, icon: "star" as const, earned: true },
  { id: "3", name: "Nutrition Ninja", pts: 750, icon: "zap" as const, earned: false },
];

export default function ChallengesScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"active" | "leaderboard" | "rewards">("active");
  const [joined, setJoined] = useState(new Set(CHALLENGES.filter(c => c.joined).map(c => c.id)));

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function join(id: string) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setJoined(prev => new Set([...prev, id]));
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={styles.title}>Challenges</Text>
        <View style={styles.pointsBadge}>
          <Feather name="star" size={12} color="#F59E0B" />
          <Text style={styles.pointsText}>3,450 pts</Text>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        {(["active", "leaderboard", "rewards"] as const).map(t => (
          <Pressable
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: (Platform.OS === "web" ? 34 : 0) + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {tab === "active" && CHALLENGES.map(c => (
          <View key={c.id} style={styles.challengeCard}>
            <View style={styles.challengeTop}>
              <View style={[styles.challengeIcon, { backgroundColor: c.color + "20" }]}>
                <Feather name={c.icon} size={22} color={c.color} />
              </View>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeName}>{c.name}</Text>
                <Text style={styles.challengeDesc}>{c.desc}</Text>
              </View>
              <View style={[styles.rewardBadge, { backgroundColor: "#F59E0B15" }]}>
                <Feather name="star" size={10} color="#F59E0B" />
                <Text style={styles.rewardText}>{c.reward}</Text>
              </View>
            </View>
            {joined.has(c.id) ? (
              <>
                <View style={styles.progressRow}>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { backgroundColor: c.color, width: `${c.progress * 100}%` }]} />
                  </View>
                  <Text style={styles.progressPct}>{Math.round(c.progress * 100)}%</Text>
                </View>
                <Text style={styles.daysText}>Day {c.days} of {c.totalDays}</Text>
              </>
            ) : (
              <Pressable
                style={[styles.joinBtn, { backgroundColor: c.color }]}
                onPress={() => join(c.id)}
              >
                <Text style={styles.joinBtnText}>Join Challenge</Text>
              </Pressable>
            )}
          </View>
        ))}

        {tab === "leaderboard" && (
          <View style={styles.leaderboard}>
            {LEADERBOARD.map(item => (
              <View key={item.rank} style={[styles.lbRow, item.isMe && styles.lbRowMe]}>
                <Text style={[styles.lbRank, item.rank <= 3 && { color: "#F59E0B" }]}>#{item.rank}</Text>
                <View style={[styles.lbAvatar, item.isMe && { backgroundColor: "#22C55E" }]}>
                  <Text style={styles.lbAvatarText}>{item.avatar}</Text>
                </View>
                <Text style={[styles.lbName, item.isMe && { color: "#22C55E" }]}>{item.name}</Text>
                <View style={styles.lbPtsBadge}>
                  <Feather name="star" size={10} color="#F59E0B" />
                  <Text style={styles.lbPts}>{item.pts.toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {tab === "rewards" && REWARDS.map(r => (
          <View key={r.id} style={[styles.rewardCard, !r.earned && styles.rewardCardLocked]}>
            <View style={[styles.rewardIcon, { backgroundColor: r.earned ? "#22C55E20" : "#1A1A1A" }]}>
              <Feather name={r.icon} size={24} color={r.earned ? "#22C55E" : "#3F3F3F"} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.rewardName, !r.earned && { color: "#4B5563" }]}>{r.name}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Feather name="star" size={10} color="#F59E0B" />
                <Text style={styles.rewardPts}>{r.pts} pts</Text>
              </View>
            </View>
            {r.earned ? (
              <View style={styles.earnedBadge}>
                <Feather name="check" size={12} color="#22C55E" />
                <Text style={styles.earnedText}>Earned</Text>
              </View>
            ) : (
              <View style={styles.lockedBadge}>
                <Feather name="lock" size={12} color="#6B7280" />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: { fontSize: 26, fontWeight: "800" as const, color: "#FFF" },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F59E0B15",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pointsText: { fontSize: 13, color: "#F59E0B", fontWeight: "700" as const },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#141414",
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 9 },
  tabBtnActive: { backgroundColor: "#22C55E" },
  tabBtnText: { fontSize: 13, color: "#6B7280", fontWeight: "600" as const },
  tabBtnTextActive: { color: "#000" },
  list: { paddingHorizontal: 20, gap: 12 },
  challengeCard: {
    backgroundColor: "#141414",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#262626",
  },
  challengeTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  challengeIcon: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  challengeInfo: { flex: 1, gap: 3 },
  challengeName: { fontSize: 14, fontWeight: "700" as const, color: "#FFF" },
  challengeDesc: { fontSize: 12, color: "#6B7280", lineHeight: 17 },
  rewardBadge: { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3 },
  rewardText: { fontSize: 11, color: "#F59E0B", fontWeight: "700" as const },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressBg: { flex: 1, height: 6, backgroundColor: "#262626", borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3 },
  progressPct: { fontSize: 12, color: "#9CA3AF", width: 32, textAlign: "right" },
  daysText: { fontSize: 11, color: "#6B7280" },
  joinBtn: { borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  joinBtnText: { fontSize: 14, fontWeight: "700" as const, color: "#000" },

  leaderboard: { gap: 10 },
  lbRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#141414",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#262626",
  },
  lbRowMe: { borderColor: "#22C55E30", backgroundColor: "#0F1F0F" },
  lbRank: { fontSize: 15, fontWeight: "800" as const, color: "#6B7280", width: 28 },
  lbAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#262626",
    alignItems: "center",
    justifyContent: "center",
  },
  lbAvatarText: { fontSize: 15, fontWeight: "700" as const, color: "#FFF" },
  lbName: { flex: 1, fontSize: 14, fontWeight: "600" as const, color: "#FFF" },
  lbPtsBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  lbPts: { fontSize: 14, fontWeight: "700" as const, color: "#F59E0B" },

  rewardCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141414",
    borderRadius: 14,
    padding: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: "#262626",
  },
  rewardCardLocked: { opacity: 0.6 },
  rewardIcon: { width: 48, height: 48, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  rewardName: { fontSize: 14, fontWeight: "700" as const, color: "#FFF" },
  rewardPts: { fontSize: 12, color: "#F59E0B" },
  earnedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#22C55E20",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  earnedText: { fontSize: 11, color: "#22C55E", fontWeight: "700" as const },
  lockedBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
});
