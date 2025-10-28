import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";

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

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing email or password" });

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
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

export const getMe = async (req, res) => {
  try {
    // req.user set by protect middleware
    return res.json({ user: req.user });
  } catch (err) {
    console.error("getMe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

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

export const addFriend = async (req, res) => {
  try {
    const targetId = req.params.id;
    const meId = req.user._id.toString();

    if (targetId === meId) return res.status(400).json({ message: "Cannot add yourself as a friend" });

    const me = await User.findById(meId);
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: "Target user not found" });

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

export const enrollClass = async (req, res) => {
  try {
    const classId = req.params.id;
    const meId = req.user._id;

    const user = await User.findById(meId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.classes.map(String).includes(classId)) {
      user.classes.push(classId);
      await user.save();
    }
    const safeUser = await User.findById(meId).select("-password");
    return res.json({ user: safeUser });
  } catch (err) {
    console.error("enrollClass error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
