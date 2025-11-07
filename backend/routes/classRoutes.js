import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createPost, getClassPosts } from "../controllers/postController.js";
import {
  createClass,
  getAllClasses,
  getClassById,
  joinClass,
  leaveClass,
  getClassMembers,
} from "../controllers/classController.js";

const router = express.Router();

// CREATE CLASS
router.post("/", protect, createClass);

// GET ALL CLASSES
router.get("/", protect, getAllClasses);

// GET SINGLE CLASS DETAILS
router.get("/:id", protect, getClassById);

// JOIN CLASS
router.post("/:id/join", protect, joinClass);

// LEAVE CLASS
router.post("/:id/leave", protect, leaveClass);

// GET CLASS MEMBERS
router.get("/:id/members", protect, getClassMembers);

// CREATE A POST IN A CLASS
router.post("/:id/posts", protect, createPost);

// GET POSTS FROM A CLASS
router.get("/:id/posts", protect, getClassPosts);

export default router;
