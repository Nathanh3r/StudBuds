// models/class.js
const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Class name is required"],
    trim: true,
    maxlength: [100, "Class name cannot exceed 100 characters"],
  },
  code: {
    type: String,
    required: [true, "Class code is required"],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, "Class code cannot exceed 20 characters"],
  },
  description: {
    type: String,
    maxlength: [500, "Description cannot exceed 500 characters"],
    default: "",
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index on code field for fast lookups
classSchema.index({ code: 1 });

// Virtual for member count
classSchema.virtual("memberCount").get(function () {
  return this.members.length;
});

// Ensure virtuals are included in JSON
classSchema.set("toJSON", { virtuals: true });
classSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Class", classSchema);
