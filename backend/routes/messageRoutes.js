// routes/messageRoutes.js
import express from "express";
import {
  sendMessage,
  getMessages,
  getConversations,
  markAsRead,
  getUnreadCount,
  deleteMessage,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post("/", protect, sendMessage);

// @route   GET /api/messages/conversations
// @desc    Get all conversations (must be before /:id route)
// @access  Private
router.get("/conversations", protect, getConversations);

// @route   GET /api/messages/unread-count
// @desc    Get unread message count
// @access  Private
router.get("/unread-count", protect, getUnreadCount);

// @route   GET /api/messages/:id
// @desc    Get messages with a specific user
// @access  Private
router.get("/:id", protect, getMessages);

// @route   PUT /api/messages/:id/read
// @desc    Mark messages from a user as read
// @access  Private
router.put("/:id/read", protect, markAsRead);

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message
// @access  Private
router.delete("/:messageId", protect, deleteMessage);

export default router;
