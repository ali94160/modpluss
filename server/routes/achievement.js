import express from "express";

import { checkFlag } from "../middlewares/roles.js";
const router = express.Router();

router.post("/achievements", addAchievement);
router.get("/achievements", getAchievements);


export default router;