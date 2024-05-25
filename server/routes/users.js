import express from "express";
import {
  addCoins,
  createUser,
  getUser,
  getUsers,
  updateAllUsers,
  updateAvatar,
  updateAvatarBorder,
  updateUser,
} from "../controllers/userController.js";
import { FLAGS, checkFlag } from "../middlewares/roles.js";


const router = express.Router();

router.get("/", getUsers);

router.get("/:id", getUser); // kommer in som req.body?

router.post("/", createUser);

router.patch("/gift/all-users", checkFlag([FLAGS.SUPER]), updateAllUsers);
router.patch("/:id", checkFlag([FLAGS.SUPER]), updateUser);

router.patch("/avatar/change", updateAvatar);

router.patch("/border/change-border", updateAvatarBorder);

router.patch("/give-coins/auto", addCoins);


export default router;
