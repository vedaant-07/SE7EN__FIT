import { api } from "./apiClient";
import type { WorkoutPlan, WorkoutSession, Exercise } from "../types";

export async function getWorkouts(): Promise<WorkoutPlan[]> {
  const res = await api.get<{ workouts: WorkoutPlan[] }>("/api/workouts");
  return res.workouts || [];
}

export async function getTodayWorkout(): Promise<WorkoutPlan | null> {
  try {
    const res = await api.get<{ workout: WorkoutPlan | null }>("/api/workouts/today");
    return res.workout || null;
  } catch {
    return null;
  }
}

export async function getWorkout(id: string): Promise<WorkoutPlan> {
  const res = await api.get<{ workout: WorkoutPlan }>(`/api/workouts/${id}`);
  return res.workout;
}

export async function startWorkout(id: string): Promise<void> {
  await api.post(`/api/workouts/${id}/start`);
}

export async function completeWorkout(id: string, session: WorkoutSession): Promise<void> {
  await api.post(`/api/workouts/${id}/complete`, session);
}

export async function getExercises(params?: {
  muscle_group?: string;
  equipment?: string;
  difficulty?: string;
}): Promise<Exercise[]> {
  const query = params
    ? "?" + new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString()
    : "";
  const res = await api.get<{ exercises: Exercise[] }>(`/api/exercises${query}`);
  return res.exercises || [];
}

export async function getExercise(id: string): Promise<Exercise> {
  const res = await api.get<{ exercise: Exercise }>(`/api/exercises/${id}`);
  return res.exercise;
}
