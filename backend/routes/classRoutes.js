// backend/routes/classRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { protect } from "../middleware/authMiddleware.js";
import {
  createPost,
  getClassPosts,
  deletePost,
  editPost,
} from "../controllers/postController.js";
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
  getNotes,
  uploadNote,
  trackDownload,
} from "../controllers/noteController.js";
import {
  createStudySession,
  getClassStudySessions,
  getUserStudyStats,
} from "../controllers/studySessionController.js";

const router = express.Router();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/notes/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, Word, PowerPoint, and images are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

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

// ===== POSTS ROUTES =======
// CREATE A POST IN A CLASS
router.post("/:id/posts", protect, createPost);

// GET POSTS FROM A CLASS
router.get("/:id/posts", protect, getClassPosts);

// DELETE A POST
router.delete("/:id/posts/:postId", protect, deletePost);

// EDIT A POST
router.put("/:id/posts/:postId", protect, editPost);

// ===== NOTES ROUTES =====
// GET NOTES FOR A CLASS
router.get("/:classId/notes", protect, getNotes);

// UPLOAD A NOTE TO A CLASS
router.post("/:classId/notes", protect, upload.single("file"), uploadNote);

// ===== STUDY SESSION ROUTES =====
router.post("/:classId/study-sessions", protect, createStudySession);
router.get("/:classId/study-sessions", protect, getClassStudySessions);
router.get("/:classId/study-sessions/stats", protect, getUserStudyStats);

export default router;
