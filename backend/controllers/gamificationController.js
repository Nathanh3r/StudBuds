// controllers/gamificationController.js

import {
  getGamificationStats,
  getLeaderboard,
  getUserRank,
} from "../services/xpService.js";
import { ACHIEVEMENTS, getRankForLevel } from "../config/gamification.js";

/**
 * @desc    Get current user's gamification stats
 * @route   GET /api/gamification/stats
 * @access  Private
 */
export const getMyStats = async (req, res) => {
  try {
    const stats = await getGamificationStats(req.user._id);

    if (!stats) {
      return res.status(404).json({ message: "Stats not found" });
    }

    // Get user's rank on leaderboard
    const rank = await getUserRank(req.user._id);

    return res.json({
      success: true,
      stats: {
        ...stats,
        leaderboardRank: rank,
      },
    });
  } catch (error) {
    console.error("getMyStats error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get global leaderboard
 * @route   GET /api/gamification/leaderboard
 * @access  Private
 */
export const getGlobalLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const leaderboard = await getLeaderboard(limit);

    // Find current user's position
    const userPosition = leaderboard.findIndex(
      (entry) => entry.userId.toString() === req.user._id.toString()
    );

    return res.json({
      success: true,
      leaderboard,
      userPosition: userPosition !== -1 ? userPosition : null,
      totalUsers: leaderboard.length,
    });
  } catch (error) {
    console.error("getGlobalLeaderboard error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get all available achievements
 * @route   GET /api/gamification/achievements
 * @access  Private
 */
export const getAllAchievements = async (req, res) => {
  try {
    const user = req.user;

    // Get user's unlocked achievement IDs
    const unlockedIds = user.gamification.achievements.map(
      (a) => a.achievementId
    );

    // Format all achievements with unlock status
    const achievements = Object.entries(ACHIEVEMENTS).map(
      ([id, achievement]) => {
        const unlocked = unlockedIds.includes(id);
        const unlockedData = user.gamification.achievements.find(
          (a) => a.achievementId === id
        );

        return {
          id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          xpReward: achievement.xpReward,
          unlocked,
          unlockedAt: unlocked ? unlockedData.unlockedAt : null,
        };
      }
    );

    return res.json({
      success: true,
      achievements,
      unlockedCount: unlockedIds.length,
      totalCount: Object.keys(ACHIEVEMENTS).length,
    });
  } catch (error) {
    console.error("getAllAchievements error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get rank information for all levels
 * @route   GET /api/gamification/ranks
 * @access  Public
 */
export const getRanks = async (req, res) => {
  try {
    const { RANKS } = await import("../config/gamification.js");

    return res.json({
      success: true,
      ranks: RANKS,
    });
  } catch (error) {
    console.error("getRanks error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get user's activity summary
 * @route   GET /api/gamification/activity
 * @access  Private
 */
export const getActivitySummary = async (req, res) => {
  try {
    const user = req.user;

    const summary = {
      studySessions: user.gamification.studySessionCount || 0,
      notesUploaded: user.gamification.notesUploadedCount || 0,
      postsCreated: user.gamification.postsCreatedCount || 0,
      friendsAdded: user.friends.length,
      classesJoined: user.classes.length,
      currentStreak: user.gamification.streak?.count || 0,
      lastLogin: user.gamification.streak?.lastLoginDate || null,
    };

    return res.json({
      success: true,
      activity: summary,
    });
  } catch (error) {
    console.error("getActivitySummary error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
