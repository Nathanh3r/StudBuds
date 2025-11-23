// models/Post.js
import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
      trim: true,
      maxlength: [2000, "Post cannot exceed 2000 characters"],
    },
    type: {
      type: String,
      enum: ["chat", "announcement", "question", "resource"],
      default: "chat",
    },
    attachments: [
      {
        url: String,
        type: String,
        name: String,
      },
    ],
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: String,
      },
    ],
    editedAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
postSchema.index({ classId: 1, createdAt: -1 });
postSchema.index({ author: 1 });

export default mongoose.model("Post", postSchema);
