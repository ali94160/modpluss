import express from "express";
import cors from "cors";
import { config } from "dotenv";
import mongoose, { startSession } from "mongoose";
import userRoutes from "./routes/users.js";
import systemRoutes from "./routes/system.js";
import authRoutes from "./routes/auth.js";
import ticketRoute from "./routes/tickets.js";
import skinRoutes from "./routes/skin.js";
import esportalLogs from "./routes/esportalLog.js";
import reportRoutes from "./routes/report.js";
import session from "express-session";

config({ path: "../.env" });
const app = express();
// Configure CORS
const corsOptions = {
  origin: "https://old.esportal.com",
  optionsSuccessStatus: 200, // For legacy browser support
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(
  session({
    secret: process.env.SECRET_TOKEN,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: null },
  })
);

app.use("/api/users", userRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoute);
app.use("/api/skins", skinRoutes);
app.use("/api/esportal-logs", esportalLogs);
app.use("/api/reports", reportRoutes)

const PORT = process.env.PORT;

mongoose.connect(process.env.MONGODB_URI).then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log("Connected to database & listening on port: ", PORT);
  });
}).catch(error => {
  console.error("Database connection error:", error);
  process.exit(1);
});
