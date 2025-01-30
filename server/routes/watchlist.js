import express from "express";
import { updateWatchlist, getWatchlist, deleteWatchlistUser } from "../controllers/watchlistController.js"

const router = express.Router();

router.patch("/", updateWatchlist);
router.get("/", getWatchlist);
router.delete("/", deleteWatchlistUser);
export default router;