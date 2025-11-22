// backend/controllers/studyGroupController.js

import StudyGroup from "../models/StudyGroup.js";
import Class from "../models/class.js";

// GET /api/classes/:id/study-groups
export const getStudyGroupsForClass = async (req, res) => {
  try {
    const { id: classId } = req.params;

    const groups = await StudyGroup.find({ class: classId })
      .populate("createdBy", "name email major")
      .populate("members", "name email major");

    return res.json({ groups });
  } catch (error) {
    console.error("getStudyGroupsForClass error:", error);
    return res.status(500).json({ message: "Failed to fetch study groups" });
  }
};

// POST /api/classes/:id/study-groups
export const createStudyGroup = async (req, res) => {
  try {
    const { id: classId } = req.params;
    const { name, description, scheduledAt, location } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    const group = await StudyGroup.create({
      class: classId,
      name,
      description: description || "",
      createdBy: req.user._id,
      members: [req.user._id], // creator auto-joins
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      location: location || "",
    });

    // Re-fetch with all the populated fields we care about
    const populated = await StudyGroup.findById(group._id)
      .populate("createdBy", "name email major")
      .populate("members", "name email major")
      .populate("class", "code name");

    return res.status(201).json({ group: populated });
  } catch (error) {
    console.error("createStudyGroup error:", error);
    return res.status(500).json({ message: "Failed to create study group" });
  }
};

// POST /api/classes/:id/study-groups/:groupId/join
export const joinStudyGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Study group not found" });
    }

    const alreadyMember = group.members.some(
      (m) => m.toString() === userId.toString()
    );

    if (!alreadyMember) {
      group.members.push(userId);
      await group.save();
    }

    const populated = await StudyGroup.findById(group._id)
      .populate("createdBy", "name email major")
      .populate("members", "name email major")
      .populate("class", "code name");

    return res.json({ group: populated });
  } catch (error) {
    console.error("joinStudyGroup error:", error);
    return res.status(500).json({ message: "Failed to join study group" });
  }
};

// POST /api/classes/:id/study-groups/:groupId/leave
export const leaveStudyGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Study group not found" });
    }

    group.members = group.members.filter(
      (m) => m.toString() !== userId.toString()
    );
    await group.save();

    const populated = await StudyGroup.findById(group._id)
      .populate("createdBy", "name email major")
      .populate("members", "name email major")
      .populate("class", "code name");

    return res.json({ group: populated });
  } catch (error) {
    console.error("leaveStudyGroup error:", error);
    return res.status(500).json({ message: "Failed to leave study group" });
  }
};

// GET /api/study-groups/:groupId
export const getStudyGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await StudyGroup.findById(groupId)
      .populate("class", "code name term instructor")
      .populate("createdBy", "name email major")
      .populate("members", "name email major");

    if (!group) {
      return res.status(404).json({ message: "Study group not found" });
    }

    return res.json({ group });
  } catch (error) {
    console.error("getStudyGroupById error:", error);
    return res.status(500).json({ message: "Failed to fetch study group" });
  }
};

// DELETE /api/classes/:id/study-groups/:groupId
export const deleteStudyGroup = async (req, res) => {
  try {
    const { id: classId, groupId } = req.params;
    const userId = req.user._id.toString();

    const group = await StudyGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Study group not found" });
    }

    if (group.class.toString() !== classId.toString()) {
      return res
        .status(400)
        .json({ message: "This study group does not belong to this class" });
    }

    // Only the creator can delete
    if (!group.createdBy || group.createdBy.toString() !== userId) {
      return res.status(403).json({
        message: "Only the group creator can delete this study group",
      });
    }

    await group.deleteOne();

    return res.json({ message: "Study group deleted successfully" });
  } catch (error) {
    console.error("deleteStudyGroup error:", error);
    return res
      .status(500)
      .json({ message: "Failed to delete study group" });
  }
};
