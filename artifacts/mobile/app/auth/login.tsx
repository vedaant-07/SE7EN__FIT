import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator, Alert, Platform, Pressable,
  StyleSheet, Text, TextInput, View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

const G = "#20c55d";
const BG = "#050505";
const CARD = "#0d0d0d";
const BORDER = "#1e1e1e";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const passRef = useRef<TextInput>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  async function handleLogin() {
    if (!email.trim()) { Alert.alert("Required", "Please enter your email."); return; }
    if (!password) { Alert.alert("Required", "Please enter your password."); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (e: unknown) {
      Alert.alert("Login Failed", e instanceof Error ? e.message : "Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[s.container, { paddingTop: topPad + 16, paddingBottom: insets.bottom + 40 }]}
      keyboardShouldPersistTaps="handled"
      bottomOffset={24}
    >
      <Pressable style={s.back} onPress={() => router.back()}>
        <Feather name="arrow-left" size={22} color="#fff" />
        <Text style={s.backText}>Back</Text>
      </Pressable>

      <View style={s.header}>
        <View style={s.iconWrap}><Feather name="log-in" size={28} color="#fff" /></View>
        <Text style={s.title}>Welcome Back</Text>
        <Text style={s.subtitle}>Log in to your SE7ENFIT account</Text>
      </View>

      <View style={s.card}>
        <Pressable style={s.googleBtn} onPress={() => Alert.alert("Google Login", "Configure EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to enable Google login.")}>
          <Text style={s.googleG}>G</Text>
          <Text style={s.googleText}>Continue with Google</Text>
        </Pressable>

        <View style={s.divRow}>
          <View style={s.divLine} /><Text style={s.divText}>OR</Text><View style={s.divLine} />
        </View>

        <View style={s.field}>
          <Text style={s.label}>Email</Text>
          <View style={s.inputWrap}>
            <Feather name="mail" size={16} color={G} style={s.icon} />
            <TextInput
              style={s.input}
              placeholder="you@example.com"
              placeholderTextColor="#4b5563"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              value={email}
              onChangeText={setEmail}
              onSubmitEditing={() => passRef.current?.focus()}
            />
          </View>
        </View>

        <View style={s.field}>
          <View style={s.labelRow}>
            <Text style={s.label}>Password</Text>
            <Pressable><Text style={s.forgot}>Forgot password?</Text></Pressable>
          </View>
          <View style={s.inputWrap}>
            <Feather name="lock" size={16} color="#6b7280" style={s.icon} />
            <TextInput
              ref={passRef}
              style={[s.input, { flex: 1 }]}
              placeholder="••••••••"
              placeholderTextColor="#4b5563"
              secureTextEntry={!showPass}
              returnKeyType="done"
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleLogin}
            />
            <Pressable onPress={() => setShowPass(v => !v)} style={s.eye}>
              <Feather name={showPass ? "eye-off" : "eye"} size={16} color="#6b7280" />
            </Pressable>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [s.loginBtn, pressed && { opacity: 0.85 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#000" />
            : <Text style={s.loginBtnText}>Log in</Text>}
        </Pressable>
      </View>

      <Pressable onPress={() => router.push("/auth/register")} style={s.switchRow}>
        <Text style={s.switchText}>
          Don't have an account?{" "}<Text style={s.switchLink}>Create one</Text>
        </Text>
      </Pressable>
    </KeyboardAwareScrollView>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 24, gap: 24 },
  back: { flexDirection: "row", alignItems: "center", gap: 6 },
  backText: { color: "#fff", fontSize: 16 },
  header: { alignItems: "center", gap: 10 },
  iconWrap: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 26, fontWeight: "800", color: "#fff" },
  subtitle: { fontSize: 14, color: "#6b7280" },
  card: {
    backgroundColor: CARD, borderRadius: 20, padding: 24,
    gap: 20, borderWidth: 1, borderColor: BORDER,
  },
  googleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, backgroundColor: "#111", borderRadius: 12,
    paddingVertical: 14, borderWidth: 1, borderColor: "#2a2a2a",
  },
  googleG: { fontSize: 18, fontWeight: "700", color: "#fff" },
  googleText: { fontSize: 15, color: "#fff", fontWeight: "500" },
  divRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  divLine: { flex: 1, height: 1, backgroundColor: BORDER },
  divText: { fontSize: 12, color: "#6b7280" },
  field: { gap: 8 },
  label: { fontSize: 13, color: "#d1d5db", fontWeight: "600" },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  forgot: { fontSize: 13, color: G },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: BG, borderRadius: 12, borderWidth: 1, borderColor: G,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  icon: { marginRight: 10 },
  input: { color: "#fff", fontSize: 15, flex: 1, padding: 0 },
  eye: { paddingLeft: 8 },
  loginBtn: {
    backgroundColor: G, borderRadius: 12,
    paddingVertical: 16, alignItems: "center", justifyContent: "center",
  },
  loginBtnText: { fontSize: 16, fontWeight: "700", color: "#000" },
  switchRow: { alignItems: "center" },
  switchText: { fontSize: 14, color: "#6b7280" },
  switchLink: { color: G, fontWeight: "600" },
});
