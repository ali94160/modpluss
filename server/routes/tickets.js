import express from "express";
import { getTickets, getTicketsByUsername, addNewTicket, updateTicket } from "../controllers/ticketController.js";

const router = express.Router();

router.get("/", getTickets);

router.get("/:username", getTicketsByUsername);

router.post("/", addNewTicket)

router.patch("/", updateTicket)
export default router;