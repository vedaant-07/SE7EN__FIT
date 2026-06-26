import { api } from "./apiClient";

export async function getDailyTip(): Promise<string> {
  const res = await api.get<{ tip: string }>("/api/ai/daily-tip");
  return res.tip || "Stay consistent — every workout counts!";
}

export async function chatWithAI(message: string, context?: object): Promise<string> {
  const res = await api.post<{ reply: string; message: string }>("/api/ai/chat", {
    message,
    context: context || {},
  });
  return res.reply || res.message || "I'm here to help you reach your fitness goals!";
}

export async function generateWorkoutPlan(inputs: {
  goal: string;
  level: string;
  days_per_week: number;
  location: string;
  equipment?: string;
  time_per_session?: number;
  injuries?: string;
}): Promise<object> {
  const res = await api.post<{ plan: object }>("/api/ai/workout-plan", inputs);
  return res.plan || res;
}

export async function generateDietPlan(inputs: {
  goal: string;
  weight: number;
  height: number;
  age: number;
  diet_preference: string;
  budget?: string;
}): Promise<object> {
  const res = await api.post<{ plan: object }>("/api/ai/diet-plan", inputs);
  return res.plan || res;
}

export async function getProgressInsight(context: object): Promise<string> {
  const res = await api.post<{ insight: string }>("/api/ai/progress-insight", context);
  return res.insight || "Keep tracking your progress — you're doing great!";
}
