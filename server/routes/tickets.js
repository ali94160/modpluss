import express from "express";
import { getTickets, getTicketsByUsername, addNewTicket, updateTicket, removeAllTickets, getAllTicketsCount, removeMyTickets, getMyUnresolvedTicketCount } from "../controllers/ticketController.js";
import { FLAGS, checkFlag } from "../middlewares/roles.js";

const router = express.Router();

router.get("/", getTickets);
router.get("/get-all", checkFlag([FLAGS.ADMIN, FLAGS.SUPER]), getAllTicketsCount)

router.get("/:username", getTicketsByUsername);

router.post("/", addNewTicket)

router.patch("/", updateTicket)

router.delete("/", checkFlag([FLAGS.ADMIN, FLAGS.SUPER]), removeAllTickets)

router.delete("/my-tickets", removeMyTickets)
router.get("/my-tickets", getMyUnresolvedTicketCount)
export default router;