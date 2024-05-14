//import mongoose from "mongoose";
import express from "express";
import { config } from "dotenv";
import mongoose from "mongoose";

config({ path: "../.env" });
const app = express();
app.use(express.json())

const PORT = process.env.PORT || "deployURL";

mongoose.connect(process.env.MONGODB_URI).then(() => {
  app.listen(PORT, () => {
    console.log("Connected to database & listening on port: ", PORT);
  });
});

