import express from "express";
import {
  addAvatarBorder,
  addCoins,
  createUser,
  getTopReports,
  getTopTickets,
  getUser,
  getUsers,
  setHandleRole,
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

router.patch("/border/add/border", addAvatarBorder)

router.patch("/give-coins/auto", addCoins);

router.get("/top/tickets", getTopTickets);

router.get("/top/reports", getTopReports);

router.patch("/handle/role/new", setHandleRole);
export default router;
