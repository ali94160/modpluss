import { Ticket } from "../models/Ticket.js";
import { User } from "../models/User.js";

export const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.status(200).json(tickets);
  } catch (error) {
    res.status(404);
  }
};

export const getTicketsByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const tickets = await Ticket.find({ handler: username });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(404);
  }
};

export const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOneAndUpdate(
      { ticketId: req.body.ticketId },
      { resolved: req.body.resolved },
      { new: true }
    );
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addNewTicket = async (req, res) => {
    try {   
        if(!req.session.user) return res.status(404).json({error: "User not logged in"})
        await Ticket.create(req.body)
        await User.findByIdAndUpdate({ _id: req.session.user._id}, {
            allTimeTickets: req.session.user.allTimeTickets + 1
        })
        res.status(200).json({ message: "Ticket has been added" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
