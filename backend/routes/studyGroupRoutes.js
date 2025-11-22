import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getStudyGroupById } from "../controllers/studyGroupController.js";

const router = express.Router();

router.get("/:groupId", protect, getStudyGroupById);

export default router;
