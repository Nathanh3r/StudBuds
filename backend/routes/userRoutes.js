import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  addFriend,
  removeFriend,
  getFriends,
  getUserProfile,
  searchUsers,
  getMyStudyGroups,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// REGISTER NEW USER
router.post("/register", registerUser);

// LOGIN USER
router.post("/login", loginUser);

// GET CURRENT USER PROFILE
router.get("/me", protect, getMe);

// Get current user's study groups
router.get("/me/study-groups", protect, getMyStudyGroups);

// UPDATE USER PROFILE
router.put("/update", protect, updateProfile);

// SEARCH USERS
router.get("/search", protect, searchUsers);

// GET ALL FRIENDS
router.get("/friends", protect, getFriends);

// ADD FRIEND
router.post("/add-friend/:id", protect, addFriend);

// REMOVE FRIEND
router.delete("/remove-friend/:id", protect, removeFriend);

// GET SPECIFIC USER PROFILE
router.get("/:id", protect, getUserProfile);

export default router;
