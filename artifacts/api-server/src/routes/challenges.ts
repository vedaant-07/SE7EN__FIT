import { Router } from "express";

const router = Router();

const CHALLENGES = [
  {
    id: "c1", title: "30-Day Plank Challenge", description: "Hold a plank every day for 30 days. Start at 30 seconds, build to 5 minutes.",
    category: "Strength", difficulty: "Beginner", duration_days: 30, points_reward: 500,
    participants: 1248, target: 1500, badge: "🏋️", starts_at: "2026-06-01", ends_at: "2026-06-30",
    is_active: true, status: "not_joined",
  },
  {
    id: "c2", title: "10,000 Steps Daily", description: "Walk 10,000 steps every day for 2 weeks. Connect your health tracker to auto-sync.",
    category: "Cardio", difficulty: "Beginner", duration_days: 14, points_reward: 300,
    participants: 3421, target: 5000, badge: "👟", starts_at: "2026-06-15", ends_at: "2026-06-29",
    is_active: true, status: "not_joined",
  },
  {
    id: "c3", title: "Protein Power Week", description: "Hit your protein target every day for 7 consecutive days. Track meals to qualify.",
    category: "Nutrition", difficulty: "Intermediate", duration_days: 7, points_reward: 250,
    participants: 876, target: 1000, badge: "💪", starts_at: "2026-06-20", ends_at: "2026-06-27",
    is_active: true, status: "joined", progress: 5, progress_pct: 71,
  },
  {
    id: "c4", title: "100 Pushups Challenge", description: "Complete 100 pushups in a single day. Can be split into multiple sets.",
    category: "Strength", difficulty: "Advanced", duration_days: 1, points_reward: 150,
    participants: 542, target: 750, badge: "🔥", starts_at: "2026-06-26", ends_at: "2026-06-26",
    is_active: true, status: "not_joined",
  },
  {
    id: "c5", title: "21-Day Yoga Flow", description: "Complete a yoga session every day for 21 days. Any style counts.",
    category: "Flexibility", difficulty: "Beginner", duration_days: 21, points_reward: 400,
    participants: 2103, target: 3000, badge: "🧘", starts_at: "2026-07-01", ends_at: "2026-07-21",
    is_active: false, status: "not_joined",
  },
  {
    id: "c6", title: "Hydration Hero", description: "Drink 3 litres of water every day for 10 days.",
    category: "Wellness", difficulty: "Beginner", duration_days: 10, points_reward: 200,
    participants: 1890, target: 2500, badge: "💧", starts_at: "2026-06-22", ends_at: "2026-07-02",
    is_active: true, status: "completed", progress: 10, progress_pct: 100,
  },
];

const LEADERBOARD = [
  { rank: 1, name: "Arjun S.", points: 4850, avatar: "A", badge: "🥇" },
  { rank: 2, name: "Priya V.", points: 4200, avatar: "P", badge: "🥈" },
  { rank: 3, name: "Rohit M.", points: 3900, avatar: "R", badge: "🥉" },
  { rank: 4, name: "Neha J.", points: 3450, avatar: "N", badge: null },
  { rank: 5, name: "Karan P.", points: 3100, avatar: "K", badge: null },
  { rank: 6, name: "Sneha R.", points: 2980, avatar: "S", badge: null },
  { rank: 7, name: "Amit K.", points: 2750, avatar: "A", badge: null },
  { rank: 8, name: "Divya T.", points: 2600, avatar: "D", badge: null },
  { rank: 9, name: "Vikas G.", points: 2400, avatar: "V", badge: null },
  { rank: 10, name: "Riya B.", points: 2200, avatar: "R", badge: null },
];

router.get("/challenges", (req, res) => {
  const { status } = req.query;
  const list = status ? CHALLENGES.filter(c => c.status === status || c.is_active === (status === "active")) : CHALLENGES;
  res.json({ challenges: list, total: list.length });
});

router.get("/challenges/:id", (req, res) => {
  const ch = CHALLENGES.find(c => c.id === req.params.id);
  if (!ch) { res.status(404).json({ error: "Challenge not found" }); return; }
  res.json({ challenge: ch });
});

router.post("/challenges/:id/join", (req, res) => {
  const ch = CHALLENGES.find(c => c.id === req.params.id);
  if (!ch) { res.status(404).json({ error: "Challenge not found" }); return; }
  ch.status = "joined";
  ch.participants += 1;
  ch.progress = 0;
  ch.progress_pct = 0;
  res.json({ message: "Joined challenge successfully", challenge: ch });
});

router.post("/challenges/:id/log", (req, res) => {
  const ch = CHALLENGES.find(c => c.id === req.params.id);
  if (!ch) { res.status(404).json({ error: "Challenge not found" }); return; }
  const progress = (ch.progress ?? 0) + 1;
  ch.progress = progress;
  ch.progress_pct = Math.min(Math.round((progress / ch.duration_days) * 100), 100);
  if (ch.progress_pct >= 100) ch.status = "completed";
  res.json({ message: "Progress logged", challenge: ch });
});

router.get("/challenges/:id/leaderboard", (req, res) => {
  res.json({ leaderboard: LEADERBOARD, user_rank: 12, user_points: 1850 });
});

router.get("/challenges/leaderboard/global", (req, res) => {
  res.json({ leaderboard: LEADERBOARD, user_rank: 12, user_points: 1850 });
});

export default router;
