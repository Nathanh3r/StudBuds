// backend/controllers/studySessionController.js
import StudySession from "../models/StudySession.js";
import Class from "../models/Class.js";

// @desc    Create a study session
// @route   POST /api/classes/:classId/study-sessions
// @access  Private
export const createStudySession = async (req, res) => {
  try {
    const { classId } = req.params;
    const {
      duration,
      topic,
      subtopics,
      whatILearned,
      difficulty,
      studyTechnique,
      location,
      type,
    } = req.body;

    // Validation
    if (!duration || !topic || !whatILearned) {
      return res.status(400).json({
        message: "Duration, topic, and what you learned are required",
      });
    }

    // Verify class exists and user is member
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (!classData.members.includes(req.user.id)) {
      return res.status(403).json({
        message: "You must be a member of this class",
      });
    }

    // Create study session
    const studySession = new StudySession({
      classId,
      userId: req.user.id,
      duration: parseInt(duration),
      topic: topic.trim(),
      subtopics: subtopics || [],
      whatILearned: whatILearned.trim(),
      difficulty: difficulty || "medium",
      studyTechnique,
      location,
      type: type || "manual-log",
      completedAt: new Date(),
    });

    await studySession.save();
    await studySession.populate("userId", "name major");

    res.status(201).json({
      message: "Study session logged successfully",
      studySession,
    });
  } catch (error) {
    console.error("Error creating study session:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all study sessions for a class
// @route   GET /api/classes/:classId/study-sessions
// @access  Private
export const getClassStudySessions = async (req, res) => {
  try {
    const { classId } = req.params;
    const { limit = 50, userId } = req.query;

    // Verify class exists and user is member
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (!classData.members.includes(req.user.id)) {
      return res.status(403).json({
        message: "You must be a member of this class",
      });
    }

    // Build query
    const query = { classId };
    if (userId) {
      query.userId = userId;
    }

    const studySessions = await StudySession.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("userId", "name major")
      .lean();

    // Calculate stats
    const totalMinutes = studySessions.reduce(
      (sum, session) => sum + session.duration,
      0
    );
    const totalHours = Math.floor(totalMinutes / 60);

    res.json({
      studySessions,
      count: studySessions.length,
      stats: {
        totalMinutes,
        totalHours,
        totalSessions: studySessions.length,
      },
    });
  } catch (error) {
    console.error("Error fetching study sessions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user's study stats for a class
// @route   GET /api/classes/:classId/study-sessions/stats
// @access  Private
export const getUserStudyStats = async (req, res) => {
  try {
    const { classId } = req.params;

    const sessions = await StudySession.find({
      classId,
      userId: req.user.id,
    });

    const totalMinutes = sessions.reduce(
      (sum, session) => sum + session.duration,
      0
    );
    const totalHours = Math.floor(totalMinutes / 60);

    // Calculate streak
    let currentStreak = 0;
    const today = new Date().setHours(0, 0, 0, 0);
    let checkDate = today;

    for (let i = 0; i < 30; i++) {
      const hasSession = sessions.some((session) => {
        const sessionDate = new Date(session.createdAt).setHours(0, 0, 0, 0);
        return sessionDate === checkDate;
      });

      if (hasSession) {
        currentStreak++;
        checkDate -= 24 * 60 * 60 * 1000; // Previous day
      } else if (i === 0) {
        // If no session today, check yesterday
        checkDate -= 24 * 60 * 60 * 1000;
        continue;
      } else {
        break;
      }
    }

    res.json({
      totalSessions: sessions.length,
      totalMinutes,
      totalHours,
      currentStreak,
      averageSessionMinutes: sessions.length
        ? Math.round(totalMinutes / sessions.length)
        : 0,
    });
  } catch (error) {
    console.error("Error fetching study stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Like a study session
// @route   POST /api/study-sessions/:sessionId/like
// @access  Private
export const likeStudySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await StudySession.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Study session not found" });
    }

    const userId = req.user.id;
    const hasLiked = session.likes.includes(userId);

    if (hasLiked) {
      session.likes = session.likes.filter((id) => id.toString() !== userId);
    } else {
      session.likes.push(userId);
    }

    await session.save();

    res.json({
      likes: session.likes.length,
      hasLiked: !hasLiked,
    });
  } catch (error) {
    console.error("Error liking study session:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a study session
// @route   DELETE /api/study-sessions/:sessionId
// @access  Private
export const deleteStudySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await StudySession.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Study session not found" });
    }

    if (session.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to delete this session",
      });
    }

    await session.deleteOne();

    res.json({ message: "Study session deleted successfully" });
  } catch (error) {
    console.error("Error deleting study session:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
