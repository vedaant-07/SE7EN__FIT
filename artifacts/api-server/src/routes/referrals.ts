import { Router } from "express";

const router = Router();

const REFERRAL_HISTORY = [
  { id: "ref1", name: "Rohan Mehta", status: "converted", points_earned: 200, joined_at: "2026-06-10", plan: "PRIME Monthly" },
  { id: "ref2", name: "Ananya Sharma", status: "signed_up", points_earned: 50, joined_at: "2026-06-18", plan: "Free" },
  { id: "ref3", name: "Vikram Rao", status: "pending", points_earned: 0, joined_at: null, plan: null },
  { id: "ref4", name: "Preethi Nair", status: "converted", points_earned: 200, joined_at: "2026-05-28", plan: "PRIME Yearly" },
];

router.get("/referrals", (req, res) => {
  res.json({
    referral_code: "SE7FIT2024",
    referral_url: "https://se7enfit.app/join?ref=SE7FIT2024",
    total_referrals: REFERRAL_HISTORY.length,
    converted: REFERRAL_HISTORY.filter(r => r.status === "converted").length,
    pending: REFERRAL_HISTORY.filter(r => r.status === "pending").length,
    total_points_earned: REFERRAL_HISTORY.reduce((sum, r) => sum + r.points_earned, 0),
    history: REFERRAL_HISTORY,
    rewards_structure: [
      { event: "Friend signs up", points: 50, description: "Earn when they create an account" },
      { event: "Friend upgrades to PRIME", points: 200, description: "Earn when they subscribe to any paid plan" },
      { event: "Friend completes onboarding", points: 25, description: "Earn when they finish their profile setup" },
    ],
  });
});

router.get("/referrals/code", (req, res) => {
  res.json({ code: "SE7FIT2024", url: "https://se7enfit.app/join?ref=SE7FIT2024" });
});

router.post("/referrals/share", (req, res) => {
  const { method } = req.body as { method: string };
  res.json({ message: "Referral link shared", method, code: "SE7FIT2024" });
});

export default router;
