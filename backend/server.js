require("dotenv").config(); // Load .env variables
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Import your routes and middleware
const userRoutes = require("./routes/user.routes"); // Make sure path matches your project

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: "http://localhost:3000" })); // Frontend origin
app.use(express.json()); // Parse JSON request bodies

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Test routes
app.get("/", (req, res) => {
  res.send("Hello from Express backend!");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is connected!" });
});

// Mount user routes
app.use("/api/users", userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
