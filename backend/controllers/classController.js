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

    if (!name || !code) {
      return res.status(400).json({
        message: "Name and code are required",
      });
    }

    const formattedCode = code.trim().toUpperCase().replace(/\s+/g, "");

    // Check if code already exists
    const existingClass = await Class.findOne({ code: formattedCode });
    if (existingClass) {
      return res.status(400).json({
        message: "A class with this code already exists",
      });
    }

    const userId = req.user.id;

    // Create user-created class
    const newClass = new Class({
      name: name.trim(),
      code: formattedCode,
      description: description?.trim() || "",
      isUserCreated: true, // Mark as user-created
      members: [userId],
      createdBy: userId,
    });

    await newClass.save();

    await User.findByIdAndUpdate(userId, {
      $addToSet: { classes: newClass._id },
    });

    res.status(201).json({
      message: "class created successfully",
      class: {
        _id: newClass._id,
        name: newClass.name,
        code: newClass.code,
        description: newClass.description,
        isUserCreated: newClass.isUserCreated,
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
    const { department, term, search, userCreatedOnly, catalogOnly } =
      req.query;

    let query = {};

    // Filter by type
    if (userCreatedOnly === "true") {
      query.isUserCreated = true;
    } else if (catalogOnly === "true") {
      query.isUserCreated = false;
    }

    // Filter by department (catalog classes only)
    if (department) {
      query.departmentCode = department.toUpperCase();
      query.isUserCreated = false;
    }

    // Filter by term (catalog classes only)
    if (term) {
      query.term = term;
      query.isUserCreated = false;
    }

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const classes = await Class.find(query)
      .sort({ isUserCreated: -1, code: 1 }) // User-created first, then by code
      .select(
        "name code description department departmentCode units instructor meetingTimes members isUserCreated term termCode year createdBy createdAt" // ADDED: term, termCode, year
      );

    const classesWithData = classes.map((cls) => ({
      _id: cls._id,
      name: cls.name,
      code: cls.code,
      description: cls.description,
      department: cls.department,
      departmentCode: cls.departmentCode,
      units: cls.units,
      instructor: cls.instructor,
      meetingTimes: cls.meetingTimes,
      isUserCreated: cls.isUserCreated,
      term: cls.term,
      termCode: cls.termCode,
      year: cls.year,
      memberCount: cls.members.length,
      isUserMember: cls.members.some((m) => m.toString() === req.user.id),
      createdAt: cls.createdAt,
    }));

    res.json({
      classes: classesWithData,
      count: classesWithData.length,
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Search classs
// @route   GET /api/classes/search
// @access  Private
export const searchClasses = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({ classs: [] });
    }

    const classes = await Class.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { code: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    })
      .limit(20)
      .select("code name description department units isUserCreated");

    res.json({ classs });
  } catch (error) {
    console.error("Error searching classes:", error);
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
      department: classData.department,
      departmentCode: classData.departmentCode,
      courseNumber: classData.courseNumber,
      term: classData.term,
      termCode: classData.termCode,
      year: classData.year,
      units: classData.units,
      instructor: classData.instructor,
      meetingTimes: classData.meetingTimes,
      sections: classData.sections,
      isUserCreated: classData.isUserCreated,
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
      return res.status(404).json({ message: "class not found" });
    }

    if (classData.members.includes(req.user.id)) {
      return res.status(400).json({
        message: "You are already a member of this class",
      });
    }

    classData.members.push(req.user.id);
    await classData.save();

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
      return res.status(404).json({ message: "class not found" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Leave a class
// @route   POST /api/classes/:id/leave
// @access  Private
export const leaveClass = async (req, res) => {
  try {
    const classData = await classData.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: "class not found" });
    }

    if (!classData.members.includes(req.user.id)) {
      return res.status(400).json({
        message: "You are not a member of this class",
      });
    }

    classData.members = classData.members.filter(
      (memberId) => memberId.toString() !== req.user.id
    );
    await classData.save();

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { classs: classData._id },
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
      return res.status(404).json({ message: "class not found" });
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
      return res.status(404).json({ message: "Course not found" });
    }

    const sortedMembers = classData.members.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    res.json({
      members: sortedMembers,
      count: sortedMembers.length,
    });
  } catch (error) {
    console.error("Error fetching course members:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
