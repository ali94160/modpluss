import express from "express";
import {
  addAvatarBorder,
  addCoins,
  changePassword,
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
  updateUserPassword,
  updateUserQueuePermission,
} from "../controllers/userController.js";
import { FLAGS, checkFlag } from "../middlewares/roles.js";


const router = express.Router();

router.get("/", getUsers);

router.get("/:id", getUser); // kommer in som req.body?
router.post("/", createUser);

router.patch("/gift/all-users", checkFlag([FLAGS.SUPER]), updateAllUsers);
router.patch("/:id", checkFlag([FLAGS.SUPER]), updateUser);
router.patch("/queuePerm/:id", checkFlag([FLAGS.SUPER, FLAGS.ADMIN]), updateUserQueuePermission);

router.patch("/avatar/change", updateAvatar);

router.patch("/border/change-border", updateAvatarBorder);

router.patch("/border/add/border", addAvatarBorder)

router.patch("/give-coins/auto", addCoins);

router.get("/top/tickets", getTopTickets);

router.get("/top/reports", getTopReports);

router.patch("/handle/role/new", setHandleRole);
router.put("/set-new/pass/:id", checkFlag([FLAGS.SUPER, FLAGS.ADMIN]), updateUserPassword);
router.put("/change/my-pass", changePassword)
export default router;
