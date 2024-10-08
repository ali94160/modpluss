import express from "express";
import { addAchievement, getAchievements } from "../controllers/achievement.js";
import { checkFlag } from "../middlewares/roles.js";

const router = express.Router();

router.post("/add", checkFlag([FLAGS.ADMIN, FLAGS.SUPER]), addAchievement);
router.get("/list", getAchievements);

export default router;