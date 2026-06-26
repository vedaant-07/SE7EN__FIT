import { Router } from "express";

const router = Router();

const EXERCISE_LIBRARY = [
  { id: "e1", name: "Push-Up", muscle: "Chest", equipment: "None", difficulty: "Beginner", sets: 3, reps: 12, rest_seconds: 60, instructions: "Start in plank position. Lower your chest to the floor. Push back up.", video_url: null, image_url: null },
  { id: "e2", name: "Squat", muscle: "Legs", equipment: "None", difficulty: "Beginner", sets: 3, reps: 15, rest_seconds: 60, instructions: "Stand feet shoulder-width apart. Lower hips until thighs parallel to floor. Drive up.", video_url: null, image_url: null },
  { id: "e3", name: "Pull-Up", muscle: "Back", equipment: "Pull-up Bar", difficulty: "Intermediate", sets: 3, reps: 8, rest_seconds: 90, instructions: "Hang from bar with overhand grip. Pull chin above bar. Lower slowly.", video_url: null, image_url: null },
  { id: "e4", name: "Deadlift", muscle: "Back", equipment: "Barbell", difficulty: "Advanced", sets: 4, reps: 6, rest_seconds: 120, instructions: "Stand over bar. Hinge at hips, grab bar. Drive hips forward to stand.", video_url: null, image_url: null },
  { id: "e5", name: "Plank", muscle: "Core", equipment: "None", difficulty: "Beginner", sets: 3, reps: null, rest_seconds: 45, duration_seconds: 60, instructions: "Hold plank position with straight body. Engage core throughout.", video_url: null, image_url: null },
  { id: "e6", name: "Bicep Curl", muscle: "Arms", equipment: "Dumbbells", difficulty: "Beginner", sets: 3, reps: 12, rest_seconds: 60, instructions: "Stand with dumbbells. Curl weights up by flexing elbow. Lower slowly.", video_url: null, image_url: null },
  { id: "e7", name: "Shoulder Press", muscle: "Shoulders", equipment: "Dumbbells", difficulty: "Intermediate", sets: 3, reps: 10, rest_seconds: 75, instructions: "Hold dumbbells at shoulder height. Press overhead. Lower slowly.", video_url: null, image_url: null },
  { id: "e8", name: "Lunges", muscle: "Legs", equipment: "None", difficulty: "Beginner", sets: 3, reps: 12, rest_seconds: 60, instructions: "Step forward into a lunge, lower back knee to floor. Alternate legs.", video_url: null, image_url: null },
  { id: "e9", name: "Burpee", muscle: "Full Body", equipment: "None", difficulty: "Intermediate", sets: 3, reps: 10, rest_seconds: 90, instructions: "Squat down, jump feet back, do a push-up, jump feet in, leap up with arms overhead.", video_url: null, image_url: null },
  { id: "e10", name: "Mountain Climbers", muscle: "Core", equipment: "None", difficulty: "Intermediate", sets: 3, reps: null, rest_seconds: 45, duration_seconds: 40, instructions: "In plank position, alternate driving knees toward chest rapidly.", video_url: null, image_url: null },
  { id: "e11", name: "Bench Press", muscle: "Chest", equipment: "Barbell", difficulty: "Intermediate", sets: 4, reps: 8, rest_seconds: 90, instructions: "Lie on bench. Grip bar slightly wider than shoulders. Lower to chest. Press up.", video_url: null, image_url: null },
  { id: "e12", name: "Lat Pulldown", muscle: "Back", equipment: "Cable Machine", difficulty: "Beginner", sets: 3, reps: 12, rest_seconds: 60, instructions: "Sit at machine. Pull bar to upper chest. Lean back slightly. Control the weight up.", video_url: null, image_url: null },
  { id: "e13", name: "Leg Press", muscle: "Legs", equipment: "Machine", difficulty: "Beginner", sets: 4, reps: 15, rest_seconds: 75, instructions: "Sit in machine. Place feet shoulder-width. Push platform up. Don't lock knees.", video_url: null, image_url: null },
  { id: "e14", name: "Tricep Dips", muscle: "Arms", equipment: "Parallel Bars", difficulty: "Intermediate", sets: 3, reps: 10, rest_seconds: 75, instructions: "Grip bars, lower body by bending elbows to 90°. Push back up.", video_url: null, image_url: null },
  { id: "e15", name: "Crunches", muscle: "Core", equipment: "None", difficulty: "Beginner", sets: 3, reps: 20, rest_seconds: 45, instructions: "Lie on back, knees bent. Curl shoulders off floor using core muscles.", video_url: null, image_url: null },
];

const WORKOUT_PLANS = [
  {
    id: "w1", name: "Beginner Full Body", level: "Beginner", goal: "General Fitness",
    days_per_week: 3, duration_weeks: 8, estimated_duration_mins: 45,
    description: "A complete full-body workout designed for beginners to build a solid foundation.",
    exercises: [
      EXERCISE_LIBRARY[0], EXERCISE_LIBRARY[1], EXERCISE_LIBRARY[7], EXERCISE_LIBRARY[4], EXERCISE_LIBRARY[14]
    ],
  },
  {
    id: "w2", name: "Chest & Back Blast", level: "Intermediate", goal: "Build Muscle",
    days_per_week: 4, duration_weeks: 6, estimated_duration_mins: 60,
    description: "Focus on building a strong chest and back with compound movements.",
    exercises: [
      EXERCISE_LIBRARY[10], EXERCISE_LIBRARY[11], EXERCISE_LIBRARY[0], EXERCISE_LIBRARY[2], EXERCISE_LIBRARY[3]
    ],
  },
  {
    id: "w3", name: "HIIT Cardio Burner", level: "Intermediate", goal: "Lose Weight",
    days_per_week: 5, duration_weeks: 4, estimated_duration_mins: 30,
    description: "High-intensity intervals to torch calories and boost metabolism.",
    exercises: [
      EXERCISE_LIBRARY[8], EXERCISE_LIBRARY[9], EXERCISE_LIBRARY[1], EXERCISE_LIBRARY[7], EXERCISE_LIBRARY[4]
    ],
  },
  {
    id: "w4", name: "Upper Body Power", level: "Advanced", goal: "Build Muscle",
    days_per_week: 4, duration_weeks: 8, estimated_duration_mins: 70,
    description: "Heavy compound movements for serious upper body strength and size.",
    exercises: [
      EXERCISE_LIBRARY[10], EXERCISE_LIBRARY[6], EXERCISE_LIBRARY[5], EXERCISE_LIBRARY[13], EXERCISE_LIBRARY[2]
    ],
  },
  {
    id: "w5", name: "Leg Day Specialist", level: "Intermediate", goal: "Build Muscle",
    days_per_week: 2, duration_weeks: 8, estimated_duration_mins: 55,
    description: "Build powerful legs with squats, lunges, and leg press.",
    exercises: [
      EXERCISE_LIBRARY[1], EXERCISE_LIBRARY[7], EXERCISE_LIBRARY[12], EXERCISE_LIBRARY[4]
    ],
  },
];

const SESSION_LOGS: object[] = [];

router.get("/workouts/plans", (req, res) => {
  res.json({ plans: WORKOUT_PLANS, total: WORKOUT_PLANS.length });
});

router.get("/workouts/plans/:id", (req, res) => {
  const plan = WORKOUT_PLANS.find(p => p.id === req.params.id);
  if (!plan) { res.status(404).json({ error: "Workout plan not found" }); return; }
  res.json({ plan });
});

router.get("/workouts/exercises", (req, res) => {
  const { muscle, difficulty, q } = req.query as Record<string, string>;
  let list = [...EXERCISE_LIBRARY];
  if (muscle) list = list.filter(e => e.muscle.toLowerCase().includes(muscle.toLowerCase()));
  if (difficulty) list = list.filter(e => e.difficulty.toLowerCase() === difficulty.toLowerCase());
  if (q) list = list.filter(e => e.name.toLowerCase().includes(q.toLowerCase()));
  res.json({ exercises: list, total: list.length });
});

router.get("/workouts/exercises/:id", (req, res) => {
  const ex = EXERCISE_LIBRARY.find(e => e.id === req.params.id);
  if (!ex) { res.status(404).json({ error: "Exercise not found" }); return; }
  res.json({ exercise: ex });
});

router.post("/workouts/session", (req, res) => {
  const { plan_id, exercises_completed, duration_mins, calories_burned } = req.body as {
    plan_id: string; exercises_completed: object[]; duration_mins: number; calories_burned: number;
  };
  const session = {
    id: `session_${Date.now()}`,
    plan_id,
    exercises_completed,
    duration_mins,
    calories_burned,
    completed_at: new Date().toISOString(),
    points_earned: Math.floor(duration_mins * 2),
  };
  SESSION_LOGS.push(session);
  res.json({ session, message: "Workout session saved!", points_earned: session.points_earned });
});

router.get("/workouts/sessions", (req, res) => {
  res.json({ sessions: SESSION_LOGS, total: SESSION_LOGS.length });
});

export default router;
