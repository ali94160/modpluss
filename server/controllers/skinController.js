// Kanske user.skins = [skins._id ?] OM man får flera av samma skin?
// Alla skins bör ligga i DB:b
// För hämtning vid store (allSkins kommer ha dubeletter, ta bara ut 1 av varje.) + mina skins OK med dubeltter, har olika _ids
import { Skin } from "../models/Skin.js";
import { User } from "../models/User.js";

export const addSkin = async (req, res) => {
  try {
    if (req.session.user.modCases <= 0) {
      return res.status(404).json({ error: "You don't have any Modcases" });
    }
    req.session.user.modCases -= 1;
    let isModCoins = req.body.title === "Mod Points";
    if (isModCoins) {
      req.session.user.coins += req.body.price; // Add coins to the user's coins property
      const user = await User.findByIdAndUpdate(
        { _id: req.session.user._id },
        { coins: req.session.user.coins, modCases: req.session.user.modCases },
        { new: true }
      );
      return res.status(200).json(user);
    }
    // If it's not "Mod Points", create a new skin and add it to the user's skins array
    const skin = await Skin.create(req.body);
    const user = await User.findByIdAndUpdate(
      { _id: req.session.user._id },
      { $push: { skins: skin._id }, modCases: req.session.user.modCases },
      { new: true }
    );
    res.status(200).json(user);
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

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// getAllSkins - för store, för att en Super ska kunna ändra priset på dem.
