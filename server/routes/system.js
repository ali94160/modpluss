import express from "express";
import { FLAGS, checkFlag } from "../middlewares/roles.js";
import { createSystemMessage, getSystemMessage, removeSystemMessage, createGiveaway, stopGiveawayAndPickWinner, checkAndPickWinner, enterGiveaway } from "../controllers/systemController.js";
const router = express.Router();

// system message
router.get("/", getSystemMessage);
router.post("/", checkFlag([FLAGS.ADMIN, FLAGS.SUPER]), createSystemMessage);
router.delete("/", checkFlag([FLAGS.ADMIN, FLAGS.SUPER]), removeSystemMessage);

// giveaway
router.post("/star-giveaway", checkFlag([FLAGS.ADMIN, FLAGS.SUPER]), createGiveaway);
router.post("/stop-giveaway", checkFlag([FLAGS.ADMIN, FLAGS.SUPER]), stopGiveawayAndPickWinner);
router.get("/get-giveaway", checkAndPickWinner);
router.post("/enterGiveaway", enterGiveaway);

export default router;