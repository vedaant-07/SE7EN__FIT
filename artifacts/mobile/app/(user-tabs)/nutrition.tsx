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

const MEALS = [
  {
    id: "1", name: "Breakfast", time: "8:00 AM",
    items: ["Oatmeal with berries", "2 Boiled Eggs", "Green Tea"],
    cal: 420, protein: 28, carbs: 52, fat: 12,
  },
  {
    id: "2", name: "Lunch", time: "1:00 PM",
    items: ["Grilled Chicken Salad", "Brown Rice", "Mixed Veggies"],
    cal: 580, protein: 48, carbs: 62, fat: 14,
  },
  {
    id: "3", name: "Snack", time: "4:00 PM",
    items: ["Protein Shake", "Banana", "Almonds (20g)"],
    cal: 280, protein: 24, carbs: 32, fat: 8,
  },
  {
    id: "4", name: "Dinner", time: "7:30 PM",
    items: ["Salmon Fillet", "Sweet Potato", "Steamed Broccoli"],
    cal: 560, protein: 44, carbs: 58, fat: 18,
  },
];

const WATER_GOAL = 3.0;

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const [water, setWater] = useState(2.1);
  const [expandedMeal, setExpandedMeal] = useState<string | null>("1");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const totalCal = MEALS.reduce((s, m) => s + m.cal, 0);
  const totalProtein = MEALS.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = MEALS.reduce((s, m) => s + m.carbs, 0);
  const totalFat = MEALS.reduce((s, m) => s + m.fat, 0);

  const calGoal = 2200;
  const calPct = Math.min(totalCal / calGoal, 1);

  function addWater(amount: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWater(w => Math.min(parseFloat((w + amount).toFixed(1)), WATER_GOAL + 1));
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.container, { paddingTop: topPad + 16, paddingBottom: (Platform.OS === "web" ? 34 : 0) + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Nutrition</Text>
        <Pressable style={styles.scanBtn} onPress={() => {}}>
          <Feather name="camera" size={18} color="#22C55E" />
          <Text style={styles.scanBtnText}>Scan Food</Text>
        </Pressable>
      </View>

      {/* Calorie Ring */}
      <View style={styles.calorieCard}>
        <View style={styles.calorieRing}>
          <Text style={styles.calorieNum}>{totalCal}</Text>
          <Text style={styles.calorieLabel}>of {calGoal}</Text>
          <Text style={styles.calorieUnit}>kcal</Text>
        </View>
        <View style={styles.macroGrid}>
          <View style={styles.macroItem}>
            <View style={[styles.macroDot, { backgroundColor: "#EF4444" }]} />
            <Text style={styles.macroVal}>{totalProtein}g</Text>
            <Text style={styles.macroName}>Protein</Text>
            <View style={styles.macroBar}>
              <View style={[styles.macroFill, { backgroundColor: "#EF4444", width: `${Math.min(totalProtein / 160 * 100, 100)}%` }]} />
            </View>
          </View>
          <View style={styles.macroItem}>
            <View style={[styles.macroDot, { backgroundColor: "#F97316" }]} />
            <Text style={styles.macroVal}>{totalCarbs}g</Text>
            <Text style={styles.macroName}>Carbs</Text>
            <View style={styles.macroBar}>
              <View style={[styles.macroFill, { backgroundColor: "#F97316", width: `${Math.min(totalCarbs / 250 * 100, 100)}%` }]} />
            </View>
          </View>
          <View style={styles.macroItem}>
            <View style={[styles.macroDot, { backgroundColor: "#3B82F6" }]} />
            <Text style={styles.macroVal}>{totalFat}g</Text>
            <Text style={styles.macroName}>Fat</Text>
            <View style={styles.macroBar}>
              <View style={[styles.macroFill, { backgroundColor: "#3B82F6", width: `${Math.min(totalFat / 70 * 100, 100)}%` }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Calorie Progress Bar */}
      <View style={styles.calProgressWrap}>
        <View style={styles.calProgressBg}>
          <View style={[styles.calProgressFill, { width: `${calPct * 100}%` }]} />
        </View>
        <Text style={styles.calProgressText}>{calGoal - totalCal} kcal remaining</Text>
      </View>

      {/* Water Tracker */}
      <View style={styles.waterCard}>
        <View style={styles.waterHeader}>
          <View style={styles.waterLeft}>
            <Feather name="droplet" size={18} color="#06B6D4" />
            <Text style={styles.waterTitle}>Water Intake</Text>
          </View>
          <Text style={styles.waterAmt}>{water.toFixed(1)} / {WATER_GOAL} L</Text>
        </View>
        <View style={styles.waterBar}>
          <View style={[styles.waterFill, { width: `${Math.min(water / WATER_GOAL * 100, 100)}%` }]} />
        </View>
        <View style={styles.waterBtns}>
          {[0.1, 0.25, 0.5].map(amt => (
            <Pressable key={amt} style={styles.waterAddBtn} onPress={() => addWater(amt)}>
              <Text style={styles.waterAddBtnText}>+{amt}L</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Meals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Meals</Text>
        {MEALS.map(meal => (
          <Pressable
            key={meal.id}
            style={styles.mealCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setExpandedMeal(expandedMeal === meal.id ? null : meal.id);
            }}
          >
            <View style={styles.mealHeader}>
              <View>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealTime}>{meal.time}</Text>
              </View>
              <View style={styles.mealRight}>
                <Text style={styles.mealCal}>{meal.cal} kcal</Text>
                <Feather name={expandedMeal === meal.id ? "chevron-up" : "chevron-down"} size={16} color="#6B7280" />
              </View>
            </View>
            {expandedMeal === meal.id && (
              <View style={styles.mealItems}>
                {meal.items.map((item, i) => (
                  <View key={i} style={styles.mealItem}>
                    <View style={styles.mealItemDot} />
                    <Text style={styles.mealItemText}>{item}</Text>
                  </View>
                ))}
                <View style={styles.mealMacros}>
                  <Text style={styles.mealMacro}><Text style={{ color: "#EF4444" }}>P</Text> {meal.protein}g</Text>
                  <Text style={styles.mealMacro}><Text style={{ color: "#F97316" }}>C</Text> {meal.carbs}g</Text>
                  <Text style={styles.mealMacro}><Text style={{ color: "#3B82F6" }}>F</Text> {meal.fat}g</Text>
                </View>
              </View>
            )}
          </Pressable>
        ))}

        <Pressable style={styles.addMealBtn} onPress={() => {}}>
          <Feather name="plus" size={18} color="#22C55E" />
          <Text style={styles.addMealBtnText}>Add a meal</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#0A0A0A" },
  container: { paddingHorizontal: 20, gap: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "800" as const, color: "#FFF" },
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#22C55E15",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scanBtnText: { fontSize: 13, color: "#22C55E", fontWeight: "600" as const },

  calorieCard: {
    flexDirection: "row",
    backgroundColor: "#141414",
    borderRadius: 16,
    padding: 18,
    gap: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#262626",
  },
  calorieRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: "#22C55E",
    backgroundColor: "#22C55E15",
    alignItems: "center",
    justifyContent: "center",
  },
  calorieNum: { fontSize: 20, fontWeight: "800" as const, color: "#22C55E" },
  calorieLabel: { fontSize: 9, color: "#6B7280" },
  calorieUnit: { fontSize: 11, color: "#9CA3AF" },
  macroGrid: { flex: 1, gap: 10 },
  macroItem: { gap: 3 },
  macroDot: { width: 6, height: 6, borderRadius: 3 },
  macroVal: { fontSize: 15, fontWeight: "700" as const, color: "#FFF" },
  macroName: { fontSize: 11, color: "#6B7280" },
  macroBar: { height: 4, backgroundColor: "#262626", borderRadius: 2 },
  macroFill: { height: 4, borderRadius: 2 },

  calProgressWrap: { gap: 6 },
  calProgressBg: { height: 8, backgroundColor: "#262626", borderRadius: 4 },
  calProgressFill: { height: 8, backgroundColor: "#22C55E", borderRadius: 4 },
  calProgressText: { fontSize: 12, color: "#6B7280", textAlign: "right" },

  waterCard: {
    backgroundColor: "#141414",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#06B6D420",
  },
  waterHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  waterLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  waterTitle: { fontSize: 15, fontWeight: "700" as const, color: "#FFF" },
  waterAmt: { fontSize: 15, fontWeight: "700" as const, color: "#06B6D4" },
  waterBar: { height: 8, backgroundColor: "#262626", borderRadius: 4 },
  waterFill: { height: 8, backgroundColor: "#06B6D4", borderRadius: 4 },
  waterBtns: { flexDirection: "row", gap: 10 },
  waterAddBtn: {
    flex: 1,
    backgroundColor: "#06B6D415",
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#06B6D420",
  },
  waterAddBtnText: { fontSize: 13, color: "#06B6D4", fontWeight: "700" as const },

  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const, color: "#FFF" },

  mealCard: {
    backgroundColor: "#141414",
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#262626",
  },
  mealHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  mealName: { fontSize: 15, fontWeight: "700" as const, color: "#FFF" },
  mealTime: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  mealRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  mealCal: { fontSize: 14, color: "#22C55E", fontWeight: "600" as const },
  mealItems: { gap: 8 },
  mealItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  mealItemDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#22C55E" },
  mealItemText: { fontSize: 13, color: "#D1D5DB" },
  mealMacros: { flexDirection: "row", gap: 16, marginTop: 4 },
  mealMacro: { fontSize: 12, color: "#9CA3AF" },

  addMealBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#141414",
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#22C55E30",
    borderStyle: "dashed" as const,
  },
  addMealBtnText: { fontSize: 14, color: "#22C55E", fontWeight: "600" as const },
});
