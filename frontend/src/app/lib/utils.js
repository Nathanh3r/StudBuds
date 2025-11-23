// lib/utils.js

/**
 * Format a date to a readable string
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return new Date(date).toLocaleDateString("en-US", {
    ...defaultOptions,
    ...options,
  });
}

/**
 * Format a date to a relative time string (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
    }
  }

  return "just now";
}

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength, suffix = "...") {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + suffix;
}

/**
 * Get initials from a name
 * @param {string} name - Full name
 * @param {number} maxInitials - Maximum number of initials (default: 2)
 * @returns {string} Initials
 */
export function getInitials(name, maxInitials = 2) {
  if (!name) return "";

  const parts = name.trim().split(/\s+/);
  const initials = parts
    .slice(0, maxInitials)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials;
}

/**
 * Generate a consistent color based on a string (for avatars, etc.)
 * @param {string} str - Input string
 * @returns {string} Tailwind gradient class
 */
export function getColorFromString(str) {
  const colors = [
    "from-blue-500 to-indigo-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-cyan-500 to-blue-500",
    "from-violet-500 to-purple-500",
    "from-amber-500 to-yellow-500",
    "from-rose-500 to-pink-500",
  ];

  if (!str) return colors[0];

  const index = str.charCodeAt(0) % colors.length;
  return colors[index];
}

/**
 * Debounce a function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if code is running on client side
 * @returns {boolean}
 */
export function isClient() {
  return typeof window !== "undefined";
}

/**
 * Safely parse JSON with fallback
 * @param {string} json - JSON string to parse
 * @param {any} fallback - Fallback value if parsing fails
 * @returns {any} Parsed object or fallback
 */
export function safeJsonParse(json, fallback = null) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return fallback;
  }
}

/**
 * Generate a random ID (for temporary items before API assignment)
 * @returns {string} Random ID
 */
export function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Class names concatenation utility (similar to classnames library)
 * @param {...any} classes - Classes to concatenate
 * @returns {string} Concatenated class string
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
