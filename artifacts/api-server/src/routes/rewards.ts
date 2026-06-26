import { Router } from "express";

const router = Router();

const BADGES = [
  { id: "b1", name: "First Workout", description: "Complete your first workout", icon: "🏋️", earned: true, earned_at: "2026-05-10", category: "Workout" },
  { id: "b2", name: "Week Warrior", description: "7-day workout streak", icon: "🔥", earned: true, earned_at: "2026-05-20", category: "Streak" },
  { id: "b3", name: "Hydration Hero", description: "Log water 10 days in a row", icon: "💧", earned: true, earned_at: "2026-06-02", category: "Wellness" },
  { id: "b4", name: "Centurion", description: "Complete 100 workouts", icon: "💯", earned: false, progress: 34, target: 100, category: "Workout" },
  { id: "b5", name: "Iron Will", description: "30-day workout streak", icon: "⚡", earned: false, progress: 12, target: 30, category: "Streak" },
  { id: "b6", name: "Nutrition Master", description: "Log meals for 30 days", icon: "🥗", earned: false, progress: 8, target: 30, category: "Nutrition" },
  { id: "b7", name: "Social Star", description: "Refer 5 friends", icon: "⭐", earned: false, progress: 2, target: 5, category: "Social" },
  { id: "b8", name: "Challenge Crusher", description: "Complete 3 challenges", icon: "🏆", earned: true, earned_at: "2026-06-10", category: "Challenge" },
  { id: "b9", name: "AI Achiever", description: "Chat with AI Coach 20 times", icon: "🤖", earned: false, progress: 14, target: 20, category: "AI" },
  { id: "b10", name: "Elite Member", description: "Maintain SE7ENFIT PRIME for 6 months", icon: "👑", earned: false, progress: 0, target: 6, category: "Subscription" },
];

const REWARDS = [
  { id: "r1", title: "Free Protein Shake", description: "Redeem at any SE7ENFIT partner gym", cost: 500, category: "Food", available: true, icon: "🥤" },
  { id: "r2", title: "1-Month Premium Upgrade", description: "Upgrade to PRIME free for 1 month", cost: 2000, category: "Subscription", available: true, icon: "⭐" },
  { id: "r3", title: "Gym Merchandise", description: "SE7ENFIT branded tshirt", cost: 1000, category: "Merch", available: true, icon: "👕" },
  { id: "r4", title: "Personal Training Session", description: "1-hour session with a certified trainer", cost: 1500, category: "Training", available: true, icon: "🎯" },
  { id: "r5", title: "₹100 Cashback", description: "Credited to your wallet", cost: 750, category: "Cash", available: true, icon: "💰" },
  { id: "r6", title: "Nutrition Consultation", description: "30-min session with a dietitian", cost: 1200, category: "Nutrition", available: false, icon: "🥗" },
];

const HISTORY = [
  { id: "h1", type: "earned", description: "Completed 7-day streak", points: 100, date: "2026-06-20" },
  { id: "h2", type: "earned", description: "Joined Protein Power Week challenge", points: 50, date: "2026-06-20" },
  { id: "h3", type: "earned", description: "Logged meals for 3 days", points: 30, date: "2026-06-19" },
  { id: "h4", type: "redeemed", description: "Redeemed ₹100 Cashback", points: -750, date: "2026-06-15" },
  { id: "h5", type: "earned", description: "Completed 10,000 steps", points: 75, date: "2026-06-14" },
  { id: "h6", type: "earned", description: "Referred a friend (Rohan M.)", points: 200, date: "2026-06-10" },
  { id: "h7", type: "earned", description: "Completed Hydration Hero challenge", points: 200, date: "2026-06-08" },
  { id: "h8", type: "earned", description: "First workout of the week", points: 25, date: "2026-06-03" },
];

router.get("/rewards", (req, res) => {
  const earned = BADGES.filter(b => b.earned);
  const inProgress = BADGES.filter(b => !b.earned);
  res.json({
    points: 1850,
    level: "Gold",
    level_progress: 73,
    next_level: "Platinum",
    points_to_next_level: 650,
    badges: { earned, in_progress: inProgress, total: BADGES.length },
    available_rewards: REWARDS,
    history: HISTORY,
  });
});

router.get("/rewards/badges", (req, res) => {
  res.json({ badges: BADGES });
});

router.get("/rewards/history", (req, res) => {
  res.json({ history: HISTORY, total_earned: 2580, total_redeemed: 750 });
});

router.post("/rewards/:id/claim", (req, res) => {
  const reward = REWARDS.find(r => r.id === req.params.id);
  if (!reward) { res.status(404).json({ error: "Reward not found" }); return; }
  if (!reward.available) { res.status(400).json({ error: "Reward not available" }); return; }
  res.json({ message: `Successfully redeemed: ${reward.title}`, reward, points_spent: reward.cost, remaining_points: 1850 - reward.cost });
});

export default router;
