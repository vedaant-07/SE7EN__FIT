import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Platform, Pressable, RefreshControl, ScrollView,
  StyleSheet, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/src/services/apiClient";

const G = "#20c55d";
const BG = "#050505";
const CARD = "#141414";
const BORDER = "#262626";

interface Member {
  id: string; name: string; phone: string; email: string; plan: string;
  status: string; fee: number; joined: string; expires: string; attendance_this_month: number;
}

const STATUS_COLOR: Record<string, string> = { active: G, pending: "#fb923c", expired: "#f87171" };

export default function MembersScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  async function load(isRefresh = false) {
    try {
      if (!isRefresh) setLoading(true);
      const res = await api.get<{ members: Member[] }>("/api/gym/members");
      setMembers(res.members ?? []);
    } catch { setMembers([]); }
    finally { setLoading(false); setRefreshing(false); }
  }

  useEffect(() => { load(); }, []);

  const filtered = members.filter(m => {
    const matchStatus = filter === "all" || m.status === filter;
    const matchQuery = !query || m.name.toLowerCase().includes(query.toLowerCase()) || m.phone.includes(query);
    return matchStatus && matchQuery;
  });

  const counts = {
    all: members.length,
    active: members.filter(m => m.status === "active").length,
    pending: members.filter(m => m.status === "pending").length,
    expired: members.filter(m => m.status === "expired").length,
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[s.container, { paddingTop: topPad + 16, paddingBottom: 100 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={G} />}
    >
      <View style={s.header}>
        <Text style={s.title}>Members</Text>
        <Pressable style={s.addBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
          <Feather name="user-plus" size={14} color="#000" />
          <Text style={s.addBtnText}>Add Member</Text>
        </Pressable>
      </View>

      <View style={s.searchBar}>
        <Feather name="search" size={15} color="#6B7280" />
        <TextInput
          style={s.searchInput}
          placeholder="Search by name or phone..."
          placeholderTextColor="#4B5563"
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")}>
            <Feather name="x" size={15} color="#4B5563" />
          </Pressable>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
        {(["all", "active", "pending", "expired"] as const).map(f => (
          <Pressable
            key={f}
            style={[s.filterBtn, filter === f && s.filterBtnActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(f); }}
          >
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={G} style={{ marginTop: 40 }} />
      ) : (
        <View style={s.list}>
          {filtered.map((m) => (
            <Pressable
              key={m.id}
              style={({ pressed }) => [s.memberCard, pressed && { opacity: 0.85 }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={s.memberTop}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{m.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.memberName}>{m.name}</Text>
                  <Text style={s.memberPhone}>{m.phone}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: (STATUS_COLOR[m.status] ?? "#6B7280") + "20" }]}>
                  <Text style={[s.statusText, { color: STATUS_COLOR[m.status] ?? "#6B7280" }]}>
                    {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={s.memberBottom}>
                <View style={s.memberInfo}>
                  <Feather name="credit-card" size={11} color="#6B7280" />
                  <Text style={s.memberInfoText}>{m.plan} · ₹{m.fee.toLocaleString()}</Text>
                </View>
                <View style={s.memberInfo}>
                  <Feather name="calendar" size={11} color="#6B7280" />
                  <Text style={s.memberInfoText}>Expires {m.expires}</Text>
                </View>
                <View style={s.memberInfo}>
                  <Feather name="activity" size={11} color={G} />
                  <Text style={[s.memberInfoText, { color: G }]}>{m.attendance_this_month} visits this month</Text>
                </View>
              </View>
            </Pressable>
          ))}
          {filtered.length === 0 && (
            <View style={s.empty}>
              <Feather name="users" size={40} color="#374151" />
              <Text style={s.emptyText}>No members found</Text>
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
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: CARD, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: BORDER },
  searchInput: { flex: 1, fontSize: 14, color: "#fff", padding: 0 },
  filters: { gap: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
  filterBtnActive: { backgroundColor: G, borderColor: G },
  filterText: { fontSize: 12, color: "#6B7280", fontWeight: "600" },
  filterTextActive: { color: "#000", fontWeight: "700" },
  list: { gap: 10 },
  memberCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, gap: 12, borderWidth: 1, borderColor: BORDER },
  memberTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: G + "20", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontWeight: "700", color: G },
  memberName: { fontSize: 15, fontWeight: "700", color: "#fff" },
  memberPhone: { fontSize: 12, color: "#6B7280", marginTop: 1 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: "700" },
  memberBottom: { gap: 6 },
  memberInfo: { flexDirection: "row", alignItems: "center", gap: 7 },
  memberInfoText: { fontSize: 12, color: "#6B7280" },
  empty: { alignItems: "center", gap: 14, paddingTop: 60 },
  emptyText: { color: "#6B7280", fontSize: 14 },
});
