// routes/userRoutes.js

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/userController");

// Register and Login (Public)
router.post("/register", registerUser);
router.post("/login", loginUser);

// Get current user (Protected)
router.get("/me", protect, getMe);

module.exports = router;
