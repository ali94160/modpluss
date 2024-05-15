import express from "express";
import { addSkin } from "../controllers/skinController.js";
const router = express.Router();

router.post("/", addSkin);

export default router;