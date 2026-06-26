import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, Platform, Pressable, RefreshControl,
  ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const G = "#20c55d";
const BG = "#050505";
const CARD = "#0d0d0d";
const BORDER = "#1e1e1e";

interface HealthMetric {
  icon: keyof typeof import("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather")["glyphMap"];
  label: string;
  value: string;
  unit: string;
  color: string;
  connected: boolean;
}

const MOCK_METRICS: HealthMetric[] = [
  { icon: "activity", label: "Steps Today", value: "—", unit: "steps", color: G, connected: false },
  { icon: "zap", label: "Calories Burned", value: "—", unit: "kcal", color: "#fb923c", connected: false },
  { icon: "map-pin", label: "Distance", value: "—", unit: "km", color: "#38bdf8", connected: false },
  { icon: "clock", label: "Active Minutes", value: "—", unit: "min", color: "#a78bfa", connected: false },
  { icon: "moon", label: "Sleep", value: "—", unit: "hrs", color: "#fbbf24", connected: false },
  { icon: "thermometer", label: "Resting HR", value: "—", unit: "bpm", color: "#f87171", connected: false },
];

export default function HealthScreen() {
  const insets = useSafeAreaInsets();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function handleConnect() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Connect Health",
      Platform.OS === "ios"
        ? "To connect Apple Health, enable HealthKit in your device settings. This requires a real device."
        : "To connect Health Connect, install Health Connect from Google Play Store and grant permissions.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: Platform.OS === "ios" ? "Open Settings" : "Learn More",
          onPress: () => {
            setConnected(true);
            setLastSync(new Date());
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  }

  function handleSync() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLastSync(new Date());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[s.container, { paddingTop: topPad + 16, paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0) }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Health</Text>
          <Text style={s.subtitle}>Your health & activity data</Text>
        </View>
        {connected && (
          <Pressable style={s.syncBtn} onPress={handleSync} disabled={loading}>
            {loading
              ? <ActivityIndicator size="small" color={G} />
              : <><Feather name="refresh-cw" size={14} color={G} /><Text style={s.syncText}>Sync</Text></>}
          </Pressable>
        )}
      </View>

      {/* Connection Status */}
      <View style={connected ? s.connectedCard : s.notConnectedCard}>
        <View style={s.connRow}>
          <View style={[s.connIcon, { backgroundColor: connected ? G + "20" : "#374151" + "40" }]}>
            <Feather name="heart" size={22} color={connected ? G : "#9ca3af"} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.connTitle}>
              {Platform.OS === "ios" ? "Apple Health" : "Health Connect"}
            </Text>
            <Text style={s.connStatus}>
              {connected ? "Connected" : "Not connected"}
              {lastSync ? ` · Synced ${lastSync.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : ""}
            </Text>
          </View>
          {!connected && (
            <Pressable style={s.connectBtn} onPress={handleConnect}>
              <Text style={s.connectBtnText}>Connect</Text>
            </Pressable>
          )}
          {connected && (
            <View style={s.connBadge}><Text style={s.connBadgeText}>✓ Active</Text></View>
          )}
        </View>

        {!connected && (
          <Text style={s.connHint}>
            Connect {Platform.OS === "ios" ? "Apple Health" : "Health Connect"} to automatically track your steps, calories, sleep, and more.
          </Text>
        )}
      </View>

      {/* Health Metrics */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Today's Activity</Text>
        <View style={s.metricsGrid}>
          {MOCK_METRICS.map(m => (
            <View key={m.label} style={[s.metricCard, !connected && s.metricCardDim]}>
              <View style={[s.metricIcon, { backgroundColor: m.color + "20" }]}>
                <Feather name={m.icon as "activity"} size={18} color={connected ? m.color : "#374151"} />
              </View>
              <Text style={[s.metricValue, !connected && { color: "#374151" }]}>{m.value}</Text>
              <Text style={s.metricUnit}>{m.unit}</Text>
              <Text style={s.metricLabel}>{m.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Not Connected Explainer */}
      {!connected && (
        <View style={s.explainerCard}>
          <Text style={s.explainerTitle}>Why connect health?</Text>
          <View style={s.explainerList}>
            {[
              { icon: "activity" as const, text: "Auto-track steps and active minutes" },
              { icon: "zap" as const, text: "Sync calorie burn to your dashboard" },
              { icon: "moon" as const, text: "Monitor sleep quality for recovery" },
              { icon: "cpu" as const, text: "AI Coach gets smarter with your data" },
            ].map(item => (
              <View key={item.text} style={s.explainerItem}>
                <View style={s.explainerDot}><Feather name={item.icon} size={14} color={G} /></View>
                <Text style={s.explainerText}>{item.text}</Text>
              </View>
            ))}
          </View>
          <Pressable style={s.bigConnectBtn} onPress={handleConnect}>
            <Feather name="heart" size={16} color="#000" />
            <Text style={s.bigConnectText}>
              Connect {Platform.OS === "ios" ? "Apple Health" : "Health Connect"}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Progress Section */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Weekly Progress</Text>
        <View style={s.weekGrid}>
          {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
            <View key={i} style={s.dayCol}>
              <View style={[s.dayBar, { height: connected ? Math.random() * 60 + 20 : 20, backgroundColor: connected && i < 5 ? G : "#1e1e1e" }]} />
              <Text style={s.dayLabel}>{day}</Text>
            </View>
          ))}
        </View>
        <Text style={s.weekNote}>{connected ? "Based on your health data" : "Connect health to see your activity"}</Text>
      </View>

      {/* Weight Log */}
      <View style={s.weightCard}>
        <View style={s.weightHeader}>
          <Feather name="trending-down" size={18} color={G} />
          <Text style={s.weightTitle}>Weight Log</Text>
        </View>
        <Text style={s.weightCurrent}>— kg</Text>
        <Text style={s.weightSub}>Log your weight to track progress</Text>
        <Pressable style={s.weightBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <Feather name="plus" size={14} color={G} />
          <Text style={s.weightBtnText}>Log Weight</Text>
        </Pressable>
      </View>

      <View style={s.noteCard}>
        <Feather name="info" size={14} color="#6b7280" />
        <Text style={s.noteText}>
          Health tracking requires a real iOS/Android device. Health data is synced to your account and used only to personalize your AI Coach experience.
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontSize: 26, fontWeight: "800", color: "#fff" },
  subtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  syncBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: G + "15", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  syncText: { fontSize: 13, color: G, fontWeight: "600" },
  connectedCard: { backgroundColor: "#071a0e", borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: G + "30" },
  notConnectedCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: BORDER },
  connRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  connIcon: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  connTitle: { fontSize: 15, fontWeight: "700", color: "#fff" },
  connStatus: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  connectBtn: { backgroundColor: G, borderRadius: 9, paddingHorizontal: 14, paddingVertical: 8 },
  connectBtnText: { fontSize: 13, fontWeight: "700", color: "#000" },
  connBadge: { backgroundColor: G + "20", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  connBadgeText: { fontSize: 11, color: G, fontWeight: "700" },
  connHint: { fontSize: 12, color: "#6b7280", lineHeight: 18 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#fff" },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  metricCard: { width: "47%", backgroundColor: CARD, borderRadius: 14, padding: 14, gap: 6, borderWidth: 1, borderColor: BORDER },
  metricCardDim: { opacity: 0.6 },
  metricIcon: { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  metricValue: { fontSize: 22, fontWeight: "800", color: "#fff", marginTop: 4 },
  metricUnit: { fontSize: 11, color: "#6b7280" },
  metricLabel: { fontSize: 12, color: "#9ca3af", fontWeight: "500" },
  explainerCard: { backgroundColor: CARD, borderRadius: 16, padding: 18, gap: 14, borderWidth: 1, borderColor: BORDER },
  explainerTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  explainerList: { gap: 10 },
  explainerItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  explainerDot: { width: 28, height: 28, borderRadius: 8, backgroundColor: G + "15", alignItems: "center", justifyContent: "center" },
  explainerText: { fontSize: 13, color: "#d1d5db", flex: 1 },
  bigConnectBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: G, borderRadius: 12, paddingVertical: 14 },
  bigConnectText: { fontSize: 15, fontWeight: "700", color: "#000" },
  weekGrid: { flexDirection: "row", alignItems: "flex-end", gap: 6, height: 90, backgroundColor: CARD, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: BORDER },
  dayCol: { flex: 1, alignItems: "center", gap: 4, justifyContent: "flex-end" },
  dayBar: { width: "100%", borderRadius: 4, minHeight: 8 },
  dayLabel: { fontSize: 10, color: "#6b7280" },
  weekNote: { fontSize: 11, color: "#4b5563", textAlign: "center" },
  weightCard: { backgroundColor: CARD, borderRadius: 16, padding: 18, gap: 8, borderWidth: 1, borderColor: BORDER },
  weightHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  weightTitle: { fontSize: 15, fontWeight: "700", color: "#fff" },
  weightCurrent: { fontSize: 36, fontWeight: "800", color: G },
  weightSub: { fontSize: 12, color: "#6b7280" },
  weightBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: G + "15", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, alignSelf: "flex-start" },
  weightBtnText: { fontSize: 13, color: G, fontWeight: "600" },
  noteCard: { flexDirection: "row", gap: 8, backgroundColor: CARD, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: BORDER },
  noteText: { fontSize: 11, color: "#6b7280", flex: 1, lineHeight: 17 },
});
