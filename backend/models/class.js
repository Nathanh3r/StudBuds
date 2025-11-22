// models/Class.js
import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    // Basic Info (required for all courses)
    name: {
      type: String,
      required: [true, "Course name is required"],
      trim: true,
      maxlength: [200, "Course name cannot exceed 200 characters"],
    },
    code: {
      type: String,
      required: [true, "Course code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, "Course code cannot exceed 20 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },

    // Course Type
    isUserCreated: {
      type: Boolean,
      default: false, // false = UCR catalog course, true = user-created
    },

    // UCR Catalog Fields (only populated for UCR courses)
    department: String,
    departmentCode: String,
    courseNumber: String,
    term: String,
    termCode: String,
    year: Number,
    units: Number,
    instructionalMethod: String,

    instructor: {
      name: String,
      email: String,
    },

    meetingTimes: [
      {
        days: [String],
        startTime: String,
        endTime: String,
        location: String,
        building: String,
        room: String,
      },
    ],

    maxStudents: Number,
    enrolledCount: Number,
    seatsAvailable: Number,

    sections: [
      {
        crn: String,
        sectionNumber: String,
        scheduleType: String,
        instructor: String,
        instructorEmail: String,
        meetingTimes: [
          {
            days: [String],
            startTime: String,
            endTime: String,
            location: String,
          },
        ],
        enrollment: Number,
        maxEnrollment: Number,
        seatsAvailable: Number,
      },
    ],

    // Study Group Members (for both types)
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Creator (only for user-created courses)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
classSchema.index({ code: 1 });
classSchema.index({ department: 1 });
classSchema.index({ term: 1 });
classSchema.index({ isUserCreated: 1 });

// Virtual for member count
classSchema.virtual("memberCount").get(function () {
  // make sure members is at least an empty array
  return (this.members || []).length;
});

classSchema.set("toJSON", { virtuals: true });
classSchema.set("toObject", { virtuals: true });

//added to fix OverwriteModelError: Cannot overwrite `Class` model once compiled. error
const Class =
  mongoose.models.Class || mongoose.model("Class", classSchema);

export default Class;