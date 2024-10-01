import { SystemLog } from "../models/System.js";
import { Ticket } from "../models/Ticket.js";
import { User } from "../models/User.js";
import { newDate } from "./systemController.js";

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

export const getMyUnresolvedTicketCount = async (req, res) => {
  try {
    const { username } = req.session.user;
    const unresolvedTicketCount = await Ticket.countDocuments({ handler: username, resolved: false });
    res.status(200).json({ MyTicketCount: unresolvedTicketCount });
  } catch (error) {
    res.status(404).json({ message: 'Unable to retrieve ticket count' });
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
      res.status(200).json({ message: "Ticket has been added" });
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
}

export const removeAllTickets = async (req, res) => {
  try {
    const result = await Ticket.deleteMany({ resolved: 1 });
    await SystemLog.create({ type: 0, text: `${req.session.user.username} has removed everyones tickets`, date: newDate()})
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeMyTickets = async (req, res) => {
  try {
    await Ticket.deleteMany({ handler: req.session.user.username });
    await SystemLog.create({ type: 0, text: `${req.session.user.username} has removed their tickets`, date: newDate()})
    res.status(200).json({ message: "Your tickets has been removed" });
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