// backend/routes/noteRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  getNotes,
  uploadNote,
  deleteNote,
  likeNote,
  trackDownload,
} from "../controllers/noteController.js";
import { protect } from "../middleware/authMiddleware.js";

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

// @route   GET /api/classes/:classId/notes
// @desc    Get all notes for a class
// @access  Private
router.get("/:classId/notes", protect, getNotes);

// @route   POST /api/classes/:classId/notes
// @desc    Upload a note
// @access  Private
router.post("/:classId/notes", protect, upload.single("file"), uploadNote);

// @route   DELETE /api/notes/:noteId
// @desc    Delete a note
// @access  Private
router.delete("/:noteId", protect, deleteNote);

// @route   POST /api/notes/:noteId/like
// @desc    Like/unlike a note
// @access  Private
router.post("/:noteId/like", protect, likeNote);

// @route   POST /api/notes/:noteId/download
// @desc    Track download
// @access  Private
router.post("/:noteId/download", protect, trackDownload);

export default router;
