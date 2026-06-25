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

type Category = "All" | "Strength" | "Cardio" | "HIIT" | "Yoga" | "Flexibility";

const CATEGORIES: Category[] = ["All", "Strength", "Cardio", "HIIT", "Yoga", "Flexibility"];

const WORKOUTS = [
  { id: "1", name: "Full Body Blast", category: "Strength", duration: "45 min", level: "Intermediate", calories: 380, sets: 5, icon: "zap" as const, color: "#22C55E" },
  { id: "2", name: "Morning HIIT", category: "HIIT", duration: "30 min", level: "Advanced", calories: 450, sets: 8, icon: "activity" as const, color: "#EF4444" },
  { id: "3", name: "Core Power", category: "Strength", duration: "25 min", level: "Beginner", calories: 200, sets: 4, icon: "target" as const, color: "#3B82F6" },
  { id: "4", name: "Cardio Burn", category: "Cardio", duration: "40 min", level: "Intermediate", calories: 360, sets: 0, icon: "wind" as const, color: "#F97316" },
  { id: "5", name: "Yoga Flow", category: "Yoga", duration: "60 min", level: "Beginner", calories: 150, sets: 0, icon: "sun" as const, color: "#8B5CF6" },
  { id: "6", name: "Stretch & Recover", category: "Flexibility", duration: "20 min", level: "Beginner", calories: 80, sets: 0, icon: "feather" as const, color: "#06B6D4" },
  { id: "7", name: "Upper Body Push", category: "Strength", duration: "35 min", level: "Intermediate", calories: 280, sets: 6, icon: "trending-up" as const, color: "#22C55E" },
  { id: "8", name: "Sprint Intervals", category: "HIIT", duration: "20 min", level: "Advanced", calories: 320, sets: 10, icon: "alert-triangle" as const, color: "#EF4444" },
];

export default function WorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = activeCategory === "All" ? WORKOUTS : WORKOUTS.filter(w => w.category === activeCategory);

  function toggleSave(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSaved(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={styles.title}>Workouts</Text>
        <View style={styles.headerBadge}>
          <Feather name="cpu" size={12} color="#22C55E" />
          <Text style={styles.headerBadgeText}>AI Powered</Text>
        </View>
      </View>

      {/* AI Recommendation Banner */}
      <View style={styles.aiBanner}>
        <Feather name="zap" size={16} color="#22C55E" />
        <Text style={styles.aiBannerText}>
          AI recommends <Text style={styles.aiBannerHighlight}>Full Body Blast</Text> for you today
        </Text>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
      >
        {CATEGORIES.map(cat => (
          <Pressable
            key={cat}
            style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveCategory(cat);
            }}
          >
            <Text style={[styles.catChipText, activeCategory === cat && styles.catChipTextActive]}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Workout List */}
      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: (Platform.OS === "web" ? 34 : 0) + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map(w => (
          <Pressable
            key={w.id}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <View style={[styles.cardLeft, { backgroundColor: w.color + "15" }]}>
              <Feather name={w.icon} size={26} color={w.color} />
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardName}>{w.name}</Text>
                <Pressable onPress={() => toggleSave(w.id)}>
                  <Feather
                    name={saved.has(w.id) ? "bookmark" : "bookmark"}
                    size={18}
                    color={saved.has(w.id) ? "#22C55E" : "#6B7280"}
                  />
                </Pressable>
              </View>
              <View style={styles.cardMeta}>
                <View style={[styles.levelBadge, { backgroundColor: w.color + "20" }]}>
                  <Text style={[styles.levelText, { color: w.color }]}>{w.level}</Text>
                </View>
                <Text style={styles.metaText}>{w.duration}</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.metaText}>{w.calories} cal</Text>
                {w.sets > 0 && (
                  <>
                    <Text style={styles.metaDot}>·</Text>
                    <Text style={styles.metaText}>{w.sets} sets</Text>
                  </>
                )}
              </View>
            </View>
            <Pressable
              style={styles.startBtn}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            >
              <Feather name="play" size={14} color="#000" />
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: { fontSize: 26, fontWeight: "800" as const, color: "#FFF" },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#22C55E15",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  headerBadgeText: { fontSize: 11, color: "#22C55E", fontWeight: "700" as const },
  aiBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "#0F1F0F",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#22C55E20",
  },
  aiBannerText: { fontSize: 13, color: "#9CA3AF", flex: 1 },
  aiBannerHighlight: { color: "#22C55E", fontWeight: "700" as const },
  categories: { paddingHorizontal: 20, paddingBottom: 16, gap: 8, flexDirection: "row" },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#262626",
  },
  catChipActive: { backgroundColor: "#22C55E", borderColor: "#22C55E" },
  catChipText: { fontSize: 13, color: "#6B7280", fontWeight: "600" as const },
  catChipTextActive: { color: "#000" },
  list: { paddingHorizontal: 20, gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141414",
    borderRadius: 16,
    padding: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: "#262626",
  },
  cardLeft: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1, gap: 6 },
  cardTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardName: { fontSize: 15, fontWeight: "700" as const, color: "#FFF", flex: 1 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  levelBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  levelText: { fontSize: 10, fontWeight: "700" as const },
  metaText: { fontSize: 12, color: "#6B7280" },
  metaDot: { fontSize: 12, color: "#3F3F3F" },
  startBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
  },
});
