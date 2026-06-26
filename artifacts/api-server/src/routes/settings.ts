import { Router } from "express";

const router = Router();

const DEFAULT_SETTINGS = {
  notifications: {
    workout_reminders: true,
    meal_reminders: true,
    challenge_updates: true,
    achievement_alerts: true,
    weekly_report: true,
    marketing: false,
  },
  units: {
    weight: "kg",
    height: "cm",
    distance: "km",
    calories: "kcal",
  },
  workout: {
    rest_timer_sound: true,
    auto_advance: false,
    show_animations: true,
    default_rest_seconds: 60,
  },
  nutrition: {
    calorie_goal: 2200,
    protein_goal: 150,
    carbs_goal: 250,
    fat_goal: 60,
    water_goal_ml: 3000,
  },
  privacy: {
    show_on_leaderboard: true,
    share_progress: false,
    allow_friend_requests: true,
  },
  appearance: {
    theme: "dark",
    language: "en",
  },
};

const userSettings: Record<string, object> = {};

router.get("/settings", (req, res) => {
  res.json({ settings: { ...DEFAULT_SETTINGS, ...userSettings } });
});

router.put("/settings", (req, res) => {
  const updates = req.body as object;
  Object.assign(userSettings, updates);
  res.json({ settings: { ...DEFAULT_SETTINGS, ...userSettings }, message: "Settings updated" });
});

router.put("/settings/notifications", (req, res) => {
  const updates = req.body as object;
  if (!userSettings["notifications"]) userSettings["notifications"] = {};
  Object.assign(userSettings["notifications"] as object, updates);
  res.json({ notifications: { ...DEFAULT_SETTINGS.notifications, ...(userSettings["notifications"] as object) } });
});

router.post("/settings/reset", (req, res) => {
  Object.keys(userSettings).forEach(k => delete userSettings[k]);
  res.json({ settings: DEFAULT_SETTINGS, message: "Settings reset to defaults" });
});

export default router;
