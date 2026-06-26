import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet,
  Text, TextInput, View, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/src/services/apiClient";

const G = "#20c55d";
const BG = "#050505";
const CARD = "#0d0d0d";
const BORDER = "#1e1e1e";

interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  category: string;
}

const CATEGORIES = ["All", "Indian", "Protein", "Dairy", "Grains", "Fruits", "Legumes", "Nuts", "Supplements"];

export default function AddMealScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ meal_type: string }>();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [searching, setSearching] = useState(false);
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [logging, setLogging] = useState(false);

  const search = useCallback(async (q: string) => {
    setSearching(true);
    try {
      const res = await api.get<{ foods: Food[] }>(`/api/nutrition/search?q=${encodeURIComponent(q)}`);
      setFoods(res.foods ?? []);
    } catch {
      setFoods([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    search(query);
  }, [query, search]);

  const filtered = category === "All" ? foods : foods.filter(f => f.category === category);

  async function logFood() {
    if (!selected) return;
    setLogging(true);
    try {
      await api.post("/api/nutrition/log", {
        food_id: selected.id,
        meal_type: params.meal_type ?? "Breakfast",
        quantity: parseFloat(quantity) || 1,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert("Error", "Could not log food. Please try again.");
    } finally {
      setLogging(false);
    }
  }

  const cal = selected ? Math.round(selected.calories * (parseFloat(quantity) || 1)) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Header */}
      <View style={[s.header, { paddingTop: topPad + 12 }]}>
        <Pressable style={s.back} onPress={() => router.back()}>
          <Feather name="x" size={20} color="#fff" />
        </Pressable>
        <Text style={s.headerTitle}>Add to {params.meal_type ?? "Meal"}</Text>
      </View>

      {/* Search Bar */}
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <Feather name="search" size={16} color="#6b7280" />
          <TextInput
            style={s.searchInput}
            placeholder="Search foods, e.g. Chicken, Idli..."
            placeholderTextColor="#4b5563"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {searching && <ActivityIndicator size="small" color={G} />}
          {query.length > 0 && !searching && (
            <Pressable onPress={() => setQuery("")}>
              <Feather name="x-circle" size={16} color="#4b5563" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.cats}>
        {CATEGORIES.map(c => (
          <Pressable
            key={c}
            style={[s.cat, category === c && s.catActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCategory(c); }}
          >
            <Text style={[s.catText, category === c && s.catTextActive]}>{c}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Food List */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 8 }} keyboardShouldPersistTaps="handled">
        {filtered.map(food => (
          <Pressable
            key={food.id}
            style={[s.foodRow, selected?.id === food.id && s.foodRowSelected]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelected(selected?.id === food.id ? null : food);
            }}
          >
            <View style={s.foodCatBadge}>
              <Text style={s.foodCatText}>{food.category[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.foodName}>{food.name}</Text>
              <Text style={s.foodServing}>{food.serving}</Text>
            </View>
            <View style={s.foodMacros}>
              <Text style={s.foodCal}>{food.calories} kcal</Text>
              <Text style={s.foodMacroLine}>P:{food.protein}g C:{food.carbs}g F:{food.fat}g</Text>
            </View>
            {selected?.id === food.id && (
              <View style={s.checkmark}>
                <Feather name="check" size={12} color="#000" />
              </View>
            )}
          </Pressable>
        ))}
        {filtered.length === 0 && !searching && (
          <View style={s.empty}>
            <Feather name="search" size={32} color="#374151" />
            <Text style={s.emptyText}>No foods found for "{query}"</Text>
            <Text style={s.emptyHint}>Try searching by name or category</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Panel */}
      {selected && (
        <View style={[s.bottomPanel, { paddingBottom: insets.bottom + 20 }]}>
          <View style={s.selectedFood}>
            <View style={{ flex: 1 }}>
              <Text style={s.selectedName}>{selected.name}</Text>
              <Text style={s.selectedServing}>{selected.serving}</Text>
            </View>
            <View style={s.qtyRow}>
              <Pressable style={s.qtyBtn} onPress={() => setQuantity(q => Math.max(0.5, (parseFloat(q) || 1) - 0.5).toString())}>
                <Feather name="minus" size={14} color="#fff" />
              </Pressable>
              <TextInput
                style={s.qtyInput}
                value={quantity}
                onChangeText={v => setQuantity(v.replace(/[^0-9.]/g, ""))}
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
              <Pressable style={s.qtyBtn} onPress={() => setQuantity(q => ((parseFloat(q) || 1) + 0.5).toString())}>
                <Feather name="plus" size={14} color="#fff" />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [s.logBtn, pressed && { opacity: 0.85 }]}
            onPress={logFood}
            disabled={logging}
          >
            {logging
              ? <ActivityIndicator color="#000" />
              : <Text style={s.logBtnText}>Log {cal} kcal to {params.meal_type}</Text>}
          </Pressable>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingBottom: 12 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: CARD, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: BORDER },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 12 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: CARD, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: BORDER },
  searchInput: { flex: 1, fontSize: 15, color: "#fff", padding: 0 },
  cats: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  cat: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
  catActive: { backgroundColor: G, borderColor: G },
  catText: { fontSize: 12, color: "#6b7280", fontWeight: "600" },
  catTextActive: { color: "#000", fontWeight: "700" },
  foodRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: CARD, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: BORDER },
  foodRowSelected: { borderColor: G, backgroundColor: "#071a0e" },
  foodCatBadge: { width: 36, height: 36, borderRadius: 10, backgroundColor: BORDER, alignItems: "center", justifyContent: "center" },
  foodCatText: { fontSize: 14, fontWeight: "700", color: "#9ca3af" },
  foodName: { fontSize: 14, fontWeight: "600", color: "#fff" },
  foodServing: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  foodMacros: { alignItems: "flex-end", gap: 2 },
  foodCal: { fontSize: 13, fontWeight: "700", color: G },
  foodMacroLine: { fontSize: 10, color: "#4b5563" },
  checkmark: { width: 22, height: 22, borderRadius: 11, backgroundColor: G, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", gap: 12, paddingTop: 60 },
  emptyText: { fontSize: 15, fontWeight: "600", color: "#6b7280" },
  emptyHint: { fontSize: 13, color: "#374151" },
  bottomPanel: { backgroundColor: "#0a0a0a", borderTopWidth: 1, borderTopColor: BORDER, padding: 16, gap: 12 },
  selectedFood: { flexDirection: "row", alignItems: "center", gap: 12 },
  selectedName: { fontSize: 14, fontWeight: "700", color: "#fff" },
  selectedServing: { fontSize: 11, color: "#6b7280" },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: BORDER, alignItems: "center", justifyContent: "center" },
  qtyInput: { width: 44, textAlign: "center", fontSize: 16, fontWeight: "700", color: "#fff", backgroundColor: CARD, borderRadius: 8, paddingVertical: 5, borderWidth: 1, borderColor: BORDER },
  logBtn: { backgroundColor: G, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  logBtnText: { fontSize: 15, fontWeight: "700", color: "#000" },
});
