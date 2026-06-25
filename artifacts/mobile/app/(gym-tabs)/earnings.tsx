import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Period = "weekly" | "monthly" | "yearly";

const MONTHLY_DATA = [68000, 82000, 75000, 95000, 88000, 110000, 102000, 118000, 124500];
const MONTH_LABELS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];

const TRANSACTIONS = [
  { id: "1", name: "Priya Verma", plan: "Annual Renewal", amount: 14000, date: "Today", type: "in" },
  { id: "2", name: "Arjun Sharma", plan: "6-Month", amount: 8000, date: "Yesterday", type: "in" },
  { id: "3", name: "Equipment Maintenance", plan: "Expense", amount: 3500, date: "2d ago", type: "out" },
  { id: "4", name: "Neha Joshi", plan: "3-Month", amount: 4500, date: "3d ago", type: "in" },
  { id: "5", name: "Electricity Bill", plan: "Expense", amount: 5200, date: "5d ago", type: "out" },
  { id: "6", name: "Deepak Kumar", plan: "6-Month", amount: 8000, date: "1w ago", type: "in" },
  { id: "7", name: "Asha Nair", plan: "Annual", amount: 14000, date: "1w ago", type: "in" },
];

const PLAN_BREAKDOWN = [
  { plan: "Annual", members: 45, revenue: 63000, color: "#22C55E" },
  { plan: "6-Month", members: 78, revenue: 62400, color: "#3B82F6" },
  { plan: "3-Month", members: 92, revenue: 41400, color: "#F97316" },
  { plan: "Monthly", members: 33, revenue: 49500, color: "#8B5CF6" },
];

export default function EarningsScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>("monthly");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const totalRevenue = 124500;
  const totalExpenses = 28400;
  const netProfit = totalRevenue - totalExpenses;

  const maxRevenue = Math.max(...MONTHLY_DATA);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.container, { paddingTop: topPad + 16, paddingBottom: (Platform.OS === "web" ? 34 : 0) + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Earnings</Text>

      {/* Period Toggle */}
      <View style={styles.periodToggle}>
        {(["weekly", "monthly", "yearly"] as Period[]).map(p => (
          <Pressable
            key={p}
            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, { borderColor: "#22C55E30" }]}>
          <View style={styles.summaryTop}>
            <Feather name="arrow-down-left" size={14} color="#22C55E" />
            <Text style={styles.summaryLabel}>Revenue</Text>
          </View>
          <Text style={styles.summaryValue}>₹{totalRevenue.toLocaleString()}</Text>
          <Text style={styles.summaryChange}>+18% vs last month</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: "#EF444430" }]}>
          <View style={styles.summaryTop}>
            <Feather name="arrow-up-right" size={14} color="#EF4444" />
            <Text style={styles.summaryLabel}>Expenses</Text>
          </View>
          <Text style={[styles.summaryValue, { color: "#EF4444" }]}>₹{totalExpenses.toLocaleString()}</Text>
          <Text style={styles.summaryChange}>-5% vs last month</Text>
        </View>
      </View>

      <View style={[styles.summaryCard, styles.netCard]}>
        <View style={styles.netRow}>
          <View>
            <Text style={styles.netLabel}>Net Profit</Text>
            <Text style={styles.netValue}>₹{netProfit.toLocaleString()}</Text>
          </View>
          <View style={styles.netPct}>
            <Feather name="trending-up" size={20} color="#22C55E" />
            <Text style={styles.netPctText}>{Math.round(netProfit / totalRevenue * 100)}%</Text>
          </View>
        </View>
        <View style={styles.netBar}>
          <View style={[styles.netFill, { width: `${netProfit / totalRevenue * 100}%` }]} />
        </View>
        <Text style={styles.netSub}>Profit margin</Text>
      </View>

      {/* Revenue Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Revenue Trend</Text>
        <View style={styles.chart}>
          {MONTHLY_DATA.map((v, i) => {
            const pct = v / maxRevenue;
            return (
              <View key={i} style={styles.chartCol}>
                <Text style={styles.chartVal}>
                  {v >= 100000 ? `${(v / 100000).toFixed(1)}L` : `${(v / 1000).toFixed(0)}K`}
                </Text>
                <View style={styles.chartBarWrap}>
                  <View style={[styles.chartBar, { height: `${pct * 100}%`, backgroundColor: i === MONTHLY_DATA.length - 1 ? "#22C55E" : "#22C55E60" }]} />
                </View>
                <Text style={styles.chartLabel}>{MONTH_LABELS[i]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Plan Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Revenue by Plan</Text>
        {PLAN_BREAKDOWN.map(p => (
          <View key={p.plan} style={styles.planRow}>
            <View style={[styles.planDot, { backgroundColor: p.color }]} />
            <Text style={styles.planName}>{p.plan}</Text>
            <Text style={styles.planMembers}>{p.members} members</Text>
            <Text style={[styles.planRevenue, { color: p.color }]}>₹{p.revenue.toLocaleString()}</Text>
          </View>
        ))}
      </View>

      {/* Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.txCard}>
          {TRANSACTIONS.map((tx, i) => (
            <View key={tx.id} style={[styles.txRow, i < TRANSACTIONS.length - 1 && styles.txRowBorder]}>
              <View style={[styles.txIcon, { backgroundColor: tx.type === "in" ? "#22C55E15" : "#EF444415" }]}>
                <Feather
                  name={tx.type === "in" ? "arrow-down-left" : "arrow-up-right"}
                  size={14}
                  color={tx.type === "in" ? "#22C55E" : "#EF4444"}
                />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txName}>{tx.name}</Text>
                <Text style={styles.txPlan}>{tx.plan} · {tx.date}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.type === "in" ? "#22C55E" : "#EF4444" }]}>
                {tx.type === "in" ? "+" : "-"}₹{tx.amount.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#0A0A0A" },
  container: { paddingHorizontal: 20, gap: 20 },
  title: { fontSize: 26, fontWeight: "800" as const, color: "#FFF" },
  periodToggle: {
    flexDirection: "row",
    backgroundColor: "#141414",
    borderRadius: 12,
    padding: 4,
  },
  periodBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 9 },
  periodBtnActive: { backgroundColor: "#22C55E" },
  periodText: { fontSize: 13, color: "#6B7280", fontWeight: "600" as const },
  periodTextActive: { color: "#000" },
  summaryGrid: { flexDirection: "row", gap: 12 },
  summaryCard: {
    flex: 1,
    backgroundColor: "#141414",
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#262626",
  },
  summaryTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  summaryLabel: { fontSize: 12, color: "#6B7280" },
  summaryValue: { fontSize: 20, fontWeight: "800" as const, color: "#22C55E" },
  summaryChange: { fontSize: 11, color: "#6B7280" },
  netCard: {
    flex: undefined,
    gap: 10,
    borderColor: "#22C55E20",
  },
  netRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  netLabel: { fontSize: 13, color: "#6B7280" },
  netValue: { fontSize: 26, fontWeight: "800" as const, color: "#FFF", marginTop: 2 },
  netPct: { flexDirection: "row", alignItems: "center", gap: 6 },
  netPctText: { fontSize: 22, fontWeight: "800" as const, color: "#22C55E" },
  netBar: { height: 6, backgroundColor: "#262626", borderRadius: 3 },
  netFill: { height: 6, backgroundColor: "#22C55E", borderRadius: 3 },
  netSub: { fontSize: 11, color: "#6B7280" },
  chartCard: { backgroundColor: "#141414", borderRadius: 16, padding: 16, gap: 16, borderWidth: 1, borderColor: "#262626" },
  chart: { flexDirection: "row", alignItems: "flex-end", height: 100, gap: 4 },
  chartCol: { flex: 1, alignItems: "center", height: "100%", gap: 4 },
  chartVal: { fontSize: 7, color: "#6B7280" },
  chartBarWrap: { flex: 1, width: "80%", justifyContent: "flex-end" },
  chartBar: { width: "100%", borderRadius: 3, minHeight: 6 },
  chartLabel: { fontSize: 8, color: "#6B7280" },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const, color: "#FFF" },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#141414",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#262626",
  },
  planDot: { width: 10, height: 10, borderRadius: 5 },
  planName: { flex: 1, fontSize: 13, color: "#FFF", fontWeight: "600" as const },
  planMembers: { fontSize: 12, color: "#6B7280" },
  planRevenue: { fontSize: 14, fontWeight: "700" as const },
  txCard: { backgroundColor: "#141414", borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: "#262626" },
  txRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  txRowBorder: { borderBottomWidth: 1, borderBottomColor: "#1F1F1F" },
  txIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  txInfo: { flex: 1, gap: 2 },
  txName: { fontSize: 13, fontWeight: "600" as const, color: "#FFF" },
  txPlan: { fontSize: 11, color: "#6B7280" },
  txAmount: { fontSize: 14, fontWeight: "700" as const },
});
