// Kanske user.skins = [skins._id ?] OM man får flera av samma skin?
// Alla skins bör ligga i DB:b
// För hämtning vid store (allSkins kommer ha dubeletter, ta bara ut 1 av varje.) + mina skins OK med dubeltter, har olika _ids
import { Skin } from "../models/Skin.js";
import { User } from "../models/User.js";
import { SystemLog } from "../models/System.js"; // PÅ ALLA
import { newDate } from "./systemController.js";

export const addSkin = async (req, res) => {
  try {
    const { isSuperCase } = req.body

    if(isSuperCase){
      if(req.session.user.super_modCases <= 0) return res.status(400).json({ error: "No Super Mod Cases left" })
      req.session.user.super_modCases -= 1;
    } else {
      if(req.session.user.modCases <= 0) return res.status(400).json({ error: "No Mod Cases left" })
      req.session.user.modCases -= 1;
    }
    let isModCoins = req.body.skin.title === "Mod Coins";
    if (isModCoins) {
      req.session.user.coins += req.body.skin.price; // Add coins to the user's coins property
      const user = await User.findByIdAndUpdate(
        { _id: req.session.user._id },
        { coins: req.session.user.coins, modCases: req.session.user.modCases, super_modCases: req.session.user.super_modCases },
        { new: true }
      );
      await SystemLog.create({ //logging
        type: 0, 
        text: `${req.session.user.username} just got a drop from ${isSuperCase ? "Super Mod Case" : "Mod Case"}: x${req.body.skin.price} ${req.body.skin.title}`, 
        date: newDate()
      });
      return res.status(200).json(user);
    }
    // If it's not "Mod Points", create a new skin and add it to the user's skins array
    const skin = await Skin.create(req.body.skin);
    const user = await User.findByIdAndUpdate(
      { _id: req.session.user._id },
      { $push: { skins: skin._id }, modCases: req.session.user.modCases, super_modCases: req.session.user.super_modCases },
      { new: true }
    );
    await SystemLog.create({ //logging
      type: 0, 
      text: `${req.session.user.username} just got a drop from ${isSuperCase ? "Super Mod Case" : "Mod Case"}: ${skin.title}`, 
      date: newDate()
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const sendSkinToUser = async (req, res) => {
  try {
    const { reqUserId, reqSkin, reqGiveaway } = req.body;

    if(reqGiveaway.winner !== reqUserId) {
      return res.status(404).json({ error: "You are not the winner." });
    }

    let isModCoins = reqSkin.title === "Mod Coins";
    let isModCase = reqSkin.title === "Mod Case";
    let isSuperModCase = reqSkin.title === "SUPER Mod Case";

    let reqUser = await User.findOne({ _id: reqUserId });
    if (!reqUser) return res.status(404).json({ error: "User not found" });
    if (isModCoins) {
      reqUser.coins += reqSkin.price; // price = antal från giveaway
      const user = await User.findByIdAndUpdate(
        { _id: reqUser._id },
        { coins: reqUser.coins },
        { new: true }
      );
      
      return res.status(200).json(user);
    }
    if (isModCase) {
      reqUser.modCases += reqSkin.price; // price = antal från giveaway
      const user = await User.findByIdAndUpdate(
        { _id: reqUser._id },
        { modCases: reqUser.modCases },
        { new: true }
      );
      return res.status(200).json(user);
    }
    if (isSuperModCase) {
      reqUser.super_modCases += reqSkin.price; // price = antal från giveaway
      const user = await User.findByIdAndUpdate(
        { _id: reqUser._id },
        { super_modCases: reqUser.super_modCases },
        { new: true }
      );
      return res.status(200).json(user);
    }
    // If it's not "Mod Coins" or "Mod Case", create a new skin and add it to the user's skins array
    const skin = await Skin.create(reqSkin);
    await User.findByIdAndUpdate(
      { _id: reqUser._id },
      { $push: { skins: skin._id } },
      { new: true }
    );

    res.status(200).json({ message: "Skin sent to user" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const buySkin = async (req, res) => {
  try {
    if (!req.session.user)
      return res.status(404).json({ error: "User not logged in" });
    if (req.session.user.coins < req.body.price)
      return res
        .status(400)
        .json({ error: "You don't have enough Mod Coins" });

    req.session.user.coins -= req.body.price; // Deduct the price from the user's coins

    const skin = await Skin.create(req.body);
    const user = await User.findByIdAndUpdate(
      { _id: req.session.user._id },
      {
        $push: { skins: skin._id },
        coins: req.session.user.coins, // Update the user's coins
      },
      { new: true }
    );
    await SystemLog.create({ //logging
      type: 0, 
      text: `${req.session.user.username} has bought: ${skin.title}`, 
      date: newDate()
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const sellSkin = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(404).json({ error: "User not logged in" });
    }

    const { skinId } = req.body;

    // Find the skin by ID
    const skin = await Skin.findById({ _id: skinId });
    if (!skin) {
      return res.status(404).json({ error: "Skin not found" });
    }

    // Check if the skin belongs to the user
    const user = await User.findById(req.session.user._id);
    if (!user.skins.includes(skinId)) {
      return res.status(400).json({ error: "Skin does not belong to user" });
    }

    // Calculate the amount to return to the user
    const refundAmount = skin.price * 0.7;

    // Check if the skin title matches the user's avatar src
    if (user.avatar.src === skin.title) {
      user.avatar.src = "classic_knife-1"; // Default avatar src
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.session.user._id,
      {
        $pull: { skins: skinId },
        $inc: { coins: refundAmount },
        avatar: user.avatar, // Update avatar if it was reset
      },
      { new: true }
    );

    await Skin.findByIdAndDelete(skinId);
    await SystemLog.create({
      type: 0,
      text: `${req.session.user.username} has sold: ${skin.title} for ${refundAmount}`,
      date: newDate()
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// getAllSkins - för store, för att en Super ska kunna ändra priset på dem.
