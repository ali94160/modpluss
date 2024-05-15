import express from "express";
import { FLAGS, checkFlag } from "../middlewares/roles.js";
import { createSystemMessage, getSystemMessage, removeSystemMessage } from "../controllers/systemController.js";
const router = express.Router();

router.get("/", getSystemMessage);
router.post("/", checkFlag([FLAGS.ADMIN, FLAGS.SUPER]), createSystemMessage);
router.delete("/", checkFlag([FLAGS.ADMIN, FLAGS.SUPER]), removeSystemMessage);

export default router;