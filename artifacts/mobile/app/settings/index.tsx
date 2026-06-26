import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/src/services/apiClient";

const G = "#20c55d";
const BG = "#050505";
const CARD = "#0d0d0d";
const BORDER = "#1e1e1e";

interface NotifSettings { workout_reminders: boolean; meal_reminders: boolean; challenge_updates: boolean; achievement_alerts: boolean; weekly_report: boolean; marketing: boolean }
interface UnitSettings { weight: string; height: string }

function SettingRow({ icon, label, value, onPress, danger, iconColor }: { icon: string; label: string; value?: string; onPress?: () => void; danger?: boolean; iconColor?: string }) {
  return (
    <Pressable
      style={({ pressed }) => [sr.row, pressed && { opacity: 0.75 }]}
      onPress={onPress}
    >
      <View style={[sr.iconWrap, { backgroundColor: (iconColor ?? "#374151") + "20" }]}>
        <Feather name={icon as never} size={15} color={iconColor ?? "#6b7280"} />
      </View>
      <Text style={[sr.label, danger && sr.labelDanger]}>{label}</Text>
      <View style={sr.right}>
        {value && <Text style={sr.value}>{value}</Text>}
        <Feather name="chevron-right" size={15} color="#374151" />
      </View>
    </Pressable>
  );
}

const sr = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  iconWrap: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  label: { flex: 1, fontSize: 14, color: "#fff", fontWeight: "500" },
  labelDanger: { color: "#f87171" },
  right: { flexDirection: "row", alignItems: "center", gap: 6 },
  value: { fontSize: 12, color: "#6b7280" },
});

function SwitchRow({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <View style={sw.row}>
      <Text style={sw.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#1e1e1e", true: G }}
        thumbColor={value ? "#fff" : "#6b7280"}
        ios_backgroundColor="#1e1e1e"
      />
    </View>
  );
}
const sw = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  label: { fontSize: 14, color: "#fff", fontWeight: "500" },
});

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [notifs, setNotifs] = useState<NotifSettings>({
    workout_reminders: true, meal_reminders: true, challenge_updates: true,
    achievement_alerts: true, weekly_report: true, marketing: false,
  });
  const [units, setUnits] = useState<UnitSettings>({ weight: "kg", height: "cm" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<{ settings: { notifications: NotifSettings; units: UnitSettings } }>("/api/settings")
      .then(res => {
        if (res.settings?.notifications) setNotifs(res.settings.notifications);
        if (res.settings?.units) setUnits(res.settings.units);
      })
      .catch(() => {});
  }, []);

  async function toggleNotif(key: keyof NotifSettings) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = { ...notifs, [key]: !notifs[key] };
    setNotifs(updated);
    try { await api.put("/api/settings/notifications", updated); } catch { /* silent */ }
  }

  function confirmLogout() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => logout() },
    ]);
  }

  function confirmDeleteAccount() {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => Alert.alert("Contact Support", "Please contact support@se7enfit.app to delete your account.") },
      ]
    );
  }

  const ACCOUNT_SECTION = [
    { icon: "user", label: "Edit Profile", iconColor: G, onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) },
    { icon: "star", label: "Subscription", iconColor: "#fbbf24", onPress: () => router.push("/subscription" as never) },
    { icon: "users", label: "Refer & Earn", iconColor: "#60a5fa", onPress: () => router.push("/referral" as never) },
    { icon: "award", label: "Rewards & Badges", iconColor: "#a78bfa", onPress: () => router.push("/rewards" as never) },
  ];

  const APP_SECTION = [
    { icon: "globe", label: "Language", value: "English", iconColor: "#38bdf8" },
    { icon: "moon", label: "Theme", value: "Dark", iconColor: "#6b7280" },
    {
      icon: "activity", label: "Units",
      value: `${units.weight} · ${units.height}`,
      iconColor: "#fb923c",
      onPress: () => Alert.alert("Units", "Change units coming in next update"),
    },
  ];

  const SUPPORT_SECTION = [
    { icon: "help-circle", label: "Help & FAQ", iconColor: "#60a5fa" },
    { icon: "message-circle", label: "Contact Support", iconColor: G },
    { icon: "file-text", label: "Privacy Policy", iconColor: "#6b7280" },
    { icon: "shield", label: "Terms of Service", iconColor: "#6b7280" },
    { icon: "info", label: "App Version", value: "1.0.0", iconColor: "#374151" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        contentContainerStyle={[s.container, { paddingTop: topPad + 16, paddingBottom: 60 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Pressable style={s.back} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>
          <Text style={s.title}>Settings</Text>
        </View>

        {/* Profile Card */}
        <View style={s.profileCard}>
          <View style={s.profileAvatar}>
            <Text style={s.profileAvatarText}>{user?.name?.[0]?.toUpperCase() ?? "U"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.profileName}>{user?.name ?? "User"}</Text>
            <Text style={s.profileEmail}>{user?.email ?? user?.phone ?? ""}</Text>
          </View>
          <Pressable style={s.editBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <Feather name="edit-2" size={14} color={G} />
          </Pressable>
        </View>

        {/* Account */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Account</Text>
          <View style={s.card}>
            {ACCOUNT_SECTION.map((item, i) => (
              <React.Fragment key={item.label}>
                <SettingRow {...item} onPress={item.onPress ?? (() => {})} />
                {i < ACCOUNT_SECTION.length - 1 && <View style={s.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Notifications */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Notifications</Text>
          <View style={s.card}>
            {([
              ["workout_reminders", "Workout Reminders"],
              ["meal_reminders", "Meal Log Reminders"],
              ["challenge_updates", "Challenge Updates"],
              ["achievement_alerts", "Achievement Alerts"],
              ["weekly_report", "Weekly Progress Report"],
              ["marketing", "SE7ENFIT News & Offers"],
            ] as [keyof NotifSettings, string][]).map(([key, label], i, arr) => (
              <React.Fragment key={key}>
                <SwitchRow label={label} value={notifs[key]} onToggle={() => toggleNotif(key)} />
                {i < arr.length - 1 && <View style={s.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* App */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>App Settings</Text>
          <View style={s.card}>
            {APP_SECTION.map((item, i) => (
              <React.Fragment key={item.label}>
                <SettingRow {...item} onPress={item.onPress ?? (() => {})} />
                {i < APP_SECTION.length - 1 && <View style={s.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Support */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Support</Text>
          <View style={s.card}>
            {SUPPORT_SECTION.map((item, i) => (
              <React.Fragment key={item.label}>
                <SettingRow {...item} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
                {i < SUPPORT_SECTION.length - 1 && <View style={s.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Danger Zone */}
        <View style={s.section}>
          <View style={s.card}>
            <SettingRow icon="log-out" label="Sign Out" iconColor="#f87171" danger onPress={confirmLogout} />
            <View style={s.divider} />
            <SettingRow icon="trash-2" label="Delete Account" iconColor="#f87171" danger onPress={confirmDeleteAccount} />
          </View>
        </View>

        <Text style={s.footer}>SE7ENFIT v1.0.0 · India's #1 AI Fitness App 🇮🇳</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 14 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: CARD, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: BORDER },
  title: { fontSize: 20, fontWeight: "800", color: "#fff" },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: CARD, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BORDER },
  profileAvatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: G, alignItems: "center", justifyContent: "center" },
  profileAvatarText: { fontSize: 22, fontWeight: "700", color: "#000" },
  profileName: { fontSize: 16, fontWeight: "700", color: "#fff" },
  profileEmail: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  editBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: G + "20", alignItems: "center", justifyContent: "center" },
  section: { gap: 10 },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, paddingLeft: 4 },
  card: { backgroundColor: CARD, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: BORDER },
  divider: { height: 1, backgroundColor: "#111", marginHorizontal: 16 },
  footer: { fontSize: 11, color: "#374151", textAlign: "center" },
});
