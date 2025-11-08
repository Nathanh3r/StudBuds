const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

require("dotenv").config();        // MUST be before requiring db/connect
console.log("MONGODB_URI present:", !!process.env.MONGODB_URI);
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    database: "connected",
  });
});

// CREATE: Add a test user
app.post("/api/test/users", async (req, res) => {
  try {
    const { name, email, major } = req.body;

    const user = await User.create({
      name,
      email,
      major: major || "Undeclared",
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// READ: Get all users
app.get("/api/test/users", async (req, res) => {
  try {
    const users = await User.find();

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// READ: Get single user by ID
app.get("/api/test/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE: Remove a user by ID
app.delete("/api/test/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE: Remove ALL users (be careful!)
app.delete("/api/test/users", async (req, res) => {
  try {
    const result = await User.deleteMany({});

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} users`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Test database route
app.get("/api/test-db", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const dbState = mongoose.connection.readyState;
    const states = ["disconnected", "connected", "connecting", "disconnecting"];

    res.json({
      success: true,
      database: states[dbState],
      message:
        dbState === 1 ? "Database is connected!" : "Database is not connected",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// mount classes API (ADD THIS LINE)
app.use("/api/classes", require("./routes/classRoutes"));

const PORT = process.env.PORT || 5001;

app.listen(process.env.PORT || 5001, "127.0.0.1", () => {
  console.log(`🚀 Server running on http://127.0.0.1:${process.env.PORT || 5001}`);
});
