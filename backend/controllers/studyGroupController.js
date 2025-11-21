import StudyGroup from "../models/StudyGroup.js";
import Class from "../models/class.js";

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


//validate name, ensure class exists, create group
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

    const populated = await group
      .populate("createdBy", "name email major")
      .populate("members", "name email major");

    return res.status(201).json({ group: populated });
  } catch (error) {
    console.error("createStudyGroup error:", error);
    return res.status(500).json({ message: "Failed to create study group" });
  }
};

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

    const populated = await group
      .populate("createdBy", "name email major")
      .populate("members", "name email major");

    return res.json({ group: populated });
  } catch (error) {
    console.error("joinStudyGroup error:", error);
    return res.status(500).json({ message: "Failed to join study group" });
  }
};

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

    const populated = await group
      .populate("createdBy", "name email major")
      .populate("members", "name email major");

    return res.json({ group: populated });
  } catch (error) {
    console.error("leaveStudyGroup error:", error);
    return res.status(500).json({ message: "Failed to leave study group" });
  }
};
