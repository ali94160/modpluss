import express from "express";
import { addSkin, buySkin, sellSkin, sendSkinToUser } from "../controllers/skinController.js";
import { checkFlag } from "../middlewares/roles.js";
const router = express.Router();

router.post("/", addSkin);
router.post("/buy", buySkin);
router.post("/send-skin", sendSkinToUser);
router.delete("/sellSkin", sellSkin());

export default router;