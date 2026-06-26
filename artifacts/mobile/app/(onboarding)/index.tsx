import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated, Platform, Pressable, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

const G = "#20c55d";
const BG = "#050505";
const CARD = "#0d0d0d";
const BORDER = "#1e1e1e";

const FEATURES = [
  { icon: "cpu" as const, color: "#a78bfa", title: "AI Coach", desc: "Personalized plans powered by Gemini AI" },
  { icon: "zap" as const, color: G, title: "Smart Workouts", desc: "Adaptive training matched to your goals" },
  { icon: "heart" as const, color: "#f87171", title: "Health Sync", desc: "Connect Apple Health or Health Connect" },
  { icon: "award" as const, color: "#fbbf24", title: "Challenges & Rewards", desc: "Earn points and unlock badges" },
];

export default function OnboardingWelcome() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const firstName = user?.name?.split(" ")[0] ?? "there";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={[s.root, { paddingTop: topPad + 24 }]}>
      <Animated.View style={[s.content, { opacity: fade, transform: [{ translateY: slide }] }]}>
        {/* Progress dots */}
        <View style={s.dots}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={[s.dot, i === 0 && s.dotActive]} />
          ))}
        </View>

        {/* Hero */}
        <View style={s.hero}>
          <View style={s.logoWrap}>
            <Feather name="zap" size={36} color="#000" />
          </View>
          <Text style={s.h1}>Welcome, {firstName}! 👋</Text>
          <Text style={s.sub}>
            Let's set up your profile so SE7ENFIT can create a completely personalized experience just for you.
          </Text>
        </View>

        {/* Features */}
        <View style={s.features}>
          {FEATURES.map(f => (
            <View key={f.title} style={s.featureRow}>
              <View style={[s.featureIcon, { backgroundColor: f.color + "20" }]}>
                <Feather name={f.icon} size={18} color={f.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.featureTitle}>{f.title}</Text>
                <Text style={s.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Time note */}
        <View style={s.timeNote}>
          <Feather name="clock" size={13} color="#6b7280" />
          <Text style={s.timeNoteText}>Takes only 1 minute · You can update anytime</Text>
        </View>
      </Animated.View>

      {/* CTA */}
      <View style={[s.footer, { paddingBottom: insets.bottom + 32 }]}>
        <Pressable
          style={({ pressed }) => [s.btn, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/(onboarding)/body-info");
          }}
        >
          <Text style={s.btnText}>Let's Get Started</Text>
          <Feather name="arrow-right" size={18} color="#000" />
        </Pressable>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.replace("/(user-tabs)");
          }}
        >
          <Text style={s.skip}>Skip for now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, paddingHorizontal: 24 },
  content: { flex: 1, gap: 28 },
  dots: { flexDirection: "row", gap: 6, justifyContent: "center" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: BORDER },
  dotActive: { width: 24, backgroundColor: G },
  hero: { alignItems: "center", gap: 12 },
  logoWrap: {
    width: 80, height: 80, borderRadius: 22, backgroundColor: G,
    alignItems: "center", justifyContent: "center",
    shadowColor: G, shadowOpacity: 0.35, shadowRadius: 20, shadowOffset: { width: 0, height: 6 },
  },
  h1: { fontSize: 28, fontWeight: "800", color: "#fff", textAlign: "center" },
  sub: { fontSize: 15, color: "#9ca3af", textAlign: "center", lineHeight: 23 },
  features: { gap: 14 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: CARD, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: BORDER },
  featureIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  featureTitle: { fontSize: 14, fontWeight: "700", color: "#fff" },
  featureDesc: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  timeNote: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center" },
  timeNoteText: { fontSize: 12, color: "#6b7280" },
  footer: { gap: 14 },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: G, borderRadius: 16, paddingVertical: 18 },
  btnText: { fontSize: 17, fontWeight: "700", color: "#000" },
  skip: { fontSize: 14, color: "#4b5563", textAlign: "center" },
});
