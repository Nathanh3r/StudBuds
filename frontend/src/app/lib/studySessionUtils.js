// lib/studySessionUtils.js

/**
 * Utility functions for study session formatting and calculations
 */

/**
 * Format duration in minutes to human-readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "2h 30m", "45m")
 */
export function formatDuration(minutes) {
  if (!minutes || minutes === 0) return "0m";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
}

/**
 * Get difficulty color classes for Tailwind
 * @param {string} difficulty - Difficulty level ('easy', 'medium', 'challenging')
 * @returns {string} Tailwind classes for styling
 */
export function getDifficultyColor(difficulty) {
  const colors = {
    easy: "bg-green-100 text-green-700 border-green-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    challenging: "bg-red-100 text-red-700 border-red-200",
  };

  return colors[difficulty] || "bg-gray-100 text-gray-700 border-gray-200";
}

/**
 * Get difficulty color classes for dark mode
 * @param {string} difficulty - Difficulty level
 * @returns {string} Tailwind classes for dark mode
 */
export function getDifficultyColorDark(difficulty) {
  const colors = {
    easy: "bg-green-900/30 text-green-400 border-green-700",
    medium: "bg-yellow-900/30 text-yellow-400 border-yellow-700",
    challenging: "bg-red-900/30 text-red-400 border-red-700",
  };

  return colors[difficulty] || "bg-gray-800 text-gray-400 border-gray-700";
}

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {boolean} includeTime - Include time in format
 * @returns {string} Formatted date
 */
export function formatSessionDate(date, includeTime = false) {
  const d = new Date(date);

  const options = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };

  if (includeTime) {
    options.hour = "numeric";
    options.minute = "2-digit";
  }

  return d.toLocaleDateString("en-US", options);
}

/**
 * Format time for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted time (e.g., "2:30 PM")
 */
export function formatSessionTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Check if two dates are the same day
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date
 * @returns {boolean} True if same day
 */
export function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Calculate total study hours from sessions
 * @param {Array} sessions - Array of study sessions
 * @returns {number} Total hours (rounded to 1 decimal)
 */
export function calculateTotalHours(sessions) {
  if (!sessions || sessions.length === 0) return 0;

  const totalMinutes = sessions.reduce((sum, session) => {
    return sum + (session.duration || 0);
  }, 0);

  return Math.round((totalMinutes / 60) * 10) / 10;
}

/**
 * Get study session emoji based on difficulty
 * @param {string} difficulty - Difficulty level
 * @returns {string} Emoji representing difficulty
 */
export function getDifficultyEmoji(difficulty) {
  const emojis = {
    easy: "😊",
    medium: "🤔",
    challenging: "😰",
  };

  return emojis[difficulty] || "📚";
}

/**
 * Validate study session data
 * @param {object} sessionData - Session data to validate
 * @returns {object} Validation result { valid: boolean, errors: string[] }
 */
export function validateStudySession(sessionData) {
  const errors = [];

  if (!sessionData.topic || !sessionData.topic.trim()) {
    errors.push("Topic is required");
  }

  if (!sessionData.duration || sessionData.duration <= 0) {
    errors.push("Duration must be greater than 0");
  }

  if (sessionData.duration > 720) {
    // 12 hours
    errors.push("Duration cannot exceed 12 hours");
  }

  if (!sessionData.difficulty) {
    errors.push("Difficulty is required");
  }

  if (!["easy", "medium", "challenging"].includes(sessionData.difficulty)) {
    errors.push("Invalid difficulty level");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get study technique icon
 * @param {string} technique - Study technique
 * @returns {string} Emoji icon
 */
export function getTechniqueIcon(technique) {
  const icons = {
    Pomodoro: "🍅",
    "Active Recall": "🧠",
    "Spaced Repetition": "📅",
    "Practice Problems": "✏️",
    "Group Study": "👥",
    "Video Tutorial": "📺",
    Reading: "📖",
    Flashcards: "🗂️",
    "Note Taking": "📝",
    Other: "📚",
  };

  return icons[technique] || "📚";
}
