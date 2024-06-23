import express from "express";
import { FLAGS, checkFlag } from "../middlewares/roles.js";
import { createSystemMessage, getSystemMessage, removeSystemMessage, createGiveaway, stopGiveawayAndPickWinner, checkAndPickWinner, enterGiveaway, getLastGiveaway, removeGiveaway, getSystemLogs, addLogging, clearSystemLogs, getAdminCallsText, addAdminCallText, deleteAdmincAllsTextByIds, updateAdminCallText } from "../controllers/systemController.js";
const router = express.Router();

// system message
router.get("/", getSystemMessage);
router.post("/", checkFlag([FLAGS.ADMIN, FLAGS.SUPER]), createSystemMessage);
router.delete("/", checkFlag([FLAGS.ADMIN, FLAGS.SUPER]), removeSystemMessage);

// giveaway
router.post("/star-giveaway", checkFlag([FLAGS.ADMIN, FLAGS.SUPER]), createGiveaway);
router.post("/stop-giveaway", checkFlag([FLAGS.ADMIN, FLAGS.SUPER]), stopGiveawayAndPickWinner);
router.get("/get-giveaway", checkAndPickWinner);
router.get("/get-last-giveaway", getLastGiveaway);
router.post("/enter-giveaway", enterGiveaway); 
router.delete("/remove", checkFlag([FLAGS.ADMIN, FLAGS.SUPER]), removeGiveaway);
router.get("/logs/get", checkFlag([FLAGS.SUPER]), getSystemLogs)
router.delete("/logs/delete-all", checkFlag([FLAGS.SUPER]), clearSystemLogs)
router.post("/logs/add", addLogging)

router.get("/admin/call/text", getAdminCallsText)
router.post("/admin/call/text", checkFlag([FLAGS.ADMIN, FLAGS.SUPER]), addAdminCallText)
router.delete("/admin/call/text", checkFlag([FLAGS.ADMIN, FLAGS.SUPER]), deleteAdmincAllsTextByIds)
router.put("/admin/call/text/:id", checkFlag([FLAGS.ADMIN, FLAGS.SUPER]), updateAdminCallText)
export default router;