import { api } from "./apiClient";
import type { MealLog } from "../types";

export async function getMealLogs(date?: string): Promise<MealLog[]> {
  const query = date ? `?date=${date}` : "";
  const res = await api.get<{ meals: MealLog[] }>(`/api/diet/meal-log${query}`);
  return res.meals || [];
}

export async function logMeal(meal: MealLog): Promise<void> {
  await api.post("/api/diet/meal-log", meal);
}

export async function getTodayWater(): Promise<{ consumed: number; target: number }> {
  const res = await api.get<{ consumed: number; target: number }>("/api/diet/water/today");
  return { consumed: res.consumed || 0, target: res.target || 3000 };
}

export async function logWater(amount_ml: number): Promise<void> {
  await api.post("/api/diet/water", { amount_ml });
}

export async function getDietPlan(): Promise<object | null> {
  try {
    const res = await api.get<{ diet_plan: object }>("/api/diet");
    return res.diet_plan || null;
  } catch {
    return null;
  }
}
