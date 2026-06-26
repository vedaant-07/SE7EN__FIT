import { Router } from "express";

const router = Router();

const FOODS_DB = [
  { id: "1", name: "Idli", calories: 39, protein: 2, carbs: 8, fat: 0.2, serving: "1 piece (30g)", category: "Indian" },
  { id: "2", name: "Dal Tadka", calories: 150, protein: 9, carbs: 22, fat: 4, serving: "1 katori (150g)", category: "Indian" },
  { id: "3", name: "Chapati", calories: 104, protein: 3, carbs: 18, fat: 2.5, serving: "1 roti (40g)", category: "Indian" },
  { id: "4", name: "Boiled Egg", calories: 77, protein: 6, carbs: 0.6, fat: 5, serving: "1 large (50g)", category: "Protein" },
  { id: "5", name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: "100g", category: "Protein" },
  { id: "6", name: "Brown Rice", calories: 216, protein: 5, carbs: 45, fat: 1.8, serving: "1 cup cooked (195g)", category: "Grains" },
  { id: "7", name: "Banana", calories: 89, protein: 1, carbs: 23, fat: 0.3, serving: "1 medium (120g)", category: "Fruits" },
  { id: "8", name: "Paneer", calories: 265, protein: 18, carbs: 3, fat: 20, serving: "100g", category: "Dairy" },
  { id: "9", name: "Moong Dal", calories: 347, protein: 24, carbs: 63, fat: 1, serving: "100g dry", category: "Legumes" },
  { id: "10", name: "Curd / Dahi", calories: 98, protein: 11, carbs: 3.4, fat: 4, serving: "1 cup (200g)", category: "Dairy" },
  { id: "11", name: "Oats", calories: 158, protein: 5, carbs: 27, fat: 3, serving: "1 serving (45g)", category: "Grains" },
  { id: "12", name: "Sweet Potato", calories: 90, protein: 2, carbs: 21, fat: 0.1, serving: "100g", category: "Vegetables" },
  { id: "13", name: "Rajma", calories: 127, protein: 9, carbs: 23, fat: 0.5, serving: "100g cooked", category: "Legumes" },
  { id: "14", name: "Sambar", calories: 60, protein: 3, carbs: 10, fat: 1, serving: "1 katori (150g)", category: "Indian" },
  { id: "15", name: "Almonds", calories: 164, protein: 6, carbs: 6, fat: 14, serving: "28g (about 23)", category: "Nuts" },
  { id: "16", name: "Whey Protein", calories: 120, protein: 24, carbs: 3, fat: 2, serving: "1 scoop (30g)", category: "Supplements" },
  { id: "17", name: "Apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, serving: "1 medium (182g)", category: "Fruits" },
  { id: "18", name: "Poha", calories: 250, protein: 4, carbs: 52, fat: 3, serving: "1 plate (200g)", category: "Indian" },
  { id: "19", name: "Upma", calories: 200, protein: 5, carbs: 38, fat: 4, serving: "1 cup (180g)", category: "Indian" },
  { id: "20", name: "Greek Yogurt", calories: 130, protein: 17, carbs: 9, fat: 4, serving: "200g", category: "Dairy" },
];

const MOCK_DIARY: Record<string, object[]> = {};

router.get("/nutrition/search", (req, res) => {
  const q = ((req.query.q as string) ?? "").toLowerCase().trim();
  const results = q
    ? FOODS_DB.filter(f => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q))
    : FOODS_DB.slice(0, 10);
  res.json({ foods: results, total: results.length });
});

router.get("/nutrition/today", (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const entries = (MOCK_DIARY[today] ?? []) as Array<{
    food: { calories: number; protein: number; carbs: number; fat: number };
    quantity: number;
  }>;
  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.food.calories * e.quantity,
      protein: acc.protein + e.food.protein * e.quantity,
      carbs: acc.carbs + e.food.carbs * e.quantity,
      fat: acc.fat + e.food.fat * e.quantity,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  res.json({
    date: today,
    entries,
    totals,
    target: { calories: 2200, protein: 150, carbs: 250, fat: 60 },
  });
});

router.get("/nutrition/diary", (req, res) => {
  const date = (req.query.date as string) ?? new Date().toISOString().split("T")[0];
  const entries = MOCK_DIARY[date] ?? [];
  res.json({ date, entries });
});

router.post("/nutrition/log", (req, res) => {
  const { food_id, meal_type, quantity = 1, date } = req.body as {
    food_id: string; meal_type: string; quantity?: number; date?: string;
  };
  const food = FOODS_DB.find(f => f.id === food_id);
  if (!food) { res.status(404).json({ error: "Food not found" }); return; }
  const key = date ?? new Date().toISOString().split("T")[0];
  if (!MOCK_DIARY[key]) MOCK_DIARY[key] = [];
  const entry = { id: Date.now().toString(), food, meal_type, quantity, logged_at: new Date().toISOString() };
  MOCK_DIARY[key].push(entry);
  res.json({ entry, message: "Food logged successfully" });
});

router.delete("/nutrition/log/:id", (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  if (MOCK_DIARY[today]) {
    MOCK_DIARY[today] = (MOCK_DIARY[today] as Array<{ id: string }>).filter(e => e.id !== req.params.id);
  }
  res.json({ message: "Entry deleted" });
});

router.get("/nutrition/weekly", (req, res) => {
  res.json({
    week: [
      { day: "Mon", calories: 1850, target: 2200 },
      { day: "Tue", calories: 2100, target: 2200 },
      { day: "Wed", calories: 1750, target: 2200 },
      { day: "Thu", calories: 2250, target: 2200 },
      { day: "Fri", calories: 1900, target: 2200 },
      { day: "Sat", calories: 2350, target: 2200 },
      { day: "Sun", calories: 2050, target: 2200 },
    ],
    avg_calories: 2036,
    avg_protein: 128,
  });
});

export default router;
