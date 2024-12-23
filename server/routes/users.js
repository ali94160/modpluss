import express from "express";
import {
  addAvatarBorder,
  addCase,
  addCoins,
  changePassword,
  createUser,
  getDailyCaseReward,
  getTopReports,
  getTopTickets,
  getUser,
  getUserByUsername,
  getUsers,
  setHandleRole,
  setSelectedAchievement,
  updateAllUsers,
  updateAvatar,
  updateAvatarBorder,
  updateBalance,
  updateUser,
  updateUserPassword,
  updateUserQueuePermission,
} from "../controllers/userController.js";
import { FLAGS, checkFlag } from "../middlewares/roles.js";


const router = express.Router();

router.get("/", getUsers);

router.get("/:id", getUser); 
router.get("/get-single-user/by-username/:username", getUserByUsername)
router.post("/", createUser);

router.patch("/gift/all-users", checkFlag([FLAGS.SUPER]), updateAllUsers);
router.patch("/:id", checkFlag([FLAGS.SUPER]), updateUser);
router.patch("/queuePerm/:id", checkFlag([FLAGS.SUPER, FLAGS.ADMIN]), updateUserQueuePermission);

router.patch("/avatar/change", updateAvatar);

router.patch("/border/change-border", updateAvatarBorder);

router.patch("/border/add/border", addAvatarBorder)

router.patch("/give-coins/auto", addCoins);
router.patch("/give-case/by-username/add", addCase);

router.patch("/gamble/coins/new-coins", updateBalance);

router.get("/top/tickets", getTopTickets);

router.get("/top/reports", getTopReports);

router.patch("/handle/role/new", setHandleRole);
router.patch("/reward/modcase/daily", getDailyCaseReward)
router.put("/set-new/pass/:id", checkFlag([FLAGS.SUPER, FLAGS.ADMIN]), updateUserPassword);
router.put("/change/my-pass", changePassword)

router.patch("/set/achievement/change-by-id", setSelectedAchievement);
export default router;
