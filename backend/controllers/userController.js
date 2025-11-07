// controllers/userController.js

import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateToken } from "../utils/genToken.js";

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, major, bio } = req.body;
    if (!name || !email || !password || !major) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!/\.edu$/i.test(email)) {
      return res.status(400).json({ message: "Email must end with .edu" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      major,
      bio: bio || "",
    });

    await user.save();

    const token = generateToken(user._id);
    const safeUser = await User.findById(user._id).select("-password");

    return res.status(201).json({ token, user: safeUser });
  } catch (err) {
    console.error("registerUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing email or password" });

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);
    const safeUser = await User.findById(user._id).select("-password");

    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error("loginUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    // req.user set by protect middleware
    return res.json({ user: req.user });
  } catch (err) {
    console.error("getMe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/update
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { bio, major } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (bio !== undefined) user.bio = bio;
    if (major !== undefined) user.major = major;

    await user.save();
    const safeUser = await User.findById(userId).select("-password");
    return res.json({ user: safeUser });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add a friend
// @route   POST /api/users/add-friend/:id
// @access  Private
export const addFriend = async (req, res) => {
  try {
    const targetId = req.params.id;
    const meId = req.user._id.toString();

    if (targetId === meId)
      return res
        .status(400)
        .json({ message: "Cannot add yourself as a friend" });

    const me = await User.findById(meId);
    const target = await User.findById(targetId);
    if (!target)
      return res.status(404).json({ message: "Target user not found" });

    if (!me.friends.map(String).includes(targetId)) {
      me.friends.push(target._id);
      await me.save();
    }

    const safeUser = await User.findById(meId).select("-password");
    return res.json({ user: safeUser });
  } catch (err) {
    console.error("addFriend error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all friends with full details
// @route   GET /api/users/friends
// @access  Private
export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate(
      "friends",
      "name email major bio"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      friends: user.friends,
      count: user.friends.length,
    });
  } catch (err) {
    console.error("getFriends error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get a specific user's public profile
// @route   GET /api/users/:id
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select(
      "name email major bio classes friends"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if current user is friends with this user
    const currentUserId = req.user._id.toString();
    const isFriend = user.friends.map(String).includes(currentUserId);

    return res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        major: user.major,
        bio: user.bio,
        isFriend,
        friendCount: user.friends.length,
        classCount: user.classes.length,
      },
    });
  } catch (err) {
    console.error("getUserProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Remove a friend
// @route   DELETE /api/users/remove-friend/:id
// @access  Private
export const removeFriend = async (req, res) => {
  try {
    const targetId = req.params.id;
    const meId = req.user._id.toString();

    if (targetId === meId) {
      return res
        .status(400)
        .json({ message: "Cannot remove yourself as a friend" });
    }

    const me = await User.findById(meId);
    const target = await User.findById(targetId);

    if (!target) {
      return res.status(404).json({ message: "Target user not found" });
    }

    // Remove target from my friends list
    me.friends = me.friends.filter((id) => id.toString() !== targetId);
    await me.save();

    // Remove me from target's friends list (mutual unfriend)
    target.friends = target.friends.filter((id) => id.toString() !== meId);
    await target.save();

    const safeUser = await User.findById(meId).select("-password");
    return res.json({
      message: "Friend removed successfully",
      user: safeUser,
    });
  } catch (err) {
    console.error("removeFriend error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Search users by name or email
// @route   GET /api/users/search?q=searchterm
// @access  Private
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchRegex = new RegExp(q.trim(), "i");

    const users = await User.find({
      $or: [{ name: searchRegex }, { email: searchRegex }],
      _id: { $ne: req.user._id }, // Exclude current user
    })
      .select("name email major bio")
      .limit(20); // Limit results

    return res.json({
      users,
      count: users.length,
    });
  } catch (err) {
    console.error("searchUsers error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
