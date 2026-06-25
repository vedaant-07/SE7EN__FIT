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

type Stage = "new" | "contacted" | "converted" | "lost";

const LEADS = [
  { id: "1", name: "Karan Mehta", phone: "+91 91234 56789", interest: "Weight Loss", source: "Instagram", stage: "new" as Stage, date: "Today" },
  { id: "2", name: "Ananya Kapoor", phone: "+91 82345 67890", interest: "Muscle Building", source: "Walk-in", stage: "contacted" as Stage, date: "Yesterday" },
  { id: "3", name: "Suresh Gupta", phone: "+91 73456 78901", interest: "General Fitness", source: "Referral", stage: "contacted" as Stage, date: "2d ago" },
  { id: "4", name: "Pooja Sharma", phone: "+91 64567 89012", interest: "Yoga", source: "Google", stage: "converted" as Stage, date: "3d ago" },
  { id: "5", name: "Amit Tiwari", phone: "+91 55678 90123", interest: "Weight Loss", source: "Facebook", stage: "new" as Stage, date: "Today" },
  { id: "6", name: "Ritika Singh", phone: "+91 46789 01234", interest: "HIIT Classes", source: "Instagram", stage: "lost" as Stage, date: "1w ago" },
];

const STAGE_COLORS: Record<Stage, string> = {
  new: "#3B82F6",
  contacted: "#F97316",
  converted: "#22C55E",
  lost: "#EF4444",
};

const STAGE_LABELS: Record<Stage, string> = {
  new: "New",
  contacted: "Contacted",
  converted: "Converted",
  lost: "Lost",
};

export default function LeadsScreen() {
  const insets = useSafeAreaInsets();
  const [activeStage, setActiveStage] = useState<Stage | "all">("all");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = activeStage === "all" ? LEADS : LEADS.filter(l => l.stage === activeStage);

  const counts = (["new", "contacted", "converted", "lost"] as Stage[]).reduce((acc, s) => {
    acc[s] = LEADS.filter(l => l.stage === s).length;
    return acc;
  }, {} as Record<Stage, number>);

  function moveStage(id: string, direction: 1 | -1) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.topSection, { paddingTop: topPad + 16 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Leads</Text>
          <Pressable
            style={styles.addBtn}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <Feather name="plus" size={18} color="#000" />
            <Text style={styles.addBtnText}>Add Lead</Text>
          </Pressable>
        </View>

        {/* Pipeline Summary */}
        <View style={styles.pipeline}>
          {(["new", "contacted", "converted", "lost"] as Stage[]).map(s => (
            <Pressable
              key={s}
              style={[styles.pipeCard, activeStage === s && styles.pipeCardActive, { borderTopColor: STAGE_COLORS[s] }]}
              onPress={() => setActiveStage(activeStage === s ? "all" : s)}
            >
              <Text style={[styles.pipeCount, { color: STAGE_COLORS[s] }]}>{counts[s]}</Text>
              <Text style={styles.pipeLabel}>{STAGE_LABELS[s]}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: (Platform.OS === "web" ? 34 : 0) + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="user-plus" size={40} color="#3F3F3F" />
            <Text style={styles.emptyText}>No leads in this stage</Text>
          </View>
        ) : filtered.map(lead => (
          <View key={lead.id} style={styles.leadCard}>
            <View style={styles.leadTop}>
              <View style={[styles.leadStageBar, { backgroundColor: STAGE_COLORS[lead.stage] }]} />
              <View style={styles.leadAvatar}>
                <Text style={styles.leadAvatarText}>{lead.name[0]}</Text>
              </View>
              <View style={styles.leadInfo}>
                <View style={styles.leadNameRow}>
                  <Text style={styles.leadName}>{lead.name}</Text>
                  <View style={[styles.stagePill, { backgroundColor: STAGE_COLORS[lead.stage] + "20" }]}>
                    <Text style={[styles.stagePillText, { color: STAGE_COLORS[lead.stage] }]}>
                      {STAGE_LABELS[lead.stage]}
                    </Text>
                  </View>
                </View>
                <Text style={styles.leadPhone}>{lead.phone}</Text>
                <View style={styles.leadMeta}>
                  <View style={styles.metaTag}>
                    <Feather name="tag" size={9} color="#6B7280" />
                    <Text style={styles.metaTagText}>{lead.interest}</Text>
                  </View>
                  <View style={styles.metaTag}>
                    <Feather name="share-2" size={9} color="#6B7280" />
                    <Text style={styles.metaTagText}>{lead.source}</Text>
                  </View>
                  <Text style={styles.leadDate}>{lead.date}</Text>
                </View>
              </View>
            </View>

            <View style={styles.leadActions}>
              <Pressable style={styles.actionBtn} onPress={() => moveStage(lead.id, -1)}>
                <Feather name="phone" size={14} color="#22C55E" />
                <Text style={styles.actionBtnText}>Call</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={() => {}}>
                <Feather name="message-circle" size={14} color="#3B82F6" />
                <Text style={[styles.actionBtnText, { color: "#3B82F6" }]}>WhatsApp</Text>
              </Pressable>
              {lead.stage !== "converted" && lead.stage !== "lost" && (
                <Pressable
                  style={[styles.actionBtn, { backgroundColor: "#22C55E20" }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  <Feather name="check-circle" size={14} color="#22C55E" />
                  <Text style={styles.actionBtnText}>Convert</Text>
                </Pressable>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  topSection: { paddingHorizontal: 20, gap: 14 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
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
  pipeline: { flexDirection: "row", gap: 8 },
  pipeCard: {
    flex: 1,
    backgroundColor: "#141414",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: "#262626",
  },
  pipeCardActive: { borderColor: "transparent" },
  pipeCount: { fontSize: 20, fontWeight: "800" as const },
  pipeLabel: { fontSize: 9, color: "#6B7280", textAlign: "center" },

  list: { paddingHorizontal: 20, paddingTop: 14, gap: 12 },
  empty: { alignItems: "center", gap: 12, paddingTop: 60 },
  emptyText: { fontSize: 15, color: "#6B7280" },

  leadCard: {
    backgroundColor: "#141414",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#262626",
  },
  leadTop: { flexDirection: "row", alignItems: "flex-start", padding: 14, gap: 12 },
  leadStageBar: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3 },
  leadAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  leadAvatarText: { fontSize: 16, fontWeight: "700" as const, color: "#FFF" },
  leadInfo: { flex: 1, gap: 4 },
  leadNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  leadName: { flex: 1, fontSize: 14, fontWeight: "700" as const, color: "#FFF" },
  stagePill: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  stagePillText: { fontSize: 10, fontWeight: "700" as const },
  leadPhone: { fontSize: 12, color: "#6B7280" },
  leadMeta: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  metaTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#1A1A1A",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  metaTagText: { fontSize: 10, color: "#9CA3AF" },
  leadDate: { fontSize: 11, color: "#4B5563" },

  leadActions: {
    flexDirection: "row",
    gap: 0,
    borderTopWidth: 1,
    borderTopColor: "#1F1F1F",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: "#1F1F1F",
  },
  actionBtnText: { fontSize: 12, color: "#22C55E", fontWeight: "600" as const },
});
