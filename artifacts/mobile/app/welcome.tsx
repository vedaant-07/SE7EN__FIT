import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setRole } = useAuth();

  function handleUser() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRole("user");
    router.push("/auth/login");
  }

  function handleGymOwner() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRole("gym_owner");
    router.push("/auth/login");
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad + 20 }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={styles.hero}>
        <View style={styles.logoWrap}>
          <Feather name="zap" size={36} color="#000" />
        </View>
        <Text style={styles.brand}>
          SE<Text style={styles.brandAccent}>7</Text>ENFIT
        </Text>
        <Text style={styles.tagline}>India's #1 AI Fitness App</Text>
      </View>

      <View style={styles.headline}>
        <Text style={styles.h1}>
          Transform Your{" "}
          <Text style={styles.h1Accent}>Body & Mind</Text>
        </Text>
        <Text style={styles.sub}>
          AI-powered workouts, nutrition tracking,{"\n"}
          challenges & rewards — all in one app.
        </Text>
      </View>

      <View style={[styles.actions, { paddingBottom: insets.bottom + 40 }]}>
        <Pressable
          style={({ pressed }) => [styles.btn, styles.btnUser, pressed && styles.btnPressed]}
          onPress={handleUser}
        >
          <View style={styles.btnLeft}>
            <Feather name="activity" size={20} color="#000" />
          </View>
          <View style={styles.btnText}>
            <Text style={styles.btnTitle}>Continue as User</Text>
            <Text style={styles.btnSub}>Track fitness, nutrition & more</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#000" />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.btn, styles.btnGym, pressed && styles.btnPressed]}
          onPress={handleGymOwner}
        >
          <View style={styles.btnLeft}>
            <Feather name="users" size={20} color="#22C55E" />
          </View>
          <View style={styles.btnText}>
            <Text style={[styles.btnTitle, { color: "#FFF" }]}>Continue as Gym Owner</Text>
            <Text style={[styles.btnSub, { color: "#6B7280" }]}>Manage members, leads & earnings</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#6B7280" />
        </Pressable>

        <Text style={styles.legal}>
          By continuing, you agree to our{" "}
          <Text style={styles.link}>Terms</Text>
          {" "}and{" "}
          <Text style={styles.link}>Privacy Policy</Text>.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  hero: {
    alignItems: "center",
    gap: 8,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  brand: {
    fontSize: 32,
    fontWeight: "900" as const,
    color: "#FFF",
    letterSpacing: 2,
  },
  brandAccent: {
    color: "#22C55E",
  },
  tagline: {
    fontSize: 14,
    color: "#6B7280",
    letterSpacing: 0.5,
  },
  headline: {
    alignItems: "center",
    gap: 12,
  },
  h1: {
    fontSize: 30,
    fontWeight: "800" as const,
    color: "#FFF",
    textAlign: "center",
    lineHeight: 38,
  },
  h1Accent: {
    color: "#22C55E",
  },
  sub: {
    fontSize: 15,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 22,
  },
  actions: {
    gap: 12,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14,
  },
  btnUser: {
    backgroundColor: "#22C55E",
  },
  btnGym: {
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#262626",
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  btnLeft: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    flex: 1,
    gap: 2,
  },
  btnTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#000",
  },
  btnSub: {
    fontSize: 12,
    color: "rgba(0,0,0,0.6)",
  },
  legal: {
    textAlign: "center",
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
  },
  link: {
    color: "#22C55E",
  },
});
