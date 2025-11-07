// controllers/classController.js
import Class from "../models/Class.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private
export const createClass = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    // Validation
    if (!name || !code) {
      return res.status(400).json({
        message: "Name and code are required",
      });
    }

    // Auto-format code: uppercase and remove spaces
    const formattedCode = code.trim().toUpperCase().replace(/\s+/g, "");

    // Check if code already exists
    const existingClass = await Class.findOne({ code: formattedCode });
    if (existingClass) {
      return res.status(400).json({
        message: "A class with this code already exists",
      });
    }

    const userId = req.user.id;
    // Create the class
    const newClass = new Class({
      name: name.trim(),
      code: formattedCode,
      description: description?.trim() || "",
      members: [userId],
      createdBy: userId,
    });

    await newClass.save();

    // Add class to creator's classes array
    await User.findByIdAndUpdate(userId, {
      $addToSet: { classes: newClass._id },
    });

    res.status(201).json({
      message: "Class created successfully",
      class: {
        _id: newClass._id,
        name: newClass.name,
        code: newClass.code,
        description: newClass.description,
        memberCount: 1,
        createdBy: newClass.createdBy,
        createdAt: newClass.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .sort({ createdAt: -1 }) // Most recent first
      .select("name code description members createdAt");

    const classesWithCount = classes.map((cls) => ({
      _id: cls._id,
      name: cls.name,
      code: cls.code,
      description: cls.description,
      memberCount: cls.members.length,
      createdAt: cls.createdAt,
    }));

    res.json({ classes: classesWithCount });
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single class details
// @route   GET /api/classes/:id
// @access  Private
export const getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id).populate(
      "members",
      "name major bio"
    );

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    const isCurrentUserMember = classData.members.some(
      (member) => member._id.toString() === req.user.id
    );

    res.json({
      _id: classData._id,
      name: classData.name,
      code: classData.code,
      description: classData.description,
      memberCount: classData.members.length,
      members: classData.members,
      isCurrentUserMember,
      createdBy: classData.createdBy,
      createdAt: classData.createdAt,
    });
  } catch (error) {
    console.error("Error fetching class:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Class not found" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Join a class
// @route   POST /api/classes/:id/join
// @access  Private
export const joinClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Check if user is already a member
    if (classData.members.includes(req.user.id)) {
      return res.status(400).json({
        message: "You are already a member of this class",
      });
    }

    // Add user to class members
    classData.members.push(req.user.id);
    await classData.save();

    // Add class to user's classes
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { classes: classData._id },
    });

    res.json({
      message: "Successfully joined class",
      class: {
        _id: classData._id,
        name: classData.name,
        code: classData.code,
        memberCount: classData.members.length,
      },
    });
  } catch (error) {
    console.error("Error joining class:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Class not found" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Leave a class
// @route   POST /api/classes/:id/leave
// @access  Private
export const leaveClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Check if user is a member
    if (!classData.members.includes(req.user.id)) {
      return res.status(400).json({
        message: "You are not a member of this class",
      });
    }

    // Remove user from class members
    classData.members = classData.members.filter(
      (memberId) => memberId.toString() !== req.user.id
    );
    await classData.save();

    // Remove class from user's classes
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { classes: classData._id },
    });

    res.json({
      message: "Successfully left class",
      class: {
        _id: classData._id,
        name: classData.name,
        code: classData.code,
        memberCount: classData.members.length,
      },
    });
  } catch (error) {
    console.error("Error leaving class:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Class not found" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all members of a class
// @route   GET /api/classes/:id/members
// @access  Private
export const getClassMembers = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id).populate(
      "members",
      "name major bio"
    );

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Sort members alphabetically by name
    const sortedMembers = classData.members.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    res.json({
      members: sortedMembers,
      count: sortedMembers.length,
    });
  } catch (error) {
    console.error("Error fetching class members:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Class not found" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
