import express from "express";
import { config } from "dotenv";
import mongoose, {startSession} from "mongoose";
import userRoutes from "./routes/users.js"
import systemRoutes from "./routes/system.js"
import authRoutes from "./routes/auth.js"
import ticketRoute from "./routes/tickets.js"
import skinRoutes from "./routes/skin.js"
import session from "express-session";

config({ path: "../.env" });
const app = express();
app.use(express.json())
app.use(
  session({
    secret: process.env.SECRET_TOKEN, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use("/api/users", userRoutes)
app.use("/api/system", systemRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/tickets", ticketRoute)
app.use("/api/skins", skinRoutes)

const PORT = process.env.PORT || "deployURL";

mongoose.connect(process.env.MONGODB_URI).then(() => {
  app.listen(PORT, () => {
    console.log("Connected to database & listening on port: ", PORT);
  });
});

