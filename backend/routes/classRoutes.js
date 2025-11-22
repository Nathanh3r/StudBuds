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
  searchClasses,
} from "../controllers/classController.js";

import {
  getStudyGroupsForClass,
  createStudyGroup,
  joinStudyGroup,
  leaveStudyGroup,
  deleteStudyGroup,
} from "../controllers/studyGroupController.js";

const router = express.Router();

// SEARCH COURSES
router.get("/search", protect, searchClasses);

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

// STUDY GROUPS
router.get("/:id/study-groups", protect, getStudyGroupsForClass);
router.post("/:id/study-groups", protect, createStudyGroup);
router.post("/:id/study-groups/:groupId/join", protect, joinStudyGroup);
router.post("/:id/study-groups/:groupId/leave", protect, leaveStudyGroup);

router.delete("/:id/study-groups/:groupId", protect, deleteStudyGroup);


export default router;
