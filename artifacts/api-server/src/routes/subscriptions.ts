import { Router } from "express";

const router = Router();

const PLANS = [
  {
    id: "free",
    name: "SE7ENFIT Free",
    price_monthly: 0,
    price_yearly: 0,
    currency: "INR",
    badge: null,
    popular: false,
    features: [
      "5 AI Coach messages/day",
      "Basic workout library (50 exercises)",
      "Manual nutrition logging",
      "Water tracker",
      "Basic progress tracking",
    ],
    limits: {
      ai_messages_per_day: 5,
      workout_plans: 1,
      food_scan: false,
      health_sync: false,
    },
  },
  {
    id: "prime_monthly",
    name: "SE7ENFIT PRIME",
    price_monthly: 499,
    price_yearly: 3999,
    currency: "INR",
    badge: "Most Popular",
    popular: true,
    features: [
      "Unlimited AI Coach messaging",
      "Full exercise library (500+ exercises)",
      "AI-generated meal plans",
      "Food scan with camera",
      "Apple Health / Health Connect sync",
      "Advanced analytics & insights",
      "Exclusive challenges & extra rewards",
      "Priority support",
    ],
    limits: {
      ai_messages_per_day: -1,
      workout_plans: -1,
      food_scan: true,
      health_sync: true,
    },
  },
  {
    id: "prime_yearly",
    name: "SE7ENFIT PRIME Annual",
    price_monthly: 333,
    price_yearly: 3999,
    currency: "INR",
    badge: "Save 33%",
    popular: false,
    features: [
      "Everything in PRIME Monthly",
      "2 months free vs monthly plan",
      "Exclusive annual member badge",
      "Early access to new features",
    ],
    limits: {
      ai_messages_per_day: -1,
      workout_plans: -1,
      food_scan: true,
      health_sync: true,
    },
  },
  {
    id: "gym_owner",
    name: "Gym Owner Pro",
    price_monthly: 1999,
    price_yearly: 17999,
    currency: "INR",
    badge: "For Gyms",
    popular: false,
    features: [
      "Unlimited member management",
      "Lead tracking & CRM",
      "Revenue analytics",
      "Bulk AI workout plan generation",
      "Branded app experience",
      "Priority onboarding support",
    ],
    limits: {
      members: -1,
      leads: -1,
      analytics: true,
    },
  },
];

router.get("/subscriptions/plans", (req, res) => {
  res.json({ plans: PLANS });
});

router.get("/subscriptions/current", (req, res) => {
  res.json({
    subscription: {
      id: "sub_free_001",
      plan_id: "free",
      plan_name: "SE7ENFIT Free",
      status: "active",
      started_at: "2026-05-01",
      renews_at: null,
      is_free: true,
    },
  });
});

router.post("/subscriptions/upgrade", (req, res) => {
  const { plan_id, payment_method } = req.body as { plan_id: string; payment_method: string };
  const plan = PLANS.find(p => p.id === plan_id);
  if (!plan) { res.status(404).json({ error: "Plan not found" }); return; }
  res.json({
    message: "Upgrade initiated",
    checkout: {
      order_id: `ORD_${Date.now()}`,
      plan,
      payment_method,
      amount: plan.price_monthly,
      currency: "INR",
      redirect_url: "https://se7enfit-original.onrender.com/api/subscriptions/verify",
    },
  });
});

router.post("/subscriptions/cancel", (req, res) => {
  res.json({ message: "Subscription cancellation requested. You will retain access until the end of the billing period." });
});

export default router;
