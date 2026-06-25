import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

const ACHIEVEMENTS = [
  { id: "1", name: "First Workout", icon: "zap" as const, color: "#22C55E", earned: true },
  { id: "2", name: "Week Streak", icon: "activity" as const, color: "#3B82F6", earned: true },
  { id: "3", name: "Calorie Crusher", icon: "target" as const, color: "#EF4444", earned: true },
  { id: "4", name: "Hydration Hero", icon: "droplet" as const, color: "#06B6D4", earned: false },
  { id: "5", name: "Nutrition Pro", icon: "coffee" as const, color: "#F97316", earned: false },
  { id: "6", name: "30 Day Warrior", icon: "award" as const, color: "#8B5CF6", earned: false },
];

const SETTINGS = [
  { id: "goal", label: "Fitness Goal", value: "Build Muscle", icon: "target" as const },
  { id: "level", label: "Fitness Level", value: "Intermediate", icon: "trending-up" as const },
  { id: "notifications", label: "Notifications", value: "On", icon: "bell" as const },
  { id: "units", label: "Units", value: "Metric (kg/cm)", icon: "sliders" as const },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [planType] = useState("PRIME");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function handleLogout() {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out", style: "destructive", onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await logout();
        }
      },
    ]);
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.container, { paddingTop: topPad + 16, paddingBottom: (Platform.OS === "web" ? 34 : 0) + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? "U"}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name ?? "User"}</Text>
          <Text style={styles.profileEmail}>{user?.email ?? ""}</Text>
          <View style={styles.planBadge}>
            <Feather name="zap" size={10} color="#F59E0B" />
            <Text style={styles.planBadgeText}>{planType} Member</Text>
          </View>
        </View>
        <Pressable style={styles.editBtn}>
          <Feather name="edit-2" size={16} color="#6B7280" />
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: "Workouts", value: "24" },
          { label: "Streak", value: "7d" },
          { label: "Points", value: "3.4K" },
        ].map(s => (
          <View key={s.label} style={styles.statItem}>
            <Text style={styles.statVal}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Body Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Body Stats</Text>
        <View style={styles.bodyGrid}>
          {[
            { label: "Weight", value: "72 kg" },
            { label: "Height", value: "175 cm" },
            { label: "BMI", value: "23.5" },
            { label: "Body Fat", value: "18%" },
          ].map(b => (
            <View key={b.label} style={styles.bodyCard}>
              <Text style={styles.bodyVal}>{b.value}</Text>
              <Text style={styles.bodyLabel}>{b.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <Text style={styles.achieveCount}>{ACHIEVEMENTS.filter(a => a.earned).length}/{ACHIEVEMENTS.length}</Text>
        </View>
        <View style={styles.achieveGrid}>
          {ACHIEVEMENTS.map(a => (
            <View key={a.id} style={[styles.achieveItem, !a.earned && styles.achieveItemLocked]}>
              <View style={[styles.achieveIcon, { backgroundColor: a.earned ? a.color + "20" : "#1A1A1A" }]}>
                <Feather name={a.icon} size={20} color={a.earned ? a.color : "#3F3F3F"} />
              </View>
              <Text style={[styles.achieveName, !a.earned && { color: "#3F3F3F" }]} numberOfLines={2}>
                {a.name}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsCard}>
          {SETTINGS.map((s, i) => (
            <Pressable
              key={s.id}
              style={[styles.settingRow, i < SETTINGS.length - 1 && styles.settingRowBorder]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={styles.settingLeft}>
                <Feather name={s.icon} size={16} color="#6B7280" />
                <Text style={styles.settingLabel}>{s.label}</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>{s.value}</Text>
                <Feather name="chevron-right" size={14} color="#3F3F3F" />
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Upgrade Banner */}
      <View style={styles.upgradeBanner}>
        <View style={styles.upgradeLeft}>
          <Feather name="zap" size={20} color="#F59E0B" />
          <View>
            <Text style={styles.upgradeTitle}>Upgrade to PRIME</Text>
            <Text style={styles.upgradeSub}>Unlock AI coaching & advanced analytics</Text>
          </View>
        </View>
        <Pressable style={styles.upgradeBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
          <Text style={styles.upgradeBtnText}>Upgrade</Text>
        </Pressable>
      </View>

      {/* Logout */}
      <Pressable
        style={styles.logoutBtn}
        onPress={handleLogout}
      >
        <Feather name="log-out" size={18} color="#EF4444" />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#0A0A0A" },
  container: { paddingHorizontal: 20, gap: 20 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#141414",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#262626",
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 26, fontWeight: "800" as const, color: "#000" },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 18, fontWeight: "700" as const, color: "#FFF" },
  profileEmail: { fontSize: 13, color: "#6B7280" },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F59E0B15",
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  planBadgeText: { fontSize: 10, color: "#F59E0B", fontWeight: "700" as const },
  editBtn: { padding: 8 },

  statsRow: {
    flexDirection: "row",
    backgroundColor: "#141414",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#262626",
    overflow: "hidden",
  },
  statItem: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#262626",
  },
  statVal: { fontSize: 20, fontWeight: "800" as const, color: "#22C55E" },
  statLabel: { fontSize: 11, color: "#6B7280", marginTop: 2 },

  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const, color: "#FFF" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  achieveCount: { fontSize: 13, color: "#22C55E" },

  bodyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  bodyCard: {
    flex: 1,
    minWidth: "44%",
    backgroundColor: "#141414",
    borderRadius: 12,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: "#262626",
  },
  bodyVal: { fontSize: 18, fontWeight: "700" as const, color: "#22C55E" },
  bodyLabel: { fontSize: 12, color: "#6B7280" },

  achieveGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  achieveItem: {
    width: "30%",
    alignItems: "center",
    gap: 6,
  },
  achieveItemLocked: { opacity: 0.5 },
  achieveIcon: {
    width: 54,
    height: 54,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  achieveName: { fontSize: 10, color: "#D1D5DB", textAlign: "center", lineHeight: 13 },

  settingsCard: {
    backgroundColor: "#141414",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#262626",
    overflow: "hidden",
  },
  settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: "#1F1F1F" },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingLabel: { fontSize: 14, color: "#FFF" },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  settingValue: { fontSize: 13, color: "#6B7280" },

  upgradeBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1A130A",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F59E0B20",
  },
  upgradeLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  upgradeTitle: { fontSize: 14, fontWeight: "700" as const, color: "#FFF" },
  upgradeSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  upgradeBtn: {
    backgroundColor: "#F59E0B",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  upgradeBtnText: { fontSize: 13, fontWeight: "700" as const, color: "#000" },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EF444415",
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#EF444420",
  },
  logoutText: { fontSize: 15, color: "#EF4444", fontWeight: "600" as const },
});
