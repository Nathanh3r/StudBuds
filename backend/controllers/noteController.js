// backend/controllers/noteController.js
import Note from "../models/Note.js";
import Class from "../models/Class.js";

// @desc    Get all notes for a class
// @route   GET /api/classes/:classId/notes
// @access  Private (must be class member)
export const getNotes = async (req, res) => {
  try {
    const { classId } = req.params;

    // Verify class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Verify user is a member
    const isMember = classData.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (!isMember) {
      return res
        .status(403)
        .json({ message: "Must be a member to view notes" });
    }

    // Fetch notes
    const notes = await Note.find({ classId, isApproved: true })
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name major email")
      .lean();

    res.status(200).json({ notes, count: notes.length });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload a note
// @route   POST /api/classes/:classId/notes
// @access  Private (must be class member)
export const uploadNote = async (req, res) => {
  try {
    const { classId } = req.params;
    const { title, description, topic, tags } = req.body;
    const file = req.file;

    // Check if file was uploaded
    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    // Verify class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Verify user is a member
    const isMember = classData.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (!isMember) {
      return res
        .status(403)
        .json({ message: "Must be a member to upload notes" });
    }

    // Get the protocol and host from the request
    const baseUrl =
      process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const fileUrl = `${baseUrl}/uploads/notes/${file.filename}`;

    // Create note
    const note = new Note({
      title,
      description,
      fileUrl, // Now this is a full URL like http://localhost:4000/uploads/notes/...
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      classId,
      uploadedBy: req.user.id,
      topic,
      tags: tags ? JSON.parse(tags) : [],
    });

    await note.save();
    await note.populate("uploadedBy", "name major email");

    res.status(201).json({ note });
  } catch (error) {
    console.error("Error uploading note:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:noteId
// @access  Private (owner only)
export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Only owner can delete
    if (note.uploadedBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this note" });
    }

    await note.deleteOne();

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like/unlike a note
// @route   POST /api/notes/:noteId/like
// @access  Private
export const likeNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const userId = req.user.id;
    const hasLiked = note.likes.includes(userId);

    if (hasLiked) {
      // Unlike
      note.likes = note.likes.filter((id) => id.toString() !== userId);
    } else {
      // Like
      note.likes.push(userId);
    }

    await note.save();

    res.status(200).json({
      likes: note.likes.length,
      hasLiked: !hasLiked,
    });
  } catch (error) {
    console.error("Error liking note:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track download
// @route   POST /api/notes/:noteId/download
// @access  Private
export const trackDownload = async (req, res) => {
  try {
    const { noteId } = req.params;

    await Note.findByIdAndUpdate(noteId, { $inc: { downloadCount: 1 } });

    res.status(200).json({ message: "Download tracked" });
  } catch (error) {
    console.error("Error tracking download:", error);
    res.status(500).json({ message: error.message });
  }
};
