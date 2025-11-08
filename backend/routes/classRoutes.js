const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/classController");

// public for now
router.get("/", ctrl.listClasses);
router.get("/by-code/:code", ctrl.getClassByCode);
router.get("/:id", ctrl.getClassById);

// demo join/leave (no auth yet)
router.post("/", ctrl.createClass);
router.post("/:id/join", ctrl.joinClass);
router.post("/:id/leave", ctrl.leaveClass);

module.exports = router;
