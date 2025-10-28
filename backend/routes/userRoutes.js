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
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/update", protect, updateProfile);
router.post("/add-friend/:id", protect, addFriend);
router.post("/enroll-class/:id", protect, enrollClass);

export default router;
