import { Router } from "express";

const router = Router();

const MEMBERS = [
  { id: "m1", name: "Arjun Sharma", phone: "9876543210", email: "arjun@example.com", plan: "6-Month", status: "active", fee: 4999, joined: "2026-01-15", expires: "2026-07-15", attendance_this_month: 22 },
  { id: "m2", name: "Priya Verma", phone: "9123456789", email: "priya@example.com", plan: "Annual", status: "active", fee: 8999, joined: "2026-02-01", expires: "2027-02-01", attendance_this_month: 18 },
  { id: "m3", name: "Rohan Singh", phone: "9988776655", email: "rohan@example.com", plan: "Monthly", status: "pending", fee: 1499, joined: "2026-06-01", expires: "2026-07-01", attendance_this_month: 5 },
  { id: "m4", name: "Neha Joshi", phone: "9871234560", email: "neha@example.com", plan: "3-Month", status: "active", fee: 3499, joined: "2026-05-01", expires: "2026-08-01", attendance_this_month: 24 },
  { id: "m5", name: "Karan Patel", phone: "9654321098", email: "karan@example.com", plan: "Annual", status: "expired", fee: 8999, joined: "2025-06-01", expires: "2026-06-01", attendance_this_month: 0 },
  { id: "m6", name: "Sneha Rao", phone: "9776543210", email: "sneha@example.com", plan: "Monthly", status: "active", fee: 1499, joined: "2026-06-15", expires: "2026-07-15", attendance_this_month: 12 },
  { id: "m7", name: "Amit Kumar", phone: "9845612340", email: "amit@example.com", plan: "6-Month", status: "active", fee: 4999, joined: "2026-03-01", expires: "2026-09-01", attendance_this_month: 20 },
  { id: "m8", name: "Divya Tiwari", phone: "9932167890", email: "divya@example.com", plan: "Monthly", status: "active", fee: 1499, joined: "2026-06-20", expires: "2026-07-20", attendance_this_month: 7 },
];

const LEADS = [
  { id: "l1", name: "Rahul Gupta", phone: "9812345678", source: "Walk-in", status: "hot", interest: "Annual Plan", notes: "Very interested, needs follow-up", created_at: "2026-06-24", follow_up: "2026-06-27" },
  { id: "l2", name: "Sunita Iyer", phone: "9765432109", source: "Instagram", status: "warm", interest: "Monthly Plan", notes: "Saw our reel, DM'd us", created_at: "2026-06-23", follow_up: "2026-06-28" },
  { id: "l3", name: "Manish Bose", phone: "9987654321", source: "Referral", status: "hot", interest: "6-Month Plan", notes: "Referred by Arjun Sharma", created_at: "2026-06-22", follow_up: "2026-06-26" },
  { id: "l4", name: "Kavitha Pillai", phone: "9654123456", source: "Google", status: "cold", interest: "Unknown", notes: "Filled form online, no response yet", created_at: "2026-06-20", follow_up: "2026-06-30" },
  { id: "l5", name: "Deepak Nair", phone: "9871098765", source: "Walk-in", status: "warm", interest: "3-Month Plan", notes: "Came for trial class, enjoyed it", created_at: "2026-06-19", follow_up: "2026-06-27" },
];

const EARNINGS = {
  this_month: 124500,
  last_month: 108000,
  growth_pct: 15.3,
  monthly: [
    { month: "Jan", revenue: 88000, members: 210 },
    { month: "Feb", revenue: 92000, members: 218 },
    { month: "Mar", revenue: 98000, members: 225 },
    { month: "Apr", revenue: 103000, members: 235 },
    { month: "May", revenue: 108000, members: 241 },
    { month: "Jun", revenue: 124500, members: 248 },
  ],
  by_plan: [
    { plan: "Monthly (₹1499)", count: 42, revenue: 62958 },
    { plan: "3-Month (₹3499)", count: 18, revenue: 62982 },
    { plan: "6-Month (₹4999)", count: 62, revenue: 309938 },
    { plan: "Annual (₹8999)", count: 126, revenue: 1133874 },
  ],
  expenses: {
    rent: 45000, utilities: 12000, staff: 35000, equipment: 8000, marketing: 15000, misc: 5000,
  },
  net_profit: 124500 - (45000 + 12000 + 35000 + 8000 + 15000 + 5000),
};

router.get("/gym/dashboard", (req, res) => {
  res.json({
    gym_name: "SE7ENFIT Prime Gym",
    location: "Mumbai, Maharashtra",
    total_members: MEMBERS.length,
    active_members: MEMBERS.filter(m => m.status === "active").length,
    members_today: 87,
    new_members_this_month: 12,
    expiring_soon: MEMBERS.filter(m => m.status === "active").length - 5,
    leads: { total: LEADS.length, hot: LEADS.filter(l => l.status === "hot").length },
    revenue: { this_month: EARNINGS.this_month, growth: EARNINGS.growth_pct },
    recent_members: MEMBERS.slice(0, 5),
    weekly_attendance: [45, 62, 58, 71, 69, 85, 41],
  });
});

router.get("/gym/members", (req, res) => {
  const { status, q } = req.query as { status?: string; q?: string };
  let list = [...MEMBERS];
  if (status) list = list.filter(m => m.status === status);
  if (q) list = list.filter(m => m.name.toLowerCase().includes(q.toLowerCase()) || m.phone.includes(q));
  res.json({ members: list, total: list.length });
});

router.get("/gym/members/:id", (req, res) => {
  const m = MEMBERS.find(m => m.id === req.params.id);
  if (!m) { res.status(404).json({ error: "Member not found" }); return; }
  res.json({ member: m });
});

router.post("/gym/members", (req, res) => {
  const member = { id: `m${MEMBERS.length + 1}`, ...req.body, status: "active", attendance_this_month: 0 } as typeof MEMBERS[0];
  MEMBERS.push(member);
  res.status(201).json({ member, message: "Member added successfully" });
});

router.get("/gym/leads", (req, res) => {
  const { status } = req.query as { status?: string };
  const list = status ? LEADS.filter(l => l.status === status) : LEADS;
  res.json({ leads: list, total: list.length, hot: LEADS.filter(l => l.status === "hot").length });
});

router.post("/gym/leads", (req, res) => {
  const lead = { id: `l${LEADS.length + 1}`, ...req.body, created_at: new Date().toISOString() } as typeof LEADS[0];
  LEADS.push(lead);
  res.status(201).json({ lead, message: "Lead added" });
});

router.put("/gym/leads/:id", (req, res) => {
  const lead = LEADS.find(l => l.id === req.params.id);
  if (!lead) { res.status(404).json({ error: "Lead not found" }); return; }
  Object.assign(lead, req.body);
  res.json({ lead });
});

router.get("/gym/earnings", (req, res) => {
  res.json(EARNINGS);
});

export default router;
