// models/Post.js
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
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
    maxlength: [1000, "Post cannot exceed 1000 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
postSchema.index({ classId: 1, createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
