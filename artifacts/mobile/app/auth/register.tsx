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

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function handlePhoneChange(text: string) {
    const digits = text.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
  }

  async function handleRegister() {
    if (!name.trim()) { Alert.alert("Required", "Please enter your full name."); return; }
    if (!email.trim()) { Alert.alert("Required", "Please enter your email."); return; }
    if (phone.length !== 10) { Alert.alert("Invalid", "Phone number must be exactly 10 digits."); return; }
    if (password.length < 6) { Alert.alert("Weak Password", "Password must be at least 6 characters."); return; }
    if (password !== confirmPass) { Alert.alert("Mismatch", "Passwords do not match."); return; }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim().toLowerCase(), phone, password });
    } catch (e: unknown) {
      Alert.alert("Registration Failed", e instanceof Error ? e.message : "Please try again.");
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
        <View style={s.iconWrap}><Feather name="user-plus" size={28} color="#fff" /></View>
        <Text style={s.title}>Create Account</Text>
        <Text style={s.subtitle}>Join SE7ENFIT — India's #1 AI Fitness App</Text>
      </View>

      <View style={s.card}>
        <Pressable style={s.googleBtn} onPress={() => Alert.alert("Google Login", "Configure EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to enable Google sign-up.")}>
          <Text style={s.googleG}>G</Text>
          <Text style={s.googleText}>Continue with Google</Text>
        </Pressable>

        <View style={s.divRow}>
          <View style={s.divLine} /><Text style={s.divText}>OR</Text><View style={s.divLine} />
        </View>

        {[
          {
            label: "Full Name", icon: "user" as const, value: name, set: setName,
            placeholder: "Your full name", autoCapitalize: "words" as const, keyboardType: "default" as const,
            ref: undefined as React.RefObject<TextInput> | undefined, next: emailRef,
          },
          {
            label: "Email", icon: "mail" as const, value: email, set: setEmail,
            placeholder: "you@example.com", autoCapitalize: "none" as const, keyboardType: "email-address" as const,
            ref: emailRef, next: phoneRef,
          },
        ].map((f) => (
          <View key={f.label} style={s.field}>
            <Text style={s.label}>{f.label}</Text>
            <View style={s.inputWrap}>
              <Feather name={f.icon} size={16} color="#6b7280" style={s.icon} />
              <TextInput
                ref={f.ref}
                style={s.input}
                placeholder={f.placeholder}
                placeholderTextColor="#4b5563"
                autoCapitalize={f.autoCapitalize}
                keyboardType={f.keyboardType}
                autoCorrect={false}
                returnKeyType="next"
                value={f.value}
                onChangeText={f.set}
                onSubmitEditing={() => f.next?.current?.focus()}
              />
            </View>
          </View>
        ))}

        <View style={s.field}>
          <Text style={s.label}>Phone <Text style={s.labelHint}>(10 digits)</Text></Text>
          <View style={s.inputWrap}>
            <Feather name="phone" size={16} color="#6b7280" style={s.icon} />
            <TextInput
              ref={phoneRef}
              style={s.input}
              placeholder="9876543210"
              placeholderTextColor="#4b5563"
              keyboardType="number-pad"
              returnKeyType="next"
              value={phone}
              onChangeText={handlePhoneChange}
              onSubmitEditing={() => passRef.current?.focus()}
              maxLength={10}
            />
            {phone.length === 10 && <Feather name="check-circle" size={16} color={G} />}
          </View>
        </View>

        <View style={s.field}>
          <Text style={s.label}>Password</Text>
          <View style={s.inputWrap}>
            <Feather name="lock" size={16} color="#6b7280" style={s.icon} />
            <TextInput
              ref={passRef}
              style={[s.input, { flex: 1 }]}
              placeholder="Min 6 characters"
              placeholderTextColor="#4b5563"
              secureTextEntry={!showPass}
              returnKeyType="next"
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={() => confirmRef.current?.focus()}
            />
            <Pressable onPress={() => setShowPass(v => !v)} style={s.eye}>
              <Feather name={showPass ? "eye-off" : "eye"} size={16} color="#6b7280" />
            </Pressable>
          </View>
        </View>

        <View style={s.field}>
          <Text style={s.label}>Confirm Password</Text>
          <View style={[s.inputWrap, confirmPass && password !== confirmPass ? s.inputError : {}]}>
            <Feather name="lock" size={16} color="#6b7280" style={s.icon} />
            <TextInput
              ref={confirmRef}
              style={s.input}
              placeholder="Repeat password"
              placeholderTextColor="#4b5563"
              secureTextEntry={!showPass}
              returnKeyType="done"
              value={confirmPass}
              onChangeText={setConfirmPass}
              onSubmitEditing={handleRegister}
            />
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [s.regBtn, pressed && { opacity: 0.85 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#000" />
            : <Text style={s.regBtnText}>Create Account</Text>}
        </Pressable>
      </View>

      <Pressable onPress={() => router.push("/auth/login")} style={s.switchRow}>
        <Text style={s.switchText}>
          Already have an account?{" "}<Text style={s.switchLink}>Log in</Text>
        </Text>
      </Pressable>
    </KeyboardAwareScrollView>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 24, gap: 22 },
  back: { flexDirection: "row", alignItems: "center", gap: 6 },
  backText: { color: "#fff", fontSize: 16 },
  header: { alignItems: "center", gap: 10 },
  iconWrap: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 26, fontWeight: "800", color: "#fff" },
  subtitle: { fontSize: 13, color: "#6b7280", textAlign: "center" },
  card: { backgroundColor: CARD, borderRadius: 20, padding: 24, gap: 18, borderWidth: 1, borderColor: BORDER },
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
  labelHint: { color: "#6b7280", fontWeight: "400" },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  inputError: { borderColor: "#ef4444" },
  icon: { marginRight: 10 },
  input: { color: "#fff", fontSize: 15, flex: 1, padding: 0 },
  eye: { paddingLeft: 8 },
  regBtn: {
    backgroundColor: G, borderRadius: 12,
    paddingVertical: 16, alignItems: "center", justifyContent: "center",
  },
  regBtnText: { fontSize: 16, fontWeight: "700", color: "#000" },
  switchRow: { alignItems: "center" },
  switchText: { fontSize: 14, color: "#6b7280" },
  switchLink: { color: G, fontWeight: "600" },
});
