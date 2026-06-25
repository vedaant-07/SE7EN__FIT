import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Status = "all" | "active" | "inactive" | "expired";

const MEMBERS = [
  { id: "1", name: "Arjun Sharma", phone: "+91 98765 43210", plan: "6-Month", status: "active" as const, due: "15 Aug 2025", paid: 8000 },
  { id: "2", name: "Priya Verma", phone: "+91 87654 32109", plan: "Annual", status: "active" as const, due: "1 Jan 2026", paid: 14000 },
  { id: "3", name: "Rohan Singh", phone: "+91 76543 21098", plan: "Monthly", status: "expired" as const, due: "20 Jun 2025", paid: 1500 },
  { id: "4", name: "Neha Joshi", phone: "+91 65432 10987", plan: "3-Month", status: "active" as const, due: "10 Sep 2025", paid: 4500 },
  { id: "5", name: "Vikram Patel", phone: "+91 54321 09876", plan: "Monthly", status: "inactive" as const, due: "5 Jul 2025", paid: 1500 },
  { id: "6", name: "Asha Nair", phone: "+91 43210 98765", plan: "Annual", status: "active" as const, due: "20 Dec 2025", paid: 14000 },
  { id: "7", name: "Deepak Kumar", phone: "+91 32109 87654", plan: "6-Month", status: "active" as const, due: "8 Oct 2025", paid: 8000 },
];

const STATUS_COLOR: Record<string, string> = {
  active: "#22C55E",
  inactive: "#6B7280",
  expired: "#EF4444",
};

export default function MembersScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Status>("all");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = MEMBERS.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search);
    const matchFilter = filter === "all" || m.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <View style={styles.container}>
      <View style={[styles.topSection, { paddingTop: topPad + 16 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Members</Text>
          <Pressable
            style={styles.addBtn}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <Feather name="plus" size={18} color="#000" />
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Feather name="search" size={16} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search members..."
            placeholderTextColor="#4B5563"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={16} color="#6B7280" />
            </Pressable>
          )}
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {(["all", "active", "inactive", "expired"] as Status[]).map(f => (
            <Pressable
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              {f !== "all" && (
                <View style={[styles.filterDot, { backgroundColor: STATUS_COLOR[f] }]} />
              )}
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === "all" ? ` (${MEMBERS.length})` : ` (${MEMBERS.filter(m => m.status === f).length})`}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: (Platform.OS === "web" ? 34 : 0) + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="users" size={40} color="#3F3F3F" />
            <Text style={styles.emptyText}>No members found</Text>
          </View>
        ) : filtered.map(m => (
          <Pressable
            key={m.id}
            style={({ pressed }) => [styles.memberCard, pressed && { opacity: 0.85 }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={styles.memberAvatar}>
              <Text style={styles.memberAvatarText}>{m.name[0]}</Text>
            </View>
            <View style={styles.memberBody}>
              <View style={styles.memberTop}>
                <Text style={styles.memberName}>{m.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[m.status] + "20" }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLOR[m.status] }]}>{m.status}</Text>
                </View>
              </View>
              <Text style={styles.memberPhone}>{m.phone}</Text>
              <View style={styles.memberBottom}>
                <View style={styles.planTag}>
                  <Feather name="calendar" size={10} color="#6B7280" />
                  <Text style={styles.planText}>{m.plan}</Text>
                </View>
                <Text style={styles.dueText}>Due: {m.due}</Text>
                <Text style={styles.paidText}>₹{m.paid.toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.actionBtns}>
              <Pressable style={styles.iconBtn} onPress={() => {}}>
                <Feather name="message-circle" size={14} color="#22C55E" />
              </Pressable>
              <Pressable style={styles.iconBtn} onPress={() => {}}>
                <Feather name="more-vertical" size={14} color="#6B7280" />
              </Pressable>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  topSection: { paddingHorizontal: 20, gap: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 4 },
  title: { fontSize: 26, fontWeight: "800" as const, color: "#FFF" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#22C55E",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: { fontSize: 14, fontWeight: "700" as const, color: "#000" },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#141414",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#262626",
  },
  searchInput: { flex: 1, color: "#FFF", fontSize: 14, padding: 0 },
  filters: { gap: 8, paddingBottom: 4 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#262626",
  },
  filterChipActive: { backgroundColor: "#22C55E", borderColor: "#22C55E" },
  filterDot: { width: 6, height: 6, borderRadius: 3 },
  filterText: { fontSize: 12, color: "#6B7280", fontWeight: "600" as const },
  filterTextActive: { color: "#000" },
  list: { paddingHorizontal: 20, paddingTop: 12, gap: 10 },
  empty: { alignItems: "center", gap: 12, paddingTop: 60 },
  emptyText: { fontSize: 15, color: "#6B7280" },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141414",
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#262626",
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#22C55E20",
    alignItems: "center",
    justifyContent: "center",
  },
  memberAvatarText: { fontSize: 18, fontWeight: "700" as const, color: "#22C55E" },
  memberBody: { flex: 1, gap: 4 },
  memberTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  memberName: { flex: 1, fontSize: 14, fontWeight: "700" as const, color: "#FFF" },
  statusBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  statusText: { fontSize: 10, fontWeight: "700" as const, textTransform: "capitalize" as const },
  memberPhone: { fontSize: 12, color: "#6B7280" },
  memberBottom: { flexDirection: "row", alignItems: "center", gap: 10 },
  planTag: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#1A1A1A", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  planText: { fontSize: 10, color: "#9CA3AF" },
  dueText: { fontSize: 11, color: "#6B7280", flex: 1 },
  paidText: { fontSize: 12, color: "#22C55E", fontWeight: "700" as const },
  actionBtns: { gap: 6 },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
});
