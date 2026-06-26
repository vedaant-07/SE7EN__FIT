import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/src/services/apiClient";

const G = "#20c55d";
const BG = "#050505";
const CARD = "#0d0d0d";
const BORDER = "#1e1e1e";

interface Plan {
  id: string; name: string; price_monthly: number; price_yearly: number; currency: string;
  badge: string | null; popular: boolean;
  features: string[];
}

interface CurrentSub {
  id: string; plan_id: string; plan_name: string; status: string; started_at: string; renews_at: string | null; is_free: boolean;
}

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [plans, setPlans] = useState<Plan[]>([]);
  const [current, setCurrent] = useState<CurrentSub | null>(null);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [plansRes, subRes] = await Promise.allSettled([
          api.get<{ plans: Plan[] }>("/api/subscriptions/plans"),
          api.get<{ subscription: CurrentSub }>("/api/subscriptions/current"),
        ]);
        if (plansRes.status === "fulfilled") setPlans(plansRes.value.plans ?? []);
        if (subRes.status === "fulfilled") setCurrent(subRes.value.subscription ?? null);
      } catch {
        setPlans([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function upgrade(plan: Plan) {
    Alert.alert(
      "Upgrade to " + plan.name,
      `₹${billing === "monthly" ? plan.price_monthly : plan.price_yearly} / ${billing}. You'll be redirected to complete payment.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: async () => {
            setUpgrading(plan.id);
            try {
              await api.post("/api/subscriptions/upgrade", { plan_id: plan.id, payment_method: "razorpay" });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Payment Gateway", "Redirecting to Razorpay for payment. (Real payment integration coming soon)", [
                { text: "OK" },
              ]);
            } catch {
              Alert.alert("Error", "Could not initiate upgrade. Please try again.");
            } finally {
              setUpgrading(null);
            }
          },
        },
      ]
    );
  }

  const userPlans = plans.filter(p => p.id !== "gym_owner");
  const gymPlan = plans.find(p => p.id === "gym_owner");

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        contentContainerStyle={[s.container, { paddingTop: topPad + 16, paddingBottom: 60 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Pressable style={s.back} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>SE7ENFIT PRIME</Text>
            <Text style={s.sub}>Unlock your full potential</Text>
          </View>
        </View>

        {/* Current Plan */}
        {current && (
          <View style={s.currentCard}>
            <View style={s.currentLeft}>
              <View style={[s.currentDot, { backgroundColor: current.is_free ? "#6b7280" : G }]} />
              <View>
                <Text style={s.currentLabel}>Current Plan</Text>
                <Text style={s.currentPlan}>{current.plan_name}</Text>
              </View>
            </View>
            <View style={[s.statusBadge, { backgroundColor: current.is_free ? "#374151" : G + "20", borderColor: current.is_free ? "#374151" : G + "40" }]}>
              <Text style={[s.statusText, { color: current.is_free ? "#9ca3af" : G }]}>
                {current.is_free ? "Free" : "Active"}
              </Text>
            </View>
          </View>
        )}

        {/* Billing Toggle */}
        <View style={s.billingToggle}>
          <Pressable
            style={[s.billingBtn, billing === "monthly" && s.billingBtnActive]}
            onPress={() => setBilling("monthly")}
          >
            <Text style={[s.billingText, billing === "monthly" && s.billingTextActive]}>Monthly</Text>
          </Pressable>
          <Pressable
            style={[s.billingBtn, billing === "yearly" && s.billingBtnActive]}
            onPress={() => setBilling("yearly")}
          >
            <Text style={[s.billingText, billing === "yearly" && s.billingTextActive]}>Yearly</Text>
            <View style={s.saveBadge}>
              <Text style={s.saveText}>Save 33%</Text>
            </View>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator color={G} style={{ marginTop: 40 }} />
        ) : (
          <>
            {userPlans.map(plan => {
              const price = billing === "monthly" ? plan.price_monthly : plan.price_yearly;
              const isCurrentPlan = current?.plan_id === plan.id;
              const isFree = plan.price_monthly === 0;

              return (
                <View key={plan.id} style={[s.planCard, plan.popular && s.planCardPopular, isCurrentPlan && { borderColor: G }]}>
                  {plan.badge && (
                    <View style={s.planBadge}>
                      <Text style={s.planBadgeText}>{plan.badge}</Text>
                    </View>
                  )}

                  <View style={s.planHeader}>
                    <View>
                      <Text style={s.planName}>{plan.name}</Text>
                      <View style={s.planPriceRow}>
                        {isFree ? (
                          <Text style={s.planPriceFree}>Free Forever</Text>
                        ) : (
                          <>
                            <Text style={s.planPrice}>₹{billing === "monthly" ? price : Math.round(price / 12)}</Text>
                            <Text style={s.planPricePer}>/month</Text>
                          </>
                        )}
                      </View>
                      {!isFree && billing === "yearly" && (
                        <Text style={s.planYearlyNote}>₹{price} billed annually</Text>
                      )}
                    </View>
                    {plan.popular && (
                      <View style={s.popularIcon}>
                        <Feather name="zap" size={18} color="#000" />
                      </View>
                    )}
                  </View>

                  <View style={s.divider} />

                  <View style={s.featList}>
                    {plan.features.map(f => (
                      <View key={f} style={s.featRow}>
                        <Feather name="check" size={13} color={G} />
                        <Text style={s.featText}>{f}</Text>
                      </View>
                    ))}
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      s.upgradeBtn,
                      isFree && s.upgradeBtnFree,
                      isCurrentPlan && s.upgradeBtnCurrent,
                      plan.popular && !isCurrentPlan && !isFree && s.upgradeBtnPopular,
                      pressed && !isCurrentPlan && { opacity: 0.85 },
                    ]}
                    onPress={() => !isCurrentPlan && !isFree && upgrade(plan)}
                    disabled={isCurrentPlan || isFree || upgrading === plan.id}
                  >
                    {upgrading === plan.id
                      ? <ActivityIndicator color={plan.popular ? "#000" : G} />
                      : <Text style={[s.upgradeBtnText, !plan.popular && !isCurrentPlan && !isFree && { color: G }]}>
                          {isCurrentPlan ? "Current Plan" : isFree ? "Free Plan" : `Upgrade to ${billing === "monthly" ? "Monthly" : "Annual"}`}
                        </Text>}
                  </Pressable>
                </View>
              );
            })}

            {/* Gym Plan Teaser */}
            {gymPlan && (
              <View style={s.gymPlanCard}>
                <View style={s.gymPlanLeft}>
                  <Feather name="home" size={20} color="#a78bfa" />
                  <View>
                    <Text style={s.gymPlanTitle}>{gymPlan.name}</Text>
                    <Text style={s.gymPlanPrice}>₹{gymPlan.price_monthly}/mo · For gym owners</Text>
                  </View>
                </View>
                <Pressable style={s.gymLearnBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                  <Text style={s.gymLearnText}>Learn more</Text>
                </Pressable>
              </View>
            )}

            <Text style={s.legal}>Payments are processed securely via Razorpay. Cancel anytime from your account settings. GST applicable.</Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 14 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: CARD, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: BORDER },
  title: { fontSize: 20, fontWeight: "800", color: "#fff" },
  sub: { fontSize: 12, color: "#6b7280" },
  currentCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: CARD, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: BORDER },
  currentLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  currentDot: { width: 10, height: 10, borderRadius: 5 },
  currentLabel: { fontSize: 11, color: "#6b7280" },
  currentPlan: { fontSize: 15, fontWeight: "700", color: "#fff" },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: "700" },
  billingToggle: { flexDirection: "row", backgroundColor: CARD, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: BORDER },
  billingBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 9, gap: 6 },
  billingBtnActive: { backgroundColor: G },
  billingText: { fontSize: 14, color: "#6b7280", fontWeight: "600" },
  billingTextActive: { color: "#000", fontWeight: "700" },
  saveBadge: { backgroundColor: "#fbbf2430", borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 },
  saveText: { fontSize: 9, fontWeight: "700", color: "#fbbf24" },
  planCard: { backgroundColor: CARD, borderRadius: 18, padding: 20, gap: 16, borderWidth: 1, borderColor: BORDER, position: "relative" },
  planCardPopular: { borderColor: G + "60", backgroundColor: "#071a0e" },
  planBadge: { position: "absolute", top: -12, right: 16, backgroundColor: G, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  planBadgeText: { fontSize: 11, fontWeight: "700", color: "#000" },
  planHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  planName: { fontSize: 17, fontWeight: "800", color: "#fff" },
  planPriceRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 4 },
  planPrice: { fontSize: 32, fontWeight: "800", color: "#fff" },
  planPricePer: { fontSize: 13, color: "#6b7280" },
  planPriceFree: { fontSize: 22, fontWeight: "800", color: "#6b7280", marginTop: 4 },
  planYearlyNote: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  popularIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: G, alignItems: "center", justifyContent: "center" },
  divider: { height: 1, backgroundColor: BORDER },
  featList: { gap: 10 },
  featRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  featText: { fontSize: 13, color: "#d1d5db", flex: 1, lineHeight: 20 },
  upgradeBtn: { borderRadius: 14, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: G },
  upgradeBtnFree: { borderColor: BORDER, backgroundColor: "transparent" },
  upgradeBtnCurrent: { borderColor: BORDER, backgroundColor: BORDER },
  upgradeBtnPopular: { backgroundColor: G, borderColor: G },
  upgradeBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  gymPlanCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#120a1f", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#a78bfa30" },
  gymPlanLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  gymPlanTitle: { fontSize: 14, fontWeight: "700", color: "#fff" },
  gymPlanPrice: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  gymLearnBtn: { backgroundColor: "#a78bfa20", borderRadius: 9, paddingHorizontal: 12, paddingVertical: 7 },
  gymLearnText: { fontSize: 12, color: "#a78bfa", fontWeight: "600" },
  legal: { fontSize: 11, color: "#374151", textAlign: "center", lineHeight: 17 },
});
