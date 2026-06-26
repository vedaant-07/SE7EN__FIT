import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Platform, Pressable, RefreshControl,
  ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/src/services/apiClient";

const G = "#20c55d";
const BG = "#050505";
const CARD = "#141414";
const BORDER = "#262626";

interface Lead {
  id: string; name: string; phone: string; source: string; status: string;
  interest: string; notes: string; created_at: string; follow_up: string | null;
}

const STATUS_COLOR: Record<string, string> = { hot: "#f87171", warm: "#fbbf24", cold: "#60a5fa" };
const SOURCE_ICON: Record<string, string> = { "Walk-in": "map-pin", Instagram: "instagram", Referral: "users", Google: "search" };

export default function LeadsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");

  async function load(isRefresh = false) {
    try {
      if (!isRefresh) setLoading(true);
      const res = await api.get<{ leads: Lead[] }>("/api/gym/leads");
      setLeads(res.leads ?? []);
    } catch { setLeads([]); }
    finally { setLoading(false); setRefreshing(false); }
  }

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? leads : leads.filter(l => l.status === filter);
  const counts = {
    all: leads.length,
    hot: leads.filter(l => l.status === "hot").length,
    warm: leads.filter(l => l.status === "warm").length,
    cold: leads.filter(l => l.status === "cold").length,
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[s.container, { paddingTop: topPad + 16, paddingBottom: 100 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={G} />}
    >
      <View style={s.header}>
        <Text style={s.title}>Leads</Text>
        <Pressable style={s.addBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
          <Feather name="plus" size={14} color="#000" />
          <Text style={s.addBtnText}>Add Lead</Text>
        </Pressable>
      </View>

      {/* Summary */}
      <View style={s.summaryRow}>
        {[
          { label: "Hot", count: counts.hot, color: "#f87171" },
          { label: "Warm", count: counts.warm, color: "#fbbf24" },
          { label: "Cold", count: counts.cold, color: "#60a5fa" },
        ].map(s2 => (
          <View key={s2.label} style={[s.summaryCard, { borderTopColor: s2.color, borderTopWidth: 2 }]}>
            <Text style={[s.summaryNum, { color: s2.color }]}>{s2.count}</Text>
            <Text style={s.summaryLabel}>{s2.label} Leads</Text>
          </View>
        ))}
      </View>

      {/* Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
        {(["all", "hot", "warm", "cold"] as const).map(f => (
          <Pressable
            key={f}
            style={[s.filterBtn, filter === f && [s.filterBtnActive, { backgroundColor: STATUS_COLOR[f] ?? G }]]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(f); }}
          >
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f] ?? counts.all})
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={G} style={{ marginTop: 40 }} />
      ) : (
        <View style={s.list}>
          {filtered.map(lead => (
            <Pressable
              key={lead.id}
              style={({ pressed }) => [s.leadCard, { borderLeftColor: STATUS_COLOR[lead.status] ?? "#6B7280", borderLeftWidth: 3 }, pressed && { opacity: 0.85 }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={s.leadTop}>
                <View style={s.leadAvatar}>
                  <Text style={s.leadAvatarText}>{lead.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.leadName}>{lead.name}</Text>
                  <Text style={s.leadPhone}>{lead.phone}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: (STATUS_COLOR[lead.status] ?? "#6B7280") + "20" }]}>
                  <Text style={[s.statusText, { color: STATUS_COLOR[lead.status] ?? "#6B7280" }]}>
                    {lead.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={s.leadMeta}>
                <View style={s.metaItem}>
                  <Feather name={(SOURCE_ICON[lead.source] ?? "link") as never} size={11} color="#6B7280" />
                  <Text style={s.metaText}>{lead.source}</Text>
                </View>
                <View style={s.metaItem}>
                  <Feather name="star" size={11} color="#6B7280" />
                  <Text style={s.metaText}>{lead.interest}</Text>
                </View>
                {lead.follow_up && (
                  <View style={s.metaItem}>
                    <Feather name="clock" size={11} color="#fbbf24" />
                    <Text style={[s.metaText, { color: "#fbbf24" }]}>Follow up: {lead.follow_up}</Text>
                  </View>
                )}
              </View>

              {lead.notes && (
                <View style={s.noteWrap}>
                  <Text style={s.noteText} numberOfLines={2}>{lead.notes}</Text>
                </View>
              )}

              <View style={s.leadActions}>
                <Pressable style={s.actionBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                  <Feather name="phone" size={13} color={G} />
                  <Text style={s.actionText}>Call</Text>
                </Pressable>
                <Pressable style={s.actionBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                  <Feather name="message-circle" size={13} color="#60a5fa" />
                  <Text style={[s.actionText, { color: "#60a5fa" }]}>WhatsApp</Text>
                </Pressable>
                <Pressable style={[s.actionBtn, s.convertBtn]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
                  <Feather name="user-check" size={13} color="#000" />
                  <Text style={[s.actionText, { color: "#000", fontWeight: "700" }]}>Convert</Text>
                </Pressable>
              </View>
            </Pressable>
          ))}
          {filtered.length === 0 && (
            <View style={s.empty}>
              <Feather name="user-x" size={40} color="#374151" />
              <Text style={s.emptyText}>No {filter} leads</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "800", color: "#fff" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: G, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  addBtnText: { fontSize: 13, fontWeight: "700", color: "#000" },
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryCard: { flex: 1, backgroundColor: CARD, borderRadius: 12, padding: 12, alignItems: "center", gap: 4, borderWidth: 1, borderColor: BORDER },
  summaryNum: { fontSize: 24, fontWeight: "800" },
  summaryLabel: { fontSize: 11, color: "#6B7280" },
  filters: { gap: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
  filterBtnActive: { borderColor: "transparent" },
  filterText: { fontSize: 12, color: "#6B7280", fontWeight: "600" },
  filterTextActive: { color: "#fff", fontWeight: "700" },
  list: { gap: 12 },
  leadCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, gap: 10, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },
  leadTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  leadAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#262626", alignItems: "center", justifyContent: "center" },
  leadAvatarText: { fontSize: 16, fontWeight: "700", color: "#9CA3AF" },
  leadName: { fontSize: 15, fontWeight: "700", color: "#fff" },
  leadPhone: { fontSize: 12, color: "#6B7280", marginTop: 1 },
  statusBadge: { borderRadius: 7, paddingHorizontal: 9, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: "700" },
  leadMeta: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 11, color: "#6B7280" },
  noteWrap: { backgroundColor: "#1a1a1a", borderRadius: 8, padding: 10 },
  noteText: { fontSize: 12, color: "#9CA3AF", lineHeight: 18 },
  leadActions: { flexDirection: "row", gap: 8 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: "#1a1a1a", borderRadius: 9, paddingVertical: 9, borderWidth: 1, borderColor: BORDER },
  actionText: { fontSize: 12, color: G, fontWeight: "600" },
  convertBtn: { backgroundColor: G, borderColor: G },
  empty: { alignItems: "center", gap: 14, paddingTop: 60 },
  emptyText: { color: "#6B7280", fontSize: 14 },
});
