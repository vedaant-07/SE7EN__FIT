import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

const METRICS = [
  { label: "Total Members", value: "248", change: "+12", icon: "users" as const, color: "#22C55E" },
  { label: "Active Today", value: "87", change: "+5", icon: "activity" as const, color: "#3B82F6" },
  { label: "New Leads", value: "34", change: "+8", icon: "user-plus" as const, color: "#F97316" },
  { label: "Revenue", value: "₹1.2L", change: "+18%", icon: "trending-up" as const, color: "#8B5CF6" },
];

const RECENT_MEMBERS = [
  { id: "1", name: "Arjun Sharma", plan: "6-Month", status: "active", joined: "2d ago" },
  { id: "2", name: "Priya Verma", plan: "Annual", status: "active", joined: "5d ago" },
  { id: "3", name: "Rohan Singh", plan: "Monthly", status: "pending", joined: "1w ago" },
  { id: "4", name: "Neha Joshi", plan: "3-Month", status: "active", joined: "1w ago" },
];

const QUICK_ACTIONS = [
  { id: "add", label: "Add Member", icon: "user-plus" as const, color: "#22C55E" },
  { id: "message", label: "Broadcast", icon: "message-circle" as const, color: "#3B82F6" },
  { id: "report", label: "Reports", icon: "file-text" as const, color: "#8B5CF6" },
  { id: "schedule", label: "Schedule", icon: "calendar" as const, color: "#F97316" },
];

export default function GymDashboard() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.container, { paddingTop: topPad + 16, paddingBottom: (Platform.OS === "web" ? 34 : 0) + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.name ?? "Gym Owner"}</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.notifBtn}>
            <Feather name="bell" size={20} color="#FFF" />
            <View style={styles.notifDot} />
          </Pressable>
          <Pressable style={styles.logoutIconBtn} onPress={() => logout()}>
            <Feather name="log-out" size={18} color="#6B7280" />
          </Pressable>
        </View>
      </View>

      {/* Gym Name Badge */}
      <View style={styles.gymBadge}>
        <Feather name="home" size={14} color="#22C55E" />
        <Text style={styles.gymBadgeText}>SE7ENFIT Prime Gym — Mumbai</Text>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        {METRICS.map(m => (
          <View key={m.label} style={styles.metricCard}>
            <View style={styles.metricTop}>
              <View style={[styles.metricIcon, { backgroundColor: m.color + "20" }]}>
                <Feather name={m.icon} size={16} color={m.color} />
              </View>
              <View style={[styles.changeTag, { backgroundColor: "#22C55E15" }]}>
                <Feather name="arrow-up-right" size={10} color="#22C55E" />
                <Text style={styles.changeText}>{m.change}</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>{m.value}</Text>
            <Text style={styles.metricLabel}>{m.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.qaGrid}>
          {QUICK_ACTIONS.map(a => (
            <Pressable
              key={a.id}
              style={({ pressed }) => [styles.qaCard, pressed && { opacity: 0.8 }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={[styles.qaIcon, { backgroundColor: a.color + "20" }]}>
                <Feather name={a.icon} size={20} color={a.color} />
              </View>
              <Text style={styles.qaLabel}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Recent Members */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Members</Text>
          <Pressable>
            <Text style={styles.seeAll}>View All</Text>
          </Pressable>
        </View>
        <View style={styles.membersCard}>
          {RECENT_MEMBERS.map((m, i) => (
            <Pressable
              key={m.id}
              style={[styles.memberRow, i < RECENT_MEMBERS.length - 1 && styles.memberRowBorder]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>{m.name[0]}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{m.name}</Text>
                <Text style={styles.memberPlan}>{m.plan} · {m.joined}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: m.status === "active" ? "#22C55E15" : "#F9731615" }]}>
                <Text style={[styles.statusText, { color: m.status === "active" ? "#22C55E" : "#F97316" }]}>
                  {m.status}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Revenue Chart placeholder */}
      <View style={styles.revenueCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Monthly Revenue</Text>
          <Text style={styles.revenueTotal}>₹1,24,500</Text>
        </View>
        <View style={styles.chartArea}>
          {[40, 65, 52, 80, 72, 90, 68].map((h, i) => (
            <View key={i} style={styles.bar}>
              <View style={[styles.barFill, { height: `${h}%` }]} />
              <Text style={styles.barLabel}>{["M", "T", "W", "T", "F", "S", "S"][i]}</Text>
            </View>
          ))}
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
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#141414", alignItems: "center", justifyContent: "center", position: "relative" },
  notifDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444", position: "absolute", top: 8, right: 8 },
  logoutIconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#141414", alignItems: "center", justifyContent: "center" },

  gymBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0F1F0F",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#22C55E20",
  },
  gymBadgeText: { fontSize: 13, color: "#9CA3AF" },

  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  metricCard: {
    flex: 1,
    minWidth: "44%",
    backgroundColor: "#141414",
    borderRadius: 16,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: "#262626",
  },
  metricTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metricIcon: { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  changeTag: { flexDirection: "row", alignItems: "center", gap: 2, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  changeText: { fontSize: 10, color: "#22C55E", fontWeight: "700" as const },
  metricValue: { fontSize: 22, fontWeight: "800" as const, color: "#FFF" },
  metricLabel: { fontSize: 11, color: "#6B7280" },

  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const, color: "#FFF" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  seeAll: { fontSize: 13, color: "#22C55E" },

  qaGrid: { flexDirection: "row", gap: 10 },
  qaCard: {
    flex: 1,
    backgroundColor: "#141414",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#262626",
  },
  qaIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  qaLabel: { fontSize: 11, color: "#D1D5DB", fontWeight: "600" as const, textAlign: "center" },

  membersCard: { backgroundColor: "#141414", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#262626" },
  memberRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  memberRowBorder: { borderBottomWidth: 1, borderBottomColor: "#1F1F1F" },
  memberAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#22C55E20", alignItems: "center", justifyContent: "center" },
  memberAvatarText: { fontSize: 16, fontWeight: "700" as const, color: "#22C55E" },
  memberInfo: { flex: 1, gap: 2 },
  memberName: { fontSize: 14, fontWeight: "600" as const, color: "#FFF" },
  memberPlan: { fontSize: 12, color: "#6B7280" },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: "700" as const, textTransform: "capitalize" as const },

  revenueCard: { backgroundColor: "#141414", borderRadius: 16, padding: 16, gap: 16, borderWidth: 1, borderColor: "#262626" },
  revenueTotal: { fontSize: 18, fontWeight: "800" as const, color: "#22C55E" },
  chartArea: { flexDirection: "row", alignItems: "flex-end", height: 80, gap: 6 },
  bar: { flex: 1, alignItems: "center", gap: 4, height: "100%" },
  barFill: { width: "100%", backgroundColor: "#22C55E", borderRadius: 4, minHeight: 8 },
  barLabel: { fontSize: 10, color: "#6B7280" },
});
