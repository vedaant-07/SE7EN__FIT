import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const G = "#20c55d";
const BG = "#050505";
const CARD = "#0d0d0d";
const BORDER = "#1e1e1e";

const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];
const AGE_GROUPS = ["Under 18", "18–24", "25–34", "35–44", "45–54", "55+"];

interface BodyInfo {
  gender: string;
  age_group: string;
  height: string;
  weight: string;
}

export default function BodyInfoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [info, setInfo] = useState<BodyInfo>({
    gender: "",
    age_group: "",
    height: "",
    weight: "",
  });

  function set<K extends keyof BodyInfo>(key: K, val: string) {
    setInfo(prev => ({ ...prev, [key]: val }));
  }

  const isValid = info.gender && info.age_group && info.height && info.weight;

  function next() {
    if (!isValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(onboarding)/goals",
      params: info,
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        contentContainerStyle={[s.container, { paddingTop: topPad + 16, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Pressable style={s.back} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>

        {/* Progress */}
        <View style={s.progress}>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: "50%" }]} />
          </View>
          <Text style={s.progressText}>Step 2 of 4</Text>
        </View>

        <Text style={s.title}>About Your Body</Text>
        <Text style={s.sub}>This helps your AI Coach create the right plan for you</Text>

        {/* Gender */}
        <View style={s.section}>
          <Text style={s.label}>Gender</Text>
          <View style={s.chipGrid}>
            {GENDERS.map(g => (
              <Pressable
                key={g}
                style={[s.chip, info.gender === g && s.chipActive]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); set("gender", g); }}
              >
                <Text style={[s.chipText, info.gender === g && s.chipTextActive]}>{g}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Age Group */}
        <View style={s.section}>
          <Text style={s.label}>Age Group</Text>
          <View style={s.chipGrid}>
            {AGE_GROUPS.map(a => (
              <Pressable
                key={a}
                style={[s.chip, info.age_group === a && s.chipActive]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); set("age_group", a); }}
              >
                <Text style={[s.chipText, info.age_group === a && s.chipTextActive]}>{a}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Height & Weight */}
        <View style={s.rowInputs}>
          <View style={[s.section, { flex: 1 }]}>
            <Text style={s.label}>Height (cm)</Text>
            <View style={s.inputWrap}>
              <Feather name="trending-up" size={14} color="#6b7280" />
              <TextInput
                style={s.input}
                placeholder="e.g. 170"
                placeholderTextColor="#4b5563"
                keyboardType="number-pad"
                value={info.height}
                onChangeText={v => set("height", v.replace(/\D/g, "").slice(0, 3))}
                maxLength={3}
              />
              <Text style={s.inputUnit}>cm</Text>
            </View>
          </View>
          <View style={[s.section, { flex: 1 }]}>
            <Text style={s.label}>Weight (kg)</Text>
            <View style={s.inputWrap}>
              <Feather name="activity" size={14} color="#6b7280" />
              <TextInput
                style={s.input}
                placeholder="e.g. 70"
                placeholderTextColor="#4b5563"
                keyboardType="decimal-pad"
                value={info.weight}
                onChangeText={v => {
                  const clean = v.replace(/[^0-9.]/g, "");
                  if ((clean.match(/\./g) || []).length <= 1) set("weight", clean);
                }}
                maxLength={5}
              />
              <Text style={s.inputUnit}>kg</Text>
            </View>
          </View>
        </View>

        {/* BMI Preview */}
        {info.height && info.weight ? (() => {
          const h = parseInt(info.height) / 100;
          const w = parseFloat(info.weight);
          const bmi = h > 0 ? (w / (h * h)).toFixed(1) : null;
          const bmiVal = bmi ? parseFloat(bmi) : 0;
          const cat = bmiVal < 18.5 ? "Underweight" : bmiVal < 25 ? "Normal" : bmiVal < 30 ? "Overweight" : "Obese";
          const catColor = bmiVal < 18.5 ? "#38bdf8" : bmiVal < 25 ? G : "#fb923c";
          return bmi ? (
            <View style={s.bmiCard}>
              <Feather name="info" size={14} color="#6b7280" />
              <Text style={s.bmiText}>
                Your BMI: <Text style={[s.bmiNum, { color: catColor }]}>{bmi}</Text>
                <Text style={s.bmiCat}> ({cat})</Text>
              </Text>
            </View>
          ) : null;
        })() : null}
      </ScrollView>

      {/* CTA */}
      <View style={[s.footer, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable
          style={({ pressed }) => [s.btn, !isValid && s.btnDisabled, pressed && isValid && { opacity: 0.85 }]}
          onPress={next}
          disabled={!isValid}
        >
          <Text style={[s.btnText, !isValid && { color: "#374151" }]}>Continue</Text>
          <Feather name="arrow-right" size={18} color={isValid ? "#000" : "#374151"} />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 24, gap: 24 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: CARD, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: BORDER },
  progress: { gap: 8 },
  progressBar: { height: 5, backgroundColor: BORDER, borderRadius: 3 },
  progressFill: { height: 5, backgroundColor: G, borderRadius: 3 },
  progressText: { fontSize: 12, color: "#6b7280", textAlign: "right" },
  title: { fontSize: 26, fontWeight: "800", color: "#fff" },
  sub: { fontSize: 14, color: "#9ca3af", lineHeight: 21, marginTop: -8 },
  section: { gap: 10 },
  label: { fontSize: 13, fontWeight: "600", color: "#d1d5db" },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
  chipActive: { backgroundColor: G, borderColor: G },
  chipText: { fontSize: 13, color: "#9ca3af", fontWeight: "500" },
  chipTextActive: { color: "#000", fontWeight: "700" },
  rowInputs: { flexDirection: "row", gap: 12 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 12, paddingVertical: 14 },
  input: { flex: 1, fontSize: 16, color: "#fff", padding: 0, fontWeight: "600" },
  inputUnit: { fontSize: 12, color: "#4b5563" },
  bmiCard: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: CARD, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: BORDER },
  bmiText: { fontSize: 13, color: "#9ca3af" },
  bmiNum: { fontWeight: "700" },
  bmiCat: { color: "#6b7280" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: BG, paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: BORDER },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: G, borderRadius: 14, paddingVertical: 16 },
  btnDisabled: { backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
  btnText: { fontSize: 16, fontWeight: "700", color: "#000" },
});
