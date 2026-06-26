import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Platform, Pressable, RefreshControl,
  ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/src/services/apiClient";

const G = "#20c55d";
const BG = "#050505";
const CARD = "#0d0d0d";
const BORDER = "#1e1e1e";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"] as const;
type MealType = typeof MEAL_TYPES[number];

interface FoodEntry {
  id: string;
  food: { name: string; calories: number; protein: number; carbs: number; fat: number; serving: string };
  meal_type: string;
  quantity: number;
}

interface Totals { calories: number; protein: number; carbs: number; fat: number }
interface Target { calories: number; protein: number; carbs: number; fat: number }

interface NutritionData {
  date: string;
  entries: FoodEntry[];
  totals: Totals;
  target: Target;
}

function MacroBar({ label, consumed, target, color }: { label: string; consumed: number; target: number; color: string }) {
  const pct = Math.min((consumed / (target || 1)) * 100, 100);
  return (
    <View style={mb.wrap}>
      <View style={mb.row}>
        <Text style={mb.label}>{label}</Text>
        <Text style={mb.val}><Text style={{ color }}>{Math.round(consumed)}</Text>/{target}g</Text>
      </View>
      <View style={mb.track}>
        <View style={[mb.fill, { width: `${pct}%` as `${number}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const mb = StyleSheet.create({
  wrap: { gap: 4 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 11, color: "#6b7280" },
  val: { fontSize: 11, color: "#9ca3af" },
  track: { height: 5, backgroundColor: BORDER, borderRadius: 3 },
  fill: { height: 5, borderRadius: 3 },
});

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [data, setData] = useState<NutritionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<MealType>("Breakfast");

  async function load(isRefresh = false) {
    try {
      if (!isRefresh) setLoading(true);
      const res = await api.get<NutritionData>("/api/nutrition/today");
      setData(res);
    } catch {
      setData({
        date: new Date().toISOString().split("T")[0],
        entries: [],
        totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        target: { calories: 2200, protein: 150, carbs: 250, fat: 60 },
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = data?.entries.filter(e => e.meal_type.toLowerCase() === activeTab.toLowerCase()) ?? [];
  const totals = data?.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const target = data?.target ?? { calories: 2200, protein: 150, carbs: 250, fat: 60 };
  const calPct = Math.min((totals.calories / target.calories) * 100, 100);
  const remaining = Math.max(target.calories - totals.calories, 0);

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        contentContainerStyle={[s.container, { paddingTop: topPad + 16, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={G} />}
      >
        {/* Header */}
        <View style={s.header}>
          <Pressable style={s.back} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Nutrition Diary</Text>
            <Text style={s.sub}>{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</Text>
          </View>
          <Pressable style={s.historyBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <Feather name="bar-chart-2" size={18} color="#9ca3af" />
          </Pressable>
        </View>

        {loading ? (
          <View style={s.loadingWrap}><ActivityIndicator color={G} /></View>
        ) : (
          <>
            {/* Calorie Ring */}
            <View style={s.calorieCard}>
              <View style={s.ringWrap}>
                <View style={s.ring}>
                  <View style={[s.ringFill, { height: `${calPct}%` as `${number}%` }]} />
                  <View style={s.ringInner}>
                    <Text style={s.ringCal}>{Math.round(totals.calories)}</Text>
                    <Text style={s.ringLabel}>kcal eaten</Text>
                  </View>
                </View>
              </View>
              <View style={s.calStats}>
                <View style={s.calStat}>
                  <Text style={[s.calNum, { color: G }]}>{target.calories}</Text>
                  <Text style={s.calLbl}>Target</Text>
                </View>
                <View style={s.calDivider} />
                <View style={s.calStat}>
                  <Text style={[s.calNum, { color: "#fbbf24" }]}>{Math.round(totals.calories)}</Text>
                  <Text style={s.calLbl}>Eaten</Text>
                </View>
                <View style={s.calDivider} />
                <View style={s.calStat}>
                  <Text style={[s.calNum, { color: "#38bdf8" }]}>{remaining}</Text>
                  <Text style={s.calLbl}>Left</Text>
                </View>
              </View>
            </View>

            {/* Macros */}
            <View style={s.macrosCard}>
              <Text style={s.sectionTitle}>Macronutrients</Text>
              <MacroBar label="Protein" consumed={totals.protein} target={target.protein} color="#a78bfa" />
              <MacroBar label="Carbohydrates" consumed={totals.carbs} target={target.carbs} color="#fbbf24" />
              <MacroBar label="Fat" consumed={totals.fat} target={target.fat} color="#f87171" />
            </View>

            {/* Meal Type Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.mealTabs}>
              {MEAL_TYPES.map(t => (
                <Pressable
                  key={t}
                  style={[s.mealTab, activeTab === t && s.mealTabActive]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(t); }}
                >
                  <Text style={[s.mealTabText, activeTab === t && s.mealTabTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Entries */}
            <View style={s.entriesSection}>
              <View style={s.entriesHeader}>
                <Text style={s.sectionTitle}>{activeTab}</Text>
                <Pressable
                  style={s.addBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    router.push({ pathname: "/nutrition/add-meal", params: { meal_type: activeTab } });
                  }}
                >
                  <Feather name="plus" size={14} color="#000" />
                  <Text style={s.addBtnText}>Add Food</Text>
                </Pressable>
              </View>

              {filtered.length === 0 ? (
                <Pressable
                  style={s.emptyEntry}
                  onPress={() => router.push({ pathname: "/nutrition/add-meal", params: { meal_type: activeTab } })}
                >
                  <Feather name="plus-circle" size={24} color="#374151" />
                  <Text style={s.emptyEntryText}>Tap to log {activeTab.toLowerCase()}</Text>
                </Pressable>
              ) : (
                <View style={s.entriesList}>
                  {filtered.map((entry, i) => (
                    <View key={entry.id} style={[s.entryRow, i < filtered.length - 1 && { borderBottomWidth: 1, borderBottomColor: "#111" }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.entryName}>{entry.food.name}</Text>
                        <Text style={s.entryMeta}>{entry.food.serving} × {entry.quantity}</Text>
                      </View>
                      <View style={s.entryRight}>
                        <Text style={s.entryCal}>{Math.round(entry.food.calories * entry.quantity)} kcal</Text>
                        <Text style={s.entryMacros}>{Math.round(entry.food.protein * entry.quantity)}p · {Math.round(entry.food.carbs * entry.quantity)}c · {Math.round(entry.food.fat * entry.quantity)}f</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Quick Log */}
            <View style={s.quickLogCard}>
              <Feather name="cpu" size={14} color={G} />
              <Text style={s.quickLogText}>AI meal suggestions based on your goals coming soon 🚀</Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={[s.fab, { bottom: insets.bottom + 24 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push({ pathname: "/nutrition/add-meal", params: { meal_type: activeTab } });
        }}
      >
        <Feather name="plus" size={22} color="#000" />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 14 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: CARD, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: BORDER },
  title: { fontSize: 20, fontWeight: "800", color: "#fff" },
  sub: { fontSize: 12, color: "#6b7280" },
  historyBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: CARD, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: BORDER },
  loadingWrap: { flex: 1, alignItems: "center", paddingTop: 60 },
  calorieCard: { backgroundColor: CARD, borderRadius: 18, padding: 20, gap: 16, borderWidth: 1, borderColor: BORDER },
  ringWrap: { alignItems: "center" },
  ring: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#111", overflow: "hidden", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: BORDER },
  ringFill: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: G + "30" },
  ringInner: { alignItems: "center", gap: 2 },
  ringCal: { fontSize: 26, fontWeight: "800", color: "#fff" },
  ringLabel: { fontSize: 10, color: "#6b7280" },
  calStats: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  calStat: { flex: 1, alignItems: "center", gap: 3 },
  calNum: { fontSize: 20, fontWeight: "700" },
  calLbl: { fontSize: 11, color: "#6b7280" },
  calDivider: { width: 1, height: 30, backgroundColor: BORDER },
  macrosCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: BORDER },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#fff" },
  mealTabs: { gap: 8, paddingHorizontal: 2 },
  mealTab: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
  mealTabActive: { backgroundColor: G, borderColor: G },
  mealTabText: { fontSize: 13, color: "#6b7280", fontWeight: "600" },
  mealTabTextActive: { color: "#000", fontWeight: "700" },
  entriesSection: { gap: 12 },
  entriesHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: G, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  addBtnText: { fontSize: 12, fontWeight: "700", color: "#000" },
  emptyEntry: { backgroundColor: CARD, borderRadius: 14, padding: 24, alignItems: "center", gap: 10, borderWidth: 1, borderColor: BORDER, borderStyle: "dashed" },
  emptyEntryText: { fontSize: 13, color: "#4b5563" },
  entriesList: { backgroundColor: CARD, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: BORDER },
  entryRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  entryName: { fontSize: 14, fontWeight: "600", color: "#fff" },
  entryMeta: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  entryRight: { alignItems: "flex-end", gap: 2 },
  entryCal: { fontSize: 14, fontWeight: "700", color: G },
  entryMacros: { fontSize: 10, color: "#6b7280" },
  quickLogCard: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#071a0e", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: G + "30" },
  quickLogText: { fontSize: 12, color: "#9ca3af", flex: 1 },
  fab: { position: "absolute", right: 20, width: 54, height: 54, borderRadius: 27, backgroundColor: G, alignItems: "center", justifyContent: "center", shadowColor: G, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
});
