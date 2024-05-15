import express from "express";
import { loginUser, logoutUser, whoAmI } from "../controllers/authController.js"

const router = express.Router();

router.post("/", loginUser);
router.delete("/", logoutUser);
router.get("/", whoAmI);

export default router;