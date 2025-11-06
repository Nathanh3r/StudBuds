import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  addFriend,
  enrollClass,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// REGISTER NEW USER
router.post("/register", registerUser);

// LOGIN USER
router.post("/login", loginUser);

// GET CURRENT USER PROFILE
router.get("/me", protect, getMe);

// UPDATE USER PROFILE
router.put("/update", protect, updateProfile);

// ADD FRIEND
router.post("/add-friend/:id", protect, addFriend);

// ENROLL IN CLASS
router.post("/enroll-class/:id", protect, enrollClass);

export default router;
