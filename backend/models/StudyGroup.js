import mongoose from "mongoose";

const studyGroupSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // scheduled time + location
    scheduledAt: {
      type: Date,
    },
    location: {
      type: String,
      default: "",
      maxlength: 200,
    },
  },
  { timestamps: true }
);

const StudyGroup =
  mongoose.models.StudyGroup || mongoose.model("StudyGroup", studyGroupSchema);

export default StudyGroup;
