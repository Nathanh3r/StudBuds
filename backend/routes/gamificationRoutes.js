// routes/gamificationRoutes.js

import express from "express";
import {
  getMyStats,
  getGlobalLeaderboard,
  getAllAchievements,
  getRanks,
  getActivitySummary,
} from "../controllers/gamificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get current user's gamification stats
router.get("/stats", protect, getMyStats);

// Get global leaderboard
router.get("/leaderboard", protect, getGlobalLeaderboard);

// Get all achievements (with unlock status)
router.get("/achievements", protect, getAllAchievements);

// Get all available ranks/titles
router.get("/ranks", getRanks);

// Get activity summary
router.get("/activity", protect, getActivitySummary);

export default router;
