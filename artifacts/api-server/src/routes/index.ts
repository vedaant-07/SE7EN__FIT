import { Router, type IRouter } from "express";
import healthRouter from "./health";
import nutritionRouter from "./nutrition";
import challengesRouter from "./challenges";
import rewardsRouter from "./rewards";
import subscriptionsRouter from "./subscriptions";
import workoutsRouter from "./workouts";
import referralsRouter from "./referrals";
import settingsRouter from "./settings";
import gymRouter from "./gym";

const router: IRouter = Router();

router.use(healthRouter);
router.use(nutritionRouter);
router.use(challengesRouter);
router.use(rewardsRouter);
router.use(subscriptionsRouter);
router.use(workoutsRouter);
router.use(referralsRouter);
router.use(settingsRouter);
router.use(gymRouter);

export default router;
