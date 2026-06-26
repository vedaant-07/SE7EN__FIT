import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const G = "#20c55d";
const BG = "#050505";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function goLogin() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/auth/login");
  }
  function goRegister() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/auth/register");
  }

  return (
    <View style={[s.root, { paddingTop: topPad + 24 }]}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <View style={s.hero}>
        <View style={s.logoWrap}>
          <Feather name="zap" size={38} color="#000" />
        </View>
        <Text style={s.brand}>SE<Text style={s.brandGreen}>7</Text>ENFIT</Text>
        <Text style={s.tagline}>India's #1 AI Fitness App</Text>
      </View>

      <View style={s.pitch}>
        <Text style={s.h1}>Transform Your{"\n"}<Text style={s.h1Green}>Body & Mind</Text></Text>
        <Text style={s.sub}>
          AI-powered workouts, nutrition tracking,{"\n"}
          challenges & rewards — all in one app.
        </Text>
      </View>

      <View style={[s.actions, { paddingBottom: insets.bottom + 40 }]}>
        <Pressable style={({ pressed }) => [s.btn, s.btnGreen, pressed && s.pressed]} onPress={goLogin}>
          <View style={s.btnIcon}><Feather name="log-in" size={18} color="#000" /></View>
          <View style={s.btnTexts}>
            <Text style={s.btnTitle}>Login</Text>
            <Text style={s.btnSub}>Access your fitness account</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#000" />
        </Pressable>

        <Pressable style={({ pressed }) => [s.btn, s.btnDark, pressed && s.pressed]} onPress={goRegister}>
          <View style={[s.btnIcon, { backgroundColor: G + "20" }]}>
            <Feather name="user-plus" size={18} color={G} />
          </View>
          <View style={s.btnTexts}>
            <Text style={[s.btnTitle, { color: "#fff" }]}>Create Account</Text>
            <Text style={[s.btnSub, { color: "#6b7280" }]}>Start your fitness journey</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#6b7280" />
        </Pressable>

        <Text style={s.legal}>
          By continuing, you agree to our{" "}
          <Text style={s.legalLink}>Terms</Text> and{" "}
          <Text style={s.legalLink}>Privacy Policy</Text>.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, paddingHorizontal: 24, justifyContent: "space-between" },
  hero: { alignItems: "center", gap: 10 },
  logoWrap: {
    width: 80, height: 80, borderRadius: 22,
    backgroundColor: G, alignItems: "center", justifyContent: "center",
    shadowColor: G, shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
  },
  brand: { fontSize: 34, fontWeight: "900", color: "#fff", letterSpacing: 2 },
  brandGreen: { color: G },
  tagline: { fontSize: 13, color: "#6b7280", letterSpacing: 0.5 },
  pitch: { alignItems: "center", gap: 14 },
  h1: { fontSize: 32, fontWeight: "800", color: "#fff", textAlign: "center", lineHeight: 42 },
  h1Green: { color: G },
  sub: { fontSize: 15, color: "#9ca3af", textAlign: "center", lineHeight: 23 },
  actions: { gap: 12 },
  btn: {
    flexDirection: "row", alignItems: "center", borderRadius: 16,
    paddingHorizontal: 20, paddingVertical: 18, gap: 14,
  },
  btnGreen: { backgroundColor: G },
  btnDark: { backgroundColor: "#0d0d0d", borderWidth: 1, borderColor: "#1e1e1e" },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  btnIcon: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.15)", alignItems: "center", justifyContent: "center",
  },
  btnTexts: { flex: 1, gap: 2 },
  btnTitle: { fontSize: 16, fontWeight: "700", color: "#000" },
  btnSub: { fontSize: 12, color: "rgba(0,0,0,0.55)" },
  legal: { textAlign: "center", fontSize: 12, color: "#4b5563", marginTop: 6 },
  legalLink: { color: G },
});
