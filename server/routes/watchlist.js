import express from "express";
import { updateWatchlist, getWatchlist } from "../controllers/watchlistController.js"

const router = express.Router();

router.patch("/", updateWatchlist);
router.get("/", getWatchlist);

export default router;