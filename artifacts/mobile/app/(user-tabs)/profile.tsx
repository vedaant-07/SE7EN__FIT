import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Alert, Platform, Pressable, RefreshControl,
  ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { getProfile } from "@/src/services/userService";
import type { User } from "@/src/types";

const G = "#20c55d";
const BG = "#050505";
const CARD = "#0d0d0d";
const BORDER = "#1e1e1e";

const BADGES = [
  { id: "1", name: "First Workout", icon: "zap" as const, color: G, earned: true },
  { id: "2", name: "Week Streak", icon: "activity" as const, color: "#38bdf8", earned: true },
  { id: "3", name: "Calorie Crusher", icon: "target" as const, color: "#f87171", earned: true },
  { id: "4", name: "Hydration Hero", icon: "droplet" as const, color: "#38bdf8", earned: false },
  { id: "5", name: "Nutrition Pro", icon: "coffee" as const, color: "#fb923c", earned: false },
  { id: "6", name: "30-Day Warrior", icon: "award" as const, color: "#a78bfa", earned: false },
];

const MENU_ITEMS = [
  { id: "subscription", label: "Subscription", icon: "zap" as const, value: "Free", color: "#fbbf24" },
  { id: "referral", label: "Refer & Earn", icon: "gift" as const, value: "Invite Friends", color: G },
  { id: "notifications", label: "Notifications", icon: "bell" as const, value: "", color: "#9ca3af" },
  { id: "health", label: "Connected Health", icon: "heart" as const, value: "Not connected", color: "#f87171" },
  { id: "settings", label: "Settings", icon: "settings" as const, value: "", color: "#9ca3af" },
  { id: "privacy", label: "Privacy Policy", icon: "shield" as const, value: "", color: "#9ca3af" },
  { id: "support", label: "Help & Support", icon: "help-circle" as const, value: "", color: "#9ca3af" },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user: authUser, logout, refreshUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const user = profile ?? authUser;
  const firstName = user?.name?.split(" ")[0] ?? "User";

  async function load(isRefresh = false) {
    try {
      const p = await getProfile();
      setProfile(p);
    } catch {
      // fallback to auth user
    } finally {
      if (isRefresh) setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleLogout() {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out", style: "destructive", onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await logout();
        },
      },
    ]);
  }

  const subStatus = user?.subscription_status ?? "free";
  const isPrime = subStatus === "premium" || subStatus === "gym_connected";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[s.container, { paddingTop: topPad + 16, paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0) }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={G} />
      }
    >
      {/* Profile Card */}
      <View style={s.profileCard}>
        <View style={s.avatarWrap}>
          <Text style={s.avatarText}>{firstName[0]?.toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={s.profileName}>{user?.name ?? "User"}</Text>
          <Text style={s.profileEmail}>{user?.email ?? ""}</Text>
          {user?.phone && <Text style={s.profilePhone}>+91 {user.phone}</Text>}
          <View style={[s.planBadge, isPrime ? s.planBadgePrime : s.planBadgeFree]}>
            <Feather name="zap" size={10} color={isPrime ? "#fbbf24" : "#6b7280"} />
            <Text style={[s.planText, isPrime ? { color: "#fbbf24" } : { color: "#6b7280" }]}>
              {isPrime ? "PRIME Member" : "Free Plan"}
            </Text>
          </View>
        </View>
        <Pressable style={s.editBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <Feather name="edit-2" size={16} color="#9ca3af" />
        </Pressable>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {[
          { label: "Workouts", value: "—" },
          { label: "Streak", value: "—d" },
          { label: "Points", value: "—" },
        ].map((s2, i) => (
          <View key={s2.label} style={[s.statItem, i < 2 && { borderRightWidth: 1, borderRightColor: BORDER }]}>
            <Text style={s.statVal}>{s2.value}</Text>
            <Text style={s.statLbl}>{s2.label}</Text>
          </View>
        ))}
      </View>

      {/* Body Info */}
      {(user?.height || user?.weight || user?.goal) && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Body Stats</Text>
          <View style={s.bodyGrid}>
            {[
              { label: "Weight", value: user?.weight ? `${user.weight} kg` : "—" },
              { label: "Height", value: user?.height ? `${user.height} cm` : "—" },
              { label: "Goal", value: user?.goal ?? "—" },
              { label: "Diet", value: user?.diet_preference ?? "—" },
            ].map(b => (
              <View key={b.label} style={s.bodyCard}>
                <Text style={s.bodyVal}>{b.value}</Text>
                <Text style={s.bodyLbl}>{b.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Badges */}
      <View style={s.section}>
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Badges</Text>
          <Text style={s.badgeCount}>{BADGES.filter(b => b.earned).length}/{BADGES.length} earned</Text>
        </View>
        <View style={s.badgeGrid}>
          {BADGES.map(b => (
            <View key={b.id} style={[s.badgeItem, !b.earned && s.badgeDim]}>
              <View style={[s.badgeIcon, { backgroundColor: b.earned ? b.color + "20" : "#1a1a1a" }]}>
                <Feather name={b.icon} size={20} color={b.earned ? b.color : "#2a2a2a"} />
              </View>
              <Text style={[s.badgeName, !b.earned && { color: "#2a2a2a" }]} numberOfLines={2}>{b.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Referral Code */}
      {user?.referral_code && (
        <View style={s.referralCard}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={s.referralTitle}>Your Referral Code</Text>
            <Text style={s.referralCode}>{user.referral_code}</Text>
            <Text style={s.referralSub}>Invite friends and earn points</Text>
          </View>
          <Pressable style={s.shareBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
            <Feather name="share-2" size={16} color="#000" />
          </Pressable>
        </View>
      )}

      {/* Menu */}
      <View style={s.menuCard}>
        {MENU_ITEMS.map((item, i) => (
          <Pressable
            key={item.id}
            style={[s.menuRow, i < MENU_ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: "#111" }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[s.menuIcon, { backgroundColor: item.color + "15" }]}>
              <Feather name={item.icon} size={16} color={item.color} />
            </View>
            <Text style={s.menuLabel}>{item.label}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              {item.value ? <Text style={s.menuValue}>{item.value}</Text> : null}
              <Feather name="chevron-right" size={14} color="#374151" />
            </View>
          </Pressable>
        ))}
      </View>

      {/* Upgrade */}
      {!isPrime && (
        <View style={s.upgradeCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Feather name="zap" size={18} color="#fbbf24" />
            <Text style={s.upgradeTitle}>Unlock SE7ENFIT PRIME</Text>
          </View>
          <Text style={s.upgradeSub}>Unlimited AI coach, advanced workout plans, food scan & more</Text>
          <Pressable style={s.upgradeBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
            <Text style={s.upgradeBtnText}>Upgrade to PRIME →</Text>
          </Pressable>
        </View>
      )}

      {/* Logout */}
      <Pressable style={s.logoutBtn} onPress={handleLogout}>
        <Feather name="log-out" size={18} color="#f87171" />
        <Text style={s.logoutText}>Log Out</Text>
      </Pressable>

      <Text style={s.versionText}>SE7ENFIT v1.0.0 · Build for India 🇮🇳</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 20 },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: CARD, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: BORDER },
  avatarWrap: { width: 68, height: 68, borderRadius: 34, backgroundColor: G, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 28, fontWeight: "800", color: "#000" },
  profileName: { fontSize: 18, fontWeight: "700", color: "#fff" },
  profileEmail: { fontSize: 12, color: "#6b7280" },
  profilePhone: { fontSize: 12, color: "#6b7280" },
  planBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  planBadgePrime: { backgroundColor: "#fbbf2415" },
  planBadgeFree: { backgroundColor: "#1e1e1e" },
  planText: { fontSize: 10, fontWeight: "700" },
  editBtn: { padding: 8 },
  statsRow: { flexDirection: "row", backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },
  statItem: { flex: 1, paddingVertical: 16, alignItems: "center" },
  statVal: { fontSize: 20, fontWeight: "800", color: G },
  statLbl: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#fff" },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  badgeCount: { fontSize: 13, color: G },
  bodyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  bodyCard: { flex: 1, minWidth: "44%", backgroundColor: CARD, borderRadius: 12, padding: 14, gap: 4, borderWidth: 1, borderColor: BORDER },
  bodyVal: { fontSize: 17, fontWeight: "700", color: G },
  bodyLbl: { fontSize: 12, color: "#6b7280" },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  badgeItem: { width: "30%", alignItems: "center", gap: 6 },
  badgeDim: { opacity: 0.4 },
  badgeIcon: { width: 54, height: 54, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  badgeName: { fontSize: 10, color: "#d1d5db", textAlign: "center", lineHeight: 14 },
  referralCard: { flexDirection: "row", alignItems: "center", backgroundColor: G + "10", borderRadius: 14, padding: 16, gap: 12, borderWidth: 1, borderColor: G + "30" },
  referralTitle: { fontSize: 12, color: "#9ca3af" },
  referralCode: { fontSize: 22, fontWeight: "900", color: G, letterSpacing: 2 },
  referralSub: { fontSize: 11, color: "#6b7280" },
  shareBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: G, alignItems: "center", justifyContent: "center" },
  menuCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },
  menuRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  menuIcon: { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 14, color: "#fff" },
  menuValue: { fontSize: 12, color: "#6b7280" },
  upgradeCard: { backgroundColor: "#1a1200", borderRadius: 16, padding: 18, gap: 10, borderWidth: 1, borderColor: "#fbbf2420" },
  upgradeTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  upgradeSub: { fontSize: 13, color: "#9ca3af", lineHeight: 19 },
  upgradeBtn: { backgroundColor: "#fbbf24", borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  upgradeBtnText: { fontSize: 14, fontWeight: "700", color: "#000" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#f8717115", borderRadius: 12, paddingVertical: 14, borderWidth: 1, borderColor: "#f8717120" },
  logoutText: { fontSize: 15, color: "#f87171", fontWeight: "600" },
  versionText: { textAlign: "center", fontSize: 11, color: "#374151" },
});
