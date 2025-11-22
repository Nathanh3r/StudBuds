// backend/models/StudySession.js
import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Core data
    type: {
      type: String,
      enum: ["timer", "manual-log", "group-session"],
      default: "manual-log",
    },
    duration: {
      type: Number,
      required: true,
      min: 1, // in minutes
    },

    // Content
    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    subtopics: [
      {
        type: String,
        trim: true,
        maxlength: 100,
      },
    ],
    whatILearned: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "challenging"],
      default: "medium",
    },

    // Context
    studyTechnique: {
      type: String,
      enum: [
        "Pomodoro",
        "Active Recall",
        "Spaced Repetition",
        "Practice Problems",
        "Group Discussion",
        "Video Lectures",
        "Reading",
        "Other",
      ],
    },
    location: {
      type: String,
      maxlength: 100,
    },

    // Social
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: {
          type: String,
          required: true,
          maxlength: 500,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Timestamps
    startedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for queries
studySessionSchema.index({ classId: 1, createdAt: -1 });
studySessionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("StudySession", studySessionSchema);
