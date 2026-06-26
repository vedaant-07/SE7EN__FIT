import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Platform, RefreshControl,
  ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/src/services/apiClient";

const G = "#20c55d";
const BG = "#050505";
const CARD = "#141414";
const BORDER = "#262626";

interface EarningsData {
  this_month: number; last_month: number; growth_pct: number; net_profit: number;
  monthly: Array<{ month: string; revenue: number; members: number }>;
  by_plan: Array<{ plan: string; count: number; revenue: number }>;
  expenses: Record<string, number>;
}

export default function EarningsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(isRefresh = false) {
    try {
      if (!isRefresh) setLoading(true);
      const res = await api.get<EarningsData>("/api/gym/earnings");
      setData(res);
    } catch { setData(null); }
    finally { setLoading(false); setRefreshing(false); }
  }

  useEffect(() => { load(); }, []);

  const maxRev = data ? Math.max(...data.monthly.map(m => m.revenue)) : 1;
  const totalExpenses = data ? Object.values(data.expenses).reduce((a, b) => a + b, 0) : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[s.container, { paddingTop: topPad + 16, paddingBottom: 100 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={G} />}
    >
      <Text style={s.title}>Earnings</Text>

      {loading || !data ? (
        <ActivityIndicator color={G} style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* Hero Revenue */}
          <View style={s.heroCard}>
            <View style={s.heroLeft}>
              <Text style={s.heroLabel}>This Month</Text>
              <Text style={s.heroAmount}>₹{(data.this_month / 100000).toFixed(2)}L</Text>
              <View style={s.growthBadge}>
                <Feather name="trending-up" size={11} color={G} />
                <Text style={s.growthText}>+{data.growth_pct}% vs last month</Text>
              </View>
            </View>
            <View style={s.heroRight}>
              <View style={s.miniStat}>
                <Text style={s.miniLabel}>Last Month</Text>
                <Text style={s.miniVal}>₹{(data.last_month / 100000).toFixed(1)}L</Text>
              </View>
              <View style={s.miniStat}>
                <Text style={s.miniLabel}>Net Profit</Text>
                <Text style={[s.miniVal, { color: G }]}>₹{(data.net_profit / 1000).toFixed(0)}K</Text>
              </View>
            </View>
          </View>

          {/* Revenue Chart */}
          <View style={s.chartCard}>
            <Text style={s.sectionTitle}>6-Month Revenue</Text>
            <View style={s.chart}>
              {data.monthly.map((m) => (
                <View key={m.month} style={s.barCol}>
                  <Text style={s.barAmount}>₹{(m.revenue / 1000).toFixed(0)}K</Text>
                  <View style={s.barTrack}>
                    <View style={[s.barFill, { height: `${(m.revenue / maxRev) * 100}%` as `${number}%` }]} />
                  </View>
                  <Text style={s.barMonth}>{m.month}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* By Plan */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Revenue by Plan</Text>
            <View style={s.planList}>
              {data.by_plan.map((p, i) => {
                const totalRev = data.by_plan.reduce((sum, x) => sum + x.revenue, 0);
                const pct = Math.round((p.revenue / totalRev) * 100);
                return (
                  <View key={p.plan} style={[s.planRow, i < data.by_plan.length - 1 && { borderBottomWidth: 1, borderBottomColor: "#1a1a1a" }]}>
                    <View style={{ flex: 1, gap: 4 }}>
                      <View style={s.planRowHeader}>
                        <Text style={s.planName}>{p.plan}</Text>
                        <Text style={s.planRevenue}>₹{(p.revenue / 100000).toFixed(2)}L</Text>
                      </View>
                      <View style={s.planBar}>
                        <View style={[s.planBarFill, { width: `${pct}%` as `${number}%` }]} />
                      </View>
                      <View style={s.planMeta}>
                        <Text style={s.planCount}>{p.count} members</Text>
                        <Text style={s.planPct}>{pct}%</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Expenses */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Monthly Expenses</Text>
            <View style={s.expenseList}>
              {Object.entries(data.expenses).map(([key, val], i, arr) => (
                <View key={key} style={[s.expRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: "#1a1a1a" }]}>
                  <Text style={s.expLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                  <Text style={s.expVal}>₹{(val as number).toLocaleString()}</Text>
                </View>
              ))}
              <View style={[s.expRow, s.expTotal]}>
                <Text style={s.expTotalLabel}>Total Expenses</Text>
                <Text style={s.expTotalVal}>₹{totalExpenses.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          {/* Profit Summary */}
          <View style={s.profitCard}>
            <View style={s.profitRow}>
              <Text style={s.profitLabel}>Revenue</Text>
              <Text style={s.profitRevenue}>₹{data.this_month.toLocaleString()}</Text>
            </View>
            <View style={s.profitRow}>
              <Text style={s.profitLabel}>Expenses</Text>
              <Text style={s.profitExpense}>-₹{totalExpenses.toLocaleString()}</Text>
            </View>
            <View style={s.profitDivider} />
            <View style={s.profitRow}>
              <Text style={s.profitLabelBold}>Net Profit</Text>
              <Text style={s.profitNet}>₹{data.net_profit.toLocaleString()}</Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 20 },
  title: { fontSize: 22, fontWeight: "800", color: "#fff" },
  heroCard: { backgroundColor: CARD, borderRadius: 18, padding: 18, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: G + "30" },
  heroLeft: { flex: 1, gap: 6 },
  heroLabel: { fontSize: 12, color: "#6B7280" },
  heroAmount: { fontSize: 36, fontWeight: "800", color: "#fff" },
  growthBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: G + "20", borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  growthText: { fontSize: 11, color: G, fontWeight: "700" },
  heroRight: { gap: 14, alignItems: "flex-end" },
  miniStat: { alignItems: "flex-end", gap: 2 },
  miniLabel: { fontSize: 10, color: "#6B7280" },
  miniVal: { fontSize: 16, fontWeight: "700", color: "#fff" },
  chartCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, gap: 16, borderWidth: 1, borderColor: BORDER },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#fff" },
  chart: { flexDirection: "row", alignItems: "flex-end", height: 100, gap: 6 },
  barCol: { flex: 1, alignItems: "center", gap: 4, height: "100%" },
  barAmount: { fontSize: 8, color: "#6B7280", textAlign: "center" },
  barTrack: { flex: 1, width: "100%", justifyContent: "flex-end", backgroundColor: "#1a1a1a", borderRadius: 4 },
  barFill: { width: "100%", backgroundColor: G, borderRadius: 4, minHeight: 4 },
  barMonth: { fontSize: 10, color: "#6B7280" },
  section: { gap: 12 },
  planList: { backgroundColor: CARD, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: BORDER },
  planRow: { padding: 14 },
  planRowHeader: { flexDirection: "row", justifyContent: "space-between" },
  planName: { fontSize: 13, fontWeight: "600", color: "#fff", flex: 1 },
  planRevenue: { fontSize: 13, fontWeight: "700", color: G },
  planBar: { height: 5, backgroundColor: "#1a1a1a", borderRadius: 3 },
  planBarFill: { height: 5, backgroundColor: G + "80", borderRadius: 3 },
  planMeta: { flexDirection: "row", justifyContent: "space-between" },
  planCount: { fontSize: 11, color: "#6B7280" },
  planPct: { fontSize: 11, color: "#6B7280" },
  expenseList: { backgroundColor: CARD, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: BORDER },
  expRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12 },
  expLabel: { fontSize: 13, color: "#9CA3AF" },
  expVal: { fontSize: 13, color: "#fff", fontWeight: "600" },
  expTotal: { backgroundColor: "#1a1a1a" },
  expTotalLabel: { fontSize: 13, fontWeight: "700", color: "#fff" },
  expTotalVal: { fontSize: 13, fontWeight: "700", color: "#f87171" },
  profitCard: { backgroundColor: "#071a0e", borderRadius: 14, padding: 16, gap: 10, borderWidth: 1, borderColor: G + "30" },
  profitRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  profitLabel: { fontSize: 13, color: "#9CA3AF" },
  profitRevenue: { fontSize: 15, fontWeight: "700", color: "#fff" },
  profitExpense: { fontSize: 15, fontWeight: "700", color: "#f87171" },
  profitDivider: { height: 1, backgroundColor: BORDER },
  profitLabelBold: { fontSize: 15, fontWeight: "700", color: "#fff" },
  profitNet: { fontSize: 22, fontWeight: "800", color: G },
});
