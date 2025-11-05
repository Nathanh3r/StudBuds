// routes/classRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { createPost, getClassPosts } = require("../controllers/postController");
const {
  createClass,
  getAllClasses,
  getClassById,
  joinClass,
  leaveClass,
  getClassMembers,
} = require("../controllers/classController");

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

// GET A POSST FROM A CLASS
router.get("/:id/posts", protect, getClassPosts);

module.exports = router;
