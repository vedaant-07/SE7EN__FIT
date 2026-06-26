import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator, FlatList, KeyboardAvoidingView, Platform,
  Pressable, StyleSheet, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { chatWithAI } from "@/src/services/aiService";

const G = "#20c55d";
const BG = "#050505";
const CARD = "#0d0d0d";
const BORDER = "#1e1e1e";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  ts: number;
}

const SUGGESTED = [
  "Create a fat loss workout for me",
  "Give me a high protein Indian diet plan",
  "How do I do squats safely?",
  "Analyze my progress",
  "What should I train today?",
  "I missed gym for 3 days, what now?",
];

export default function AICoachScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatRef = useRef<FlatList>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  async function send(text: string) {
    if (!text.trim() || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: text.trim(), ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const ctx = {
        user_goal: user?.goal,
        diet_preference: user?.diet_preference,
        age: user?.age,
        height: user?.height,
        weight: user?.weight,
      };
      const reply = await chatWithAI(text.trim(), ctx);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "ai", text: reply, ts: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e: unknown) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(), role: "ai",
        text: e instanceof Error ? e.message : "I'm having trouble connecting right now. Please try again.",
        ts: Date.now(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* Header */}
      <View style={[s.header, { paddingTop: topPad + 16 }]}>
        <View style={s.headerLeft}>
          <View style={s.aiAvatar}><Feather name="cpu" size={20} color={G} /></View>
          <View>
            <Text style={s.title}>AI Coach</Text>
            <View style={s.onlineRow}>
              <View style={s.onlineDot} />
              <Text style={s.onlineText}>Powered by Gemini</Text>
            </View>
          </View>
        </View>
        <View style={s.primeTag}><Text style={s.primeText}>PRIME</Text></View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={[s.chatList, { paddingBottom: 20 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.emptyChat}>
            <View style={s.emptyChatIcon}><Feather name="cpu" size={36} color={G} /></View>
            <Text style={s.emptyChatTitle}>Your AI Fitness Coach</Text>
            <Text style={s.emptyChatSub}>
              Ask me anything about workouts, diet, supplements, injury prevention, or your progress.
              I'll give you personalized advice powered by Gemini AI.
            </Text>
            <View style={s.suggestedGrid}>
              {SUGGESTED.map(q => (
                <Pressable key={q} style={s.suggChip} onPress={() => send(q)}>
                  <Text style={s.suggText}>{q}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        renderItem={({ item: m }) => (
          <View style={[s.bubble, m.role === "user" ? s.bubbleUser : s.bubbleAI]}>
            {m.role === "ai" && (
              <View style={s.aiBubbleAvatar}><Feather name="cpu" size={14} color={G} /></View>
            )}
            <View style={[s.bubbleInner, m.role === "user" ? s.bubbleInnerUser : s.bubbleInnerAI]}>
              <Text style={[s.bubbleText, m.role === "user" ? s.bubbleTextUser : s.bubbleTextAI]}>
                {m.text}
              </Text>
            </View>
          </View>
        )}
      />

      {loading && (
        <View style={s.typingRow}>
          <View style={s.aiBubbleAvatar}><Feather name="cpu" size={14} color={G} /></View>
          <View style={s.typingBubble}>
            <ActivityIndicator size="small" color={G} />
            <Text style={s.typingText}>AI is thinking…</Text>
          </View>
        </View>
      )}

      {/* Suggested (when chat active) */}
      {messages.length > 0 && !loading && (
        <View>
          <FlatList
            horizontal
            data={SUGGESTED.slice(0, 3)}
            keyExtractor={q => q}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 8 }}
            renderItem={({ item: q }) => (
              <Pressable style={s.suggChipSmall} onPress={() => send(q)}>
                <Text style={s.suggTextSmall} numberOfLines={1}>{q}</Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* Input */}
      <View style={[s.inputBar, { paddingBottom: insets.bottom + 10 }]}>
        <TextInput
          style={s.inputField}
          placeholder="Ask your AI Coach anything…"
          placeholderTextColor="#4b5563"
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={() => send(input)}
        />
        <Pressable
          style={[s.sendBtn, (!input.trim() || loading) && s.sendBtnDisabled]}
          onPress={() => send(input)}
          disabled={!input.trim() || loading}
        >
          <Feather name="send" size={18} color={!input.trim() || loading ? "#374151" : "#000"} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  aiAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: G + "20", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: G + "40" },
  title: { fontSize: 17, fontWeight: "700", color: "#fff" },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: G },
  onlineText: { fontSize: 11, color: "#6b7280" },
  primeTag: { backgroundColor: G + "20", borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  primeText: { fontSize: 10, fontWeight: "700", color: G },
  chatList: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  emptyChat: { flex: 1, alignItems: "center", paddingTop: 40, gap: 16, paddingHorizontal: 4 },
  emptyChatIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: G + "15", alignItems: "center", justifyContent: "center" },
  emptyChatTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  emptyChatSub: { fontSize: 14, color: "#9ca3af", textAlign: "center", lineHeight: 21 },
  suggestedGrid: { width: "100%", gap: 8 },
  suggChip: { backgroundColor: CARD, borderRadius: 12, padding: 13, borderWidth: 1, borderColor: BORDER },
  suggText: { fontSize: 13, color: "#d1d5db" },
  bubble: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  bubbleUser: { justifyContent: "flex-end" },
  bubbleAI: { justifyContent: "flex-start" },
  aiBubbleAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: G + "15", alignItems: "center", justifyContent: "center", marginBottom: 2 },
  bubbleInner: { maxWidth: "80%", borderRadius: 16, padding: 13 },
  bubbleInnerUser: { backgroundColor: G, borderBottomRightRadius: 4 },
  bubbleInnerAI: { backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  bubbleTextUser: { color: "#000", fontWeight: "500" },
  bubbleTextAI: { color: "#e5e7eb" },
  typingRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  typingBubble: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: CARD, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: BORDER },
  typingText: { fontSize: 12, color: "#6b7280" },
  suggChipSmall: { backgroundColor: CARD, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: BORDER, maxWidth: 180 },
  suggTextSmall: { fontSize: 12, color: "#9ca3af" },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: BORDER, backgroundColor: BG },
  inputField: { flex: 1, backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, paddingVertical: 12, color: "#fff", fontSize: 14, maxHeight: 120 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: G, alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
});
