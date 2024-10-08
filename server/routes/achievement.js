import express from "express";
import { addAchievement, getAchievements } from "../controllers/achievementController.js";
import { checkFlag, FLAGS } from "../middlewares/roles.js";

const router = express.Router();

router.post("/add", addAchievement);
router.get("/list", getAchievements);

export default router;