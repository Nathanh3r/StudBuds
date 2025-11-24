// lib/api/gamification.js
import { authenticatedRequest } from "./client";

/**
 * Fetch user's gamification stats
 * @param {string} token - Auth token
 * @returns {Promise<{stats: object}>} Gamification stats
 */
export async function fetchGamificationStats(token) {
  return authenticatedRequest("/gamification/stats", token);
}

/**
 * Fetch global leaderboard
 * @param {string} token - Auth token
 * @param {number} limit - Number of users to fetch (default: 50)
 * @returns {Promise<{leaderboard: Array, userPosition: number}>}
 */
export async function fetchLeaderboard(token, limit = 50) {
  return authenticatedRequest(
    `/gamification/leaderboard?limit=${limit}`,
    token
  );
}

/**
 * Fetch all achievements with unlock status
 * @param {string} token - Auth token
 * @returns {Promise<{achievements: Array, unlockedCount: number, totalCount: number}>}
 */
export async function fetchAchievements(token) {
  return authenticatedRequest("/gamification/achievements", token);
}

/**
 * Fetch all rank titles
 * @returns {Promise<{ranks: Array}>}
 */
export async function fetchRanks() {
  const { API_BASE_URL } = await import("./client");
  const response = await fetch(`${API_BASE_URL}/gamification/ranks`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch ranks");
  }

  return data;
}

/**
 * Fetch user activity summary
 * @param {string} token - Auth token
 * @returns {Promise<{activity: object}>}
 */
export async function fetchActivitySummary(token) {
  return authenticatedRequest("/gamification/activity", token);
}
