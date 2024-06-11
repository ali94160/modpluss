import express from "express";
import { FLAGS, checkFlag } from "../middlewares/roles.js";
import { clearCanceledMatches, clearSmurfLogs, createCanceledMatch, createSmurfLog, getCanceledMatches, getSmurfLogs } from "../controllers/esportalLogs.js";
const router = express.Router();

router.get("/cancel-matches", checkFlag([FLAGS.SUPER, FLAGS.ADMIN], true), getCanceledMatches);
router.post("/cancel-matches", createCanceledMatch);
router.delete("/cancel-matches", checkFlag([FLAGS.SUPER, FLAGS.ADMIN], true), clearCanceledMatches)

router.get("/smurf", checkFlag([FLAGS.SUPER, FLAGS.ADMIN], true), getSmurfLogs);
router.post("/smurf", createSmurfLog);
router.delete("/smurf", checkFlag([FLAGS.SUPER, FLAGS.ADMIN], true), clearSmurfLogs);
// Set get, create, delete smurflogs
export default router;