import express from "express";
import { FLAGS, checkFlag } from "../middlewares/roles.js";
import { createCanceledMatch, getCanceledMatches } from "../controllers/canceledMatchController.js";
const router = express.Router();

router.get("/", checkFlag([FLAGS.ADMIN, FLAGS.SUPER], true), getCanceledMatches);
router.post("/", createCanceledMatch);

export default router;