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
      await Ticket.create(req.body);
      await User.findOneAndUpdate(
          { username: req.body.handler }, 
          { $inc: { allTimeTickets: 1 } }
      );
      console.log(req.body, ' req body')
      res.status(200).json({ message: "Ticket has been added" });
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
}

export const removeAllTickets = async (req, res) => {
  try {
    const result = await Ticket.deleteMany({});
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllTicketsCount = async (req, res) => {
  try {
      if(!req.session.user){ return res.status(404).json({ error: "User not logged in" }); }

      const allTickets = await Ticket.find({});
      res.status(200).json(allTickets.length);
  } catch (error) {
      res.status(500).json({ error: error.message }); 
  }
}