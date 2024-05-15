import express from "express";
import {
  createUser,
  getUser,
  getUsers,
  updateUser,
} from "../controllers/userController.js";
import { FLAGS, checkFlag } from "../middlewares/roles.js";


const router = express.Router();

router.get("/", getUsers);

router.get("/:id", getUser); // kommer in som req.body?

router.post("/", createUser);

router.patch("/:id", checkFlag([FLAGS.SUPER]), updateUser);


export default router;
