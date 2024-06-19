import express from "express";
import { addReport, getAllReportsCount, getMyReports, removeAllReports, removeMyReports } from "../controllers/reportController.js";
import { FLAGS, checkFlag } from "../middlewares/roles.js";

const router = express.Router();

router.post("/", addReport)
router.get("/", getMyReports)
router.get("/get-all", checkFlag([FLAGS.ADMIN, FLAGS.SUPER]), getAllReportsCount)
router.delete("/", checkFlag([FLAGS.ADMIN, FLAGS.SUPER]), removeAllReports)
router.delete("/my-reports", removeMyReports)

export default router;