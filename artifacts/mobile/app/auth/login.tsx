import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login, pendingRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const role = pendingRole ?? "user";

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Required", "Please enter your email and password.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      await login(email.trim(), password, role);
    } catch {
      Alert.alert("Error", "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <KeyboardAwareScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.container, { paddingTop: topPad + 16, paddingBottom: insets.bottom + 32 }]}
      keyboardShouldPersistTaps="handled"
      bottomOffset={24}
    >
      <Pressable style={styles.back} onPress={() => router.back()}>
        <Feather name="arrow-left" size={22} color="#FFF" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Feather name="log-in" size={28} color="#FFF" />
        </View>
        <Text style={styles.title}>User Login</Text>
        <Text style={styles.subtitle}>Log in to your fitness account</Text>
      </View>

      <View style={styles.card}>
        <Pressable style={styles.googleBtn} onPress={() => {}}>
          <Text style={styles.googleG}>G</Text>
          <Text style={styles.googleText}>Continue with Google</Text>
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.divLine} />
          <Text style={styles.divText}>OR</Text>
          <View style={styles.divLine} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrap}>
            <Feather name="mail" size={16} color="#22C55E" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#4B5563"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Password</Text>
            <Pressable onPress={() => {}}>
              <Text style={styles.forgot}>Forgot password?</Text>
            </Pressable>
          </View>
          <View style={styles.inputWrap}>
            <Feather name="lock" size={16} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="••••••••"
              placeholderTextColor="#4B5563"
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
              <Feather name={showPass ? "eye-off" : "eye"} size={16} color="#6B7280" />
            </Pressable>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.loginBtn, pressed && { opacity: 0.85 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.loginBtnText}>Log in</Text>
          )}
        </Pressable>
      </View>

      <Pressable onPress={() => router.push("/auth/register")} style={styles.switchRow}>
        <Text style={styles.switchText}>
          Don't have an account?{" "}
          <Text style={styles.switchLink}>Create one</Text>
        </Text>
      </Pressable>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#0A0A0A" },
  container: {
    paddingHorizontal: 24,
    gap: 24,
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backText: { color: "#FFF", fontSize: 16 },
  header: { alignItems: "center", gap: 8 },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#141414",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#262626",
  },
  title: { fontSize: 24, fontWeight: "800" as const, color: "#FFF" },
  subtitle: { fontSize: 14, color: "#6B7280" },
  card: {
    backgroundColor: "#141414",
    borderRadius: 20,
    padding: 24,
    gap: 20,
    borderWidth: 1,
    borderColor: "#262626",
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#1F1F1F",
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#333",
  },
  googleG: { fontSize: 18, fontWeight: "700" as const, color: "#FFF" },
  googleText: { fontSize: 15, color: "#FFF", fontWeight: "500" as const },
  divider: { flexDirection: "row", alignItems: "center", gap: 12 },
  divLine: { flex: 1, height: 1, backgroundColor: "#262626" },
  divText: { fontSize: 12, color: "#6B7280" },
  field: { gap: 8 },
  label: { fontSize: 13, color: "#D1D5DB", fontWeight: "600" as const },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  forgot: { fontSize: 13, color: "#22C55E" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#22C55E",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  inputIcon: { marginRight: 10 },
  input: {
    color: "#FFF",
    fontSize: 15,
    flex: 1,
    padding: 0,
  },
  eyeBtn: { paddingLeft: 8 },
  loginBtn: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtnText: { fontSize: 16, fontWeight: "700" as const, color: "#000" },
  switchRow: { alignItems: "center" },
  switchText: { fontSize: 14, color: "#6B7280" },
  switchLink: { color: "#22C55E", fontWeight: "600" as const },
});
