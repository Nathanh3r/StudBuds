// server.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import studySessionRoutes from "./routes/studySessionRoutes.js";
import path from "path";
import { protect } from "./middleware/authMiddleware.js";
import { trackDownload } from "./controllers/noteController.js";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to DB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.post("/api/notes/:noteId/download", protect, trackDownload);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/study-sessions", studySessionRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
