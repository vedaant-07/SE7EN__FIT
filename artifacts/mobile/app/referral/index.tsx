import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert, Platform, Pressable, RefreshControl, ScrollView, Share,
  StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/src/services/apiClient";

const G = "#20c55d";
const BG = "#050505";
const CARD = "#0d0d0d";
const BORDER = "#1e1e1e";

interface ReferralData {
  referral_code: string;
  referral_url: string;
  total_referrals: number;
  converted: number;
  pending: number;
  total_points_earned: number;
  history: Array<{ id: string; name: string; status: string; points_earned: number; joined_at: string | null; plan: string | null }>;
  rewards_structure: Array<{ event: string; points: number; description: string }>;
}

const STATUS_COLORS: Record<string, string> = { converted: G, signed_up: "#60a5fa", pending: "#fbbf24" };

export default function ReferralScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  async function load(isRefresh = false) {
    try {
      if (!isRefresh) setLoading(true);
      const res = await api.get<ReferralData>("/api/referrals");
      setData(res);
    } catch { setData(null); }
    finally { setLoading(false); setRefreshing(false); }
  }

  useEffect(() => { load(); }, []);

  async function copyCode() {
    if (!data) return;
    await Clipboard.setStringAsync(data.referral_code);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function shareCode() {
    if (!data) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `Join SE7ENFIT — India's #1 AI Fitness App! Use my referral code ${data.referral_code} and get started free. ${data.referral_url}`,
        url: data.referral_url,
        title: "Join SE7ENFIT with my code",
      });
    } catch { /* user cancelled */ }
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        contentContainerStyle={[s.container, { paddingTop: topPad + 16, paddingBottom: 60 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={G} />}
      >
        {/* Header */}
        <View style={s.header}>
          <Pressable style={s.back} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Refer & Earn</Text>
            <Text style={s.sub}>Earn up to ₹200 per friend!</Text>
          </View>
        </View>

        {/* Hero */}
        <View style={s.heroCard}>
          <Text style={s.heroEmoji}>🎁</Text>
          <Text style={s.heroTitle}>Invite Friends. Earn Big.</Text>
          <Text style={s.heroDesc}>
            Share your unique code. When your friend joins and upgrades, you earn points — redeemable for real rewards!
          </Text>
        </View>

        {/* Referral Code */}
        <View style={s.codeCard}>
          <Text style={s.codeLabel}>Your Referral Code</Text>
          <View style={s.codeRow}>
            <Text style={s.codeText}>{data?.referral_code ?? "Loading..."}</Text>
            <Pressable
              style={[s.copyBtn, copied && s.copyBtnDone]}
              onPress={copyCode}
              disabled={!data}
            >
              <Feather name={copied ? "check" : "copy"} size={14} color={copied ? "#000" : G} />
              <Text style={[s.copyText, copied && s.copyTextDone]}>{copied ? "Copied!" : "Copy"}</Text>
            </Pressable>
          </View>
          <Pressable style={s.shareBtn} onPress={shareCode} disabled={!data}>
            <Feather name="share-2" size={16} color="#000" />
            <Text style={s.shareBtnText}>Share with Friends</Text>
          </Pressable>
        </View>

        {/* Stats */}
        {data && (
          <View style={s.statsRow}>
            {[
              { label: "Total Referred", value: data.total_referrals.toString(), color: "#60a5fa" },
              { label: "Converted", value: data.converted.toString(), color: G },
              { label: "Points Earned", value: data.total_points_earned.toString(), color: "#fbbf24" },
            ].map(st => (
              <View key={st.label} style={s.statCard}>
                <Text style={[s.statNum, { color: st.color }]}>{st.value}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* How it works */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>How It Works</Text>
          <View style={s.howCard}>
            {data?.rewards_structure.map((r, i) => (
              <View key={i} style={[s.howRow, i < (data.rewards_structure.length - 1) && { borderBottomWidth: 1, borderBottomColor: "#111" }]}>
                <View style={s.howPoints}>
                  <Text style={s.howPointsNum}>+{r.points}</Text>
                  <Text style={s.howPointsLabel}>pts</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.howEvent}>{r.event}</Text>
                  <Text style={s.howDesc}>{r.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* History */}
        {data && data.history.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Referral History</Text>
            <View style={s.histCard}>
              {data.history.map((h, i) => (
                <View key={h.id} style={[s.histRow, i < data.history.length - 1 && { borderBottomWidth: 1, borderBottomColor: "#111" }]}>
                  <View style={s.histAvatar}>
                    <Text style={s.histAvatarText}>{h.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.histName}>{h.name}</Text>
                    <Text style={s.histPlan}>{h.plan ?? "Not subscribed yet"}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <View style={[s.statusBadge, { backgroundColor: (STATUS_COLORS[h.status] ?? "#6b7280") + "20" }]}>
                      <Text style={[s.statusText, { color: STATUS_COLORS[h.status] ?? "#6b7280" }]}>
                        {h.status === "converted" ? "Upgraded" : h.status === "signed_up" ? "Signed up" : "Pending"}
                      </Text>
                    </View>
                    {h.points_earned > 0 && (
                      <Text style={s.pointsEarned}>+{h.points_earned} pts</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Terms */}
        <Text style={s.terms}>
          Points are awarded when your friend completes registration or upgrades to a paid plan. Minimum payout: 500 points. Terms apply.
        </Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 14 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: CARD, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: BORDER },
  title: { fontSize: 20, fontWeight: "800", color: "#fff" },
  sub: { fontSize: 12, color: G },
  heroCard: { backgroundColor: "#071a0e", borderRadius: 18, padding: 20, alignItems: "center", gap: 10, borderWidth: 1, borderColor: G + "30" },
  heroEmoji: { fontSize: 40 },
  heroTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  heroDesc: { fontSize: 13, color: "#9ca3af", textAlign: "center", lineHeight: 20 },
  codeCard: { backgroundColor: CARD, borderRadius: 18, padding: 20, gap: 14, borderWidth: 1, borderColor: BORDER },
  codeLabel: { fontSize: 12, color: "#6b7280", fontWeight: "600" },
  codeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#111", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: G + "30" },
  codeText: { fontSize: 24, fontWeight: "800", color: G, letterSpacing: 4 },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: G + "20", borderRadius: 9, paddingHorizontal: 12, paddingVertical: 7 },
  copyBtnDone: { backgroundColor: G },
  copyText: { fontSize: 12, fontWeight: "700", color: G },
  copyTextDone: { color: "#000" },
  shareBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: G, borderRadius: 14, paddingVertical: 14 },
  shareBtnText: { fontSize: 15, fontWeight: "700", color: "#000" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: CARD, borderRadius: 14, padding: 14, alignItems: "center", gap: 4, borderWidth: 1, borderColor: BORDER },
  statNum: { fontSize: 24, fontWeight: "800" },
  statLabel: { fontSize: 11, color: "#6b7280", textAlign: "center" },
  section: { gap: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#fff" },
  howCard: { backgroundColor: CARD, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: BORDER },
  howRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  howPoints: { width: 54, alignItems: "center" },
  howPointsNum: { fontSize: 18, fontWeight: "800", color: "#fbbf24" },
  howPointsLabel: { fontSize: 10, color: "#6b7280" },
  howEvent: { fontSize: 13, fontWeight: "700", color: "#fff" },
  howDesc: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  histCard: { backgroundColor: CARD, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: BORDER },
  histRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  histAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: G + "20", alignItems: "center", justifyContent: "center" },
  histAvatarText: { fontSize: 16, fontWeight: "700", color: G },
  histName: { fontSize: 14, fontWeight: "600", color: "#fff" },
  histPlan: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  statusBadge: { borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: "700" },
  pointsEarned: { fontSize: 12, fontWeight: "700", color: "#fbbf24" },
  terms: { fontSize: 11, color: "#374151", textAlign: "center", lineHeight: 17 },
});
