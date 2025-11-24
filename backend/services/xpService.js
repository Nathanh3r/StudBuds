// services/xpService.js

import User from "../models/user.js";
import StudySession from "../models/studySession.js";
import {
  XP_VALUES,
  DAILY_LIMITS,
  calculateLevel,
  getLevelProgress,
  getRankForLevel,
  getCurrentMultiplier,
  ACHIEVEMENTS,
} from "../config/gamification.js";

/**
 * Award XP to a user for an action
 * @param {string} userId - User ID
 * @param {string} action - Action type (e.g., 'JOIN_CLASS')
 * @param {object} metadata - Additional context about the action
 * @returns {object} Result with XP awarded and level up info
 */
export async function awardXP(userId, action, metadata = {}) {
  try {
    // 1. Validate action
    if (!XP_VALUES[action]) {
      console.warn(`Invalid XP action: ${action}`);
      return { awarded: false, reason: "Invalid action" };
    }

    // 2. Get user
    const user = await User.findById(userId);
    if (!user) {
      return { awarded: false, reason: "User not found" };
    }

    // 3. Check daily limits
    const canAward = checkDailyLimit(user, action);
    if (!canAward) {
      return { awarded: false, reason: "Daily limit reached" };
    }

    // 4. Calculate XP to award
    let xpToAward = XP_VALUES[action];

    // 5. Apply multipliers (streak, weekend)
    const multiplier = getCurrentMultiplier(user);
    xpToAward = Math.floor(xpToAward * multiplier);

    // 6. Store current level
    const oldLevel = user.gamification.level;

    // 7. Add XP
    user.gamification.xp += xpToAward;

    const newLevel = calculateLevel(user.gamification.xp);
    const leveledUp = newLevel > oldLevel;

    user.gamification.level = newLevel;

    // 9. Update daily activity
    updateDailyActivity(user, action);

    // 10. Update activity counters for achievements
    updateActivityCounters(user, action);

    // 11. Check for new achievements
    const newAchievements = await checkAchievements(user);

    // 12. Save user
    await user.save();

    // 13. Get level progress
    const progress = getLevelProgress(user.gamification.xp, newLevel);
    const rank = getRankForLevel(newLevel);

    return {
      awarded: true,
      xpAwarded: xpToAward,
      totalXP: user.gamification.xp,
      oldLevel,
      newLevel,
      leveledUp,
      rank: rank.title,
      progress,
      multiplier,
      newAchievements,
    };
  } catch (error) {
    console.error("Error awarding XP:", error);
    return { awarded: false, reason: "Server error" };
  }
}

/**
 * Check if user can receive XP for this action today
 */
function checkDailyLimit(user, action) {
  // Reset if new day
  const today = new Date().toDateString();
  const lastActivityDate = user.gamification.dailyActivity.date
    ? new Date(user.gamification.dailyActivity.date).toDateString()
    : null;

  if (today !== lastActivityDate) {
    // New day - reset counters
    user.gamification.dailyActivity.date = new Date();
    user.gamification.dailyActivity.actions = {
      CREATE_POST: 0,
      SEND_MESSAGE: 0,
      DOWNLOAD_NOTE: 0,
      CREATE_FLASHCARD: 0,
    };
  }

  // Check specific action limit
  const limit = DAILY_LIMITS[action];
  if (!limit) return true; // No limit for this action

  const count = user.gamification.dailyActivity.actions[action] || 0;
  return count < limit;
}

/**
 * Update daily activity counter
 */
function updateDailyActivity(user, action) {
  if (DAILY_LIMITS[action]) {
    if (!user.gamification.dailyActivity.actions[action]) {
      user.gamification.dailyActivity.actions[action] = 0;
    }
    user.gamification.dailyActivity.actions[action]++;
  }
}

/**
 * Update activity counters for achievements
 */
function updateActivityCounters(user, action) {
  const counterMap = {
    LOG_STUDY_SESSION: "studySessionCount",
    UPLOAD_NOTE: "notesUploadedCount",
    CREATE_POST: "postsCreatedCount",
  };

  const counter = counterMap[action];
  if (counter) {
    user.gamification[counter] = (user.gamification[counter] || 0) + 1;
  }
}

/**
 * Check if user unlocked any new achievements
 */
async function checkAchievements(user) {
  const newAchievements = [];

  // Get IDs of already unlocked achievements
  const unlockedIds = user.gamification.achievements.map(
    (a) => a.achievementId
  );

  // Check each achievement
  for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
    // Skip if already unlocked
    if (unlockedIds.includes(id)) continue;

    // Check if condition is met
    if (achievement.condition(user)) {
      // Unlock achievement
      user.gamification.achievements.push({
        achievementId: id,
        unlockedAt: new Date(),
      });

      // Award bonus XP
      user.gamification.xp += achievement.xpReward;

      newAchievements.push({
        id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward,
      });
    }
  }

  return newAchievements;
}

/**
 * Update user's login streak
 */
export async function updateLoginStreak(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return;
    }

    if (!user.gamification.streak) {
      user.gamification.streak = {
        count: 1,
        lastLoginDate: null,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastLogin = user.gamification.streak.lastLoginDate
      ? new Date(user.gamification.streak.lastLoginDate)
      : null;

    if (lastLogin) {
      lastLogin.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        // Already logged in today - do nothing
        return;
      } else if (daysDiff === 1) {
        // Consecutive day - increment streak
        user.gamification.streak.count++;

        // Award daily login XP
        const xpResult = await awardXP(userId, "DAILY_LOGIN");
        console.log("💎 Daily login XP awarded:", xpResult);
      } else if (daysDiff > 1) {
        // Streak broken - reset to 1
        user.gamification.streak.count = 1;

        await awardXP(userId, "DAILY_LOGIN");
      }
    } else {
      console.log("🎉 First login! Starting streak at 1");
      user.gamification.streak.count = 1;

      await awardXP(userId, "DAILY_LOGIN");
    }

    user.gamification.streak.lastLoginDate = new Date();
    await user.save();
  } catch (error) {}
}

/**
 * Get user's gamification stats
 */
export async function getGamificationStats(userId) {
  try {
    const user = await User.findById(userId).select("gamification");
    if (!user) return null;

    const level = user.gamification.level;
    const progress = getLevelProgress(user.gamification.xp, level);
    const rank = getRankForLevel(level);

    const studySessions = await StudySession.find({ userId }).select(
      "duration"
    );
    const totalStudyMinutes = studySessions.reduce(
      (sum, session) => sum + (session.duration || 0),
      0
    );

    return {
      xp: user.gamification.xp,
      level,
      rank: rank.title,
      rankColor: rank.color,
      progress,
      achievements: user.gamification.achievements.map((a) => {
        const achievement = ACHIEVEMENTS[a.achievementId];
        return {
          id: a.achievementId,
          name: achievement?.name,
          description: achievement?.description,
          icon: achievement?.icon,
          unlockedAt: a.unlockedAt,
        };
      }),
      streak: user.gamification.streak?.count || 0,
      totalStudyMinutes,
      studySessionCount: user.gamification.studySessionCount,
      notesUploadedCount: user.gamification.notesUploadedCount,
      postsCreatedCount: user.gamification.postsCreatedCount,
    };
  } catch (error) {
    console.error("Error getting gamification stats:", error);
    return null;
  }
}

/**
 * Get leaderboard (top users by XP)
 */
export async function getLeaderboard(limit = 50) {
  try {
    const users = await User.find()
      .select("name major gamification.xp gamification.level")
      .sort({ "gamification.xp": -1 })
      .limit(limit);

    return users.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      name: user.name,
      major: user.major,
      xp: user.gamification.xp,
      level: user.gamification.level,
      rankTitle: getRankForLevel(user.gamification.level).title,
    }));
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    return [];
  }
}

/**
 * Get user's rank on leaderboard
 */
export async function getUserRank(userId) {
  try {
    const user = await User.findById(userId).select("gamification.xp");
    if (!user) return null;

    const rank =
      (await User.countDocuments({
        "gamification.xp": { $gt: user.gamification.xp },
      })) + 1;

    return rank;
  } catch (error) {
    console.error("Error getting user rank:", error);
    return null;
  }
}
