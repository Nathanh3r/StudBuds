// models/user.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value) {
          return /\.edu$/.test(value);
        },
        message: "Email must be a valid .edu email address",
      },
    },
    iconColor: {
      type: String,
      default: "#4f46e5",
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    major: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: "",
    },
    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },

    // 🎮 GAMIFICATION FIELDS
    gamification: {
      // Core stats
      xp: {
        type: Number,
        default: 0,
        min: 0,
      },
      level: {
        type: Number,
        default: 1,
        min: 1,
      },

      // Activity counters (for achievements)
      studySessionCount: {
        type: Number,
        default: 0,
      },
      notesUploadedCount: {
        type: Number,
        default: 0,
      },
      postsCreatedCount: {
        type: Number,
        default: 0,
      },

      // Achievements
      achievements: [
        {
          achievementId: String,
          unlockedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],

      // Streak tracking
      streak: {
        count: {
          type: Number,
          default: 0,
        },
        lastLoginDate: {
          type: Date,
          default: null,
        },
      },

      // Daily activity tracking (to prevent XP farming)
      dailyActivity: {
        date: {
          type: Date,
          default: Date.now,
        },
        actions: {
          CREATE_POST: { type: Number, default: 0 },
          SEND_MESSAGE: { type: Number, default: 0 },
          DOWNLOAD_NOTE: { type: Number, default: 0 },
          CREATE_FLASHCARD: { type: Number, default: 0 },
        },
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare entered password with stored hash
userSchema.methods.comparePassword = async function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
