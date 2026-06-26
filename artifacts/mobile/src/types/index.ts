export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "gym_owner" | "admin";
  onboarding_completed?: boolean;
  avatar_url?: string;
  subscription_status?: "free" | "premium" | "gym_connected";
  goal?: string;
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  diet_preference?: string;
  activity_level?: string;
  referral_code?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  goal?: string;
  level?: string;
  duration_weeks?: number;
  days_per_week?: number;
  exercises?: Exercise[];
  assigned_by?: string;
  status?: string;
  description?: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscle_group?: string;
  target_muscle?: string;
  secondary_muscles?: string[];
  equipment?: string;
  difficulty?: string;
  instructions?: string;
  form_tips?: string;
  common_mistakes?: string;
  video_url?: string;
  thumbnail_url?: string;
  recommended_sets?: number;
  recommended_reps?: string;
  rest_seconds?: number;
  sets?: number;
  reps?: string;
  rest?: number;
}

export interface WorkoutSession {
  workout_id: string;
  started_at: string;
  completed_at?: string;
  duration_minutes?: number;
  exercises_completed?: number;
  calories_estimated?: number;
  notes?: string;
}

export interface MealLog {
  id?: string;
  meal_name: string;
  meal_type: "breakfast" | "lunch" | "snack" | "dinner";
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
  date?: string;
}

export interface HealthSummary {
  date: string;
  steps: number;
  calories: number;
  distance: number;
  active_minutes: number;
  workouts?: number;
  weight?: number;
  sleep_minutes?: number;
  source?: string;
  synced_at?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  goal?: string;
  reward_points?: number;
  progress?: number;
  deadline?: string;
  status?: "active" | "upcoming" | "completed";
  joined?: boolean;
}

export interface Reward {
  id: string;
  title: string;
  points_needed?: number;
  status?: string;
  description?: string;
}

export interface DashboardData {
  today_workout?: WorkoutPlan;
  daily_tip?: string;
  water_consumed?: number;
  water_target?: number;
  calories_consumed?: number;
  calories_target?: number;
  streak?: number;
  points?: number;
  referral_code?: string;
  subscription_status?: string;
  active_challenge?: Challenge;
}

export interface APIError {
  message: string;
  status?: number;
}
