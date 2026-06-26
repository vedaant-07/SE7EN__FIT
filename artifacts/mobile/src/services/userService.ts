import { api } from "./apiClient";
import type { DashboardData, User } from "../types";

export async function getDashboard(): Promise<DashboardData> {
  const res = await api.get<DashboardData>("/api/user/dashboard");
  return res;
}

export async function getProfile(): Promise<User> {
  const res = await api.get<{ user: User; profile: User }>("/api/user/profile");
  return res.user || res.profile || res as unknown as User;
}

export async function updateProfile(data: Partial<User>): Promise<User> {
  const res = await api.put<{ user: User }>("/api/user/profile", data);
  return res.user;
}

export async function getProgress(): Promise<object> {
  const res = await api.get<object>("/api/user/progress");
  return res;
}

export async function logWeight(weight: number, notes?: string): Promise<void> {
  await api.post("/api/user/progress/weight", { weight, notes });
}

export async function getReferrals(): Promise<{ code: string; count: number; converted: number; points: number; history: object[] }> {
  const res = await api.get<{ code: string; count: number; converted: number; points: number; history: object[] }>("/api/user/referrals");
  return res;
}

export async function getRewards(): Promise<{ points: number; badges: object[]; available: object[]; history: object[] }> {
  const res = await api.get<{ points: number; badges: object[]; available: object[]; history: object[] }>("/api/user/rewards");
  return res;
}

export async function getChallenges(): Promise<object[]> {
  const res = await api.get<{ challenges: object[] }>("/api/challenges");
  return res.challenges || [];
}

export async function joinChallenge(id: string): Promise<void> {
  await api.post(`/api/challenges/${id}/join`);
}

export async function getSubscriptionPlans(): Promise<object[]> {
  const res = await api.get<{ plans: object[] }>("/api/subscriptions/plans");
  return res.plans || [];
}

export async function getCurrentSubscription(): Promise<object | null> {
  try {
    const res = await api.get<{ subscription: object }>("/api/subscriptions/current");
    return res.subscription || null;
  } catch {
    return null;
  }
}

export interface OnboardingPayload {
  gender?: string;
  age_group?: string;
  height?: number;
  weight?: number;
  goal?: string;
  activity_level?: string;
  diet_preference?: string;
  workout_location?: string;
  onboarding_completed?: boolean;
}

import type { User } from "../types";

export async function completeOnboarding(payload: OnboardingPayload): Promise<User> {
  const res = await api.put<{ user: User }>("/api/user/profile", {
    ...payload,
    onboarding_completed: true,
  });
  return res.user || (res as unknown as User);
}
