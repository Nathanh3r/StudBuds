// backend/routes/studySessionRoutes.js
import express from "express";
import {
  likeStudySession,
  deleteStudySession,
} from "../controllers/studySessionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   POST /api/study-sessions/:sessionId/like
// @desc    Like/unlike a study session
// @access  Private
router.post("/:sessionId/like", protect, likeStudySession);

// @route   DELETE /api/study-sessions/:sessionId
// @desc    Delete a study session
// @access  Private
router.delete("/:sessionId", protect, deleteStudySession);

export default router;
