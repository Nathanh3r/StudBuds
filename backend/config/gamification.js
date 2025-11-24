// config/gamification.js

/**
 * XP VALUES
 * How much XP each action is worth
 */
export const XP_VALUES = {
  // Class actions
  JOIN_CLASS: 20,
  UPLOAD_NOTE: 15,
  DOWNLOAD_NOTE: 2,

  // Study actions
  LOG_STUDY_SESSION: 25,
  CREATE_FLASHCARD: 5,

  // Social actions
  CREATE_POST: 2,
  SEND_MESSAGE: 2,
  ADD_FRIEND: 10,

  // Daily actions
  DAILY_LOGIN: 5,

  // Study groups
  CREATE_STUDY_GROUP: 30, 
  JOIN_STUDY_GROUP: 10,
};

/**
 * DAILY LIMITS
 * Prevent XP farming by limiting certain actions per day
 */
export const DAILY_LIMITS = {
  CREATE_POST: 10, // Max 10 posts per day (20 XP max)
  SEND_MESSAGE: 10, // Max 10 messages per day (20 XP max)
  DOWNLOAD_NOTE: 20, // Max 20 downloads per day (40 XP max)
  CREATE_FLASHCARD: 50, // Max 50 flashcards per day (250 XP max)
  CREATE_STUDY_GROUP: 3, //Max creating 3 study groups per day
  JOIN_STUDY_GROUP: 5, //Max joining 5 study groups per day
};

/**
 * LEVEL THRESHOLDS
 * XP required to reach each level
 */
export const LEVEL_THRESHOLDS = [
  0, // Level 1
  100, // Level 2
  250, // Level 3
  450, // Level 4
  700, // Level 5
  1000, // Level 6
  1350, // Level 7
  1750, // Level 8
  2200, // Level 9
  2700, // Level 10
  3250, // Level 11
  3850, // Level 12
  4500, // Level 13
  5200, // Level 14
  5950, // Level 15
  6750, // Level 16
  7600, // Level 17
  8500, // Level 18
  9450, // Level 19
  10450, // Level 20
  // ... continues to level 100+
];

// Generate remaining levels (21-100)
for (let i = 21; i <= 100; i++) {
  const prevThreshold = LEVEL_THRESHOLDS[i - 1];
  const increment = 500 + (i - 20) * 50; // Gradually increasing
  LEVEL_THRESHOLDS.push(prevThreshold + increment);
}

/**
 * RANKS
 * Titles and colors for different level ranges
 */
export const RANKS = [
  { minLevel: 1, maxLevel: 5, title: "Freshman", color: "#10b981" }, // Green
  { minLevel: 6, maxLevel: 10, title: "Sophomore", color: "#3b82f6" }, // Blue
  { minLevel: 11, maxLevel: 20, title: "Junior", color: "#8b5cf6" }, // Purple
  { minLevel: 21, maxLevel: 35, title: "Senior", color: "#f59e0b" }, // Orange
  { minLevel: 36, maxLevel: 50, title: "Graduate", color: "#ef4444" }, // Red
  { minLevel: 51, maxLevel: 75, title: "Master", color: "#ec4899" }, // Pink
  { minLevel: 76, maxLevel: 100, title: "Professor", color: "#6366f1" }, // Indigo
  { minLevel: 101, maxLevel: 999, title: "Legend", color: "#eab308" }, // Gold
];

/**
 * ACHIEVEMENTS
 * Special milestones that award bonus XP
 */
export const ACHIEVEMENTS = {
  FIRST_STEPS: {
    name: "First Steps",
    description: "Join your first class",
    icon: "🎓",
    xpReward: 50,
    condition: (user) => user.classes?.length >= 1,
  },
  KNOWLEDGE_SHARER: {
    name: "Knowledge Sharer",
    description: "Upload 10 notes",
    icon: "📚",
    xpReward: 100,
    condition: (user) => user.gamification.notesUploadedCount >= 10,
  },
  STUDY_WARRIOR: {
    name: "Study Warrior",
    description: "Log 25 study sessions",
    icon: "⚔️",
    xpReward: 150,
    condition: (user) => user.gamification.studySessionCount >= 25,
  },
  SOCIAL_BUTTERFLY: {
    name: "Social Butterfly",
    description: "Add 10 friends",
    icon: "🦋",
    xpReward: 100,
    condition: (user) => user.friends?.length >= 10,
  },
  RISING_STAR: {
    name: "Rising Star",
    description: "Reach level 10",
    icon: "⭐",
    xpReward: 200,
    condition: (user) => user.gamification.level >= 10,
  },
  VETERAN: {
    name: "Veteran",
    description: "Reach level 25",
    icon: "🏆",
    xpReward: 500,
    condition: (user) => user.gamification.level >= 25,
  },
  LEGEND: {
    name: "Legend",
    description: "Reach level 50",
    icon: "👑",
    xpReward: 1000,
    condition: (user) => user.gamification.level >= 50,
  },
  ENGAGED: {
    name: "Engaged",
    description: "Create 50 posts",
    icon: "💬",
    xpReward: 100,
    condition: (user) => user.gamification.postsCreatedCount >= 50,
  },
  WEEK_WARRIOR: {
    name: "Week Warrior",
    description: "Maintain a 7-day login streak",
    icon: "🔥",
    xpReward: 100,
    condition: (user) => user.gamification.streak?.count >= 7,
  },
  MONTH_MASTER: {
    name: "Month Master",
    description: "Maintain a 30-day login streak",
    icon: "🔥",
    xpReward: 500,
    condition: (user) => user.gamification.streak?.count >= 30,
  },
};

/**
 * MULTIPLIERS
 * Bonus XP for certain conditions
 */
export const MULTIPLIERS = {
  WEEKEND: 1.5, // 50% bonus on weekends
  STREAK_7_DAYS: 1.1, // 10% bonus for 7+ day streak
  STREAK_30_DAYS: 1.2, // 20% bonus for 30+ day streak
};

/**
 * Calculate level from total XP
 */
export function calculateLevel(xp) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Get XP progress within current level
 */
export function getLevelProgress(totalXP, currentLevel) {
  const currentLevelXP = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const nextLevelXP = LEVEL_THRESHOLDS[currentLevel] || currentLevelXP + 1000;

  const xpInLevel = totalXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const percentage = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

  return {
    currentXP: xpInLevel,
    xpNeeded,
    percentage,
  };
}

/**
 * Get rank for a given level
 */
export function getRankForLevel(level) {
  const rank = RANKS.find((r) => level >= r.minLevel && level <= r.maxLevel);
  return rank || RANKS[RANKS.length - 1];
}

/**
 * Get current XP multiplier based on user state
 */
export function getCurrentMultiplier(user) {
  let multiplier = 1.0;

  // Weekend bonus
  const day = new Date().getDay();
  if (day === 0 || day === 6) {
    multiplier *= MULTIPLIERS.WEEKEND;
  }

  // Streak bonuses
  const streak = user.gamification.streak?.count || 0;
  if (streak >= 30) {
    multiplier *= MULTIPLIERS.STREAK_30_DAYS;
  } else if (streak >= 7) {
    multiplier *= MULTIPLIERS.STREAK_7_DAYS;
  }

  return multiplier;
}
