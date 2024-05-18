import express from "express";
import { addSkin, buySkin, sendSkinToUser } from "../controllers/skinController.js";
const router = express.Router();

router.post("/", addSkin);
router.post("/buy", buySkin);
router.post("/send-skin", sendSkinToUser);

export default router;