import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js"

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Hello from Express backend!");
});
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is connected!" });
});
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
