const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors({ origin: "http://localhost:3000" }));

// Middleware to parse JSON
app.use(express.json());

// Example route
app.get("/", (req, res) => {
  res.send("Hello from Express backend!");
});

//test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is connected!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
