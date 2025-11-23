// lib/api/users.js
import { authenticatedRequest } from "./client";

/**
 * Fetch user profile by ID
 * @param {string} userId - User ID
 * @param {string} token - Auth token
 * @returns {Promise<{user: object}>} User profile data
 */
export async function fetchUserProfile(userId, token) {
  return authenticatedRequest(`/users/${userId}`, token);
}

/**
 * Update user profile
 * @param {object} formData - User data to update (name, bio, major, etc.)
 * @param {string} token - Auth token
 * @returns {Promise<object>} Updated user data
 */
export async function updateUserProfile(formData, token) {
  return authenticatedRequest("/users/update", token, {
    method: "PUT",
    body: JSON.stringify(formData),
  });
}

/**
 * Add a friend
 * @param {string} userId - User ID to add as friend
 * @param {string} token - Auth token
 * @returns {Promise<object>} Response data
 */
export async function addFriend(userId, token) {
  return authenticatedRequest(`/users/add-friend/${userId}`, token, {
    method: "POST",
  });
}

/**
 * Remove a friend
 * @param {string} userId - User ID to remove from friends
 * @param {string} token - Auth token
 * @returns {Promise<object>} Response data
 */
export async function removeFriend(userId, token) {
  return authenticatedRequest(`/users/remove-friend/${userId}`, token, {
    method: "DELETE",
  });
}

/**
 * Fetch current user's study groups
 * @param {string} token - Auth token
 * @returns {Promise<{groups: Array}>} Study groups data
 */
export async function fetchMyStudyGroups(token) {
  return authenticatedRequest("/users/me/study-groups", token);
}

/**
 * Fetch all users (for friend search, etc.)
 * @param {string} token - Auth token
 * @returns {Promise<{users: Array}>} Users data
 */
export async function fetchAllUsers(token) {
  return authenticatedRequest("/users", token);
}
