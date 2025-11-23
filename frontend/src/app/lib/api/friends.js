import { authenticatedRequest } from "./client";

/**
 * Fetch user's friends list
 * @param {string} token - Auth token
 * @returns {Promise<{friends: Array}>} Friends data
 */
export async function fetchFriends(token) {
  return authenticatedRequest("/users/friends", token);
}

/**
 * Search for users by query
 * @param {string} query - Search query (name or email)
 * @param {string} token - Auth token
 * @returns {Promise<{users: Array}>} Search results
 */
export async function searchUsers(query, token) {
  return authenticatedRequest(
    `/users/search?q=${encodeURIComponent(query)}`,
    token
  );
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
 * Fetch user profile by ID
 * @param {string} userId - User ID
 * @param {string} token - Auth token
 * @returns {Promise<{user: object}>} User profile data
 */
export async function fetchUserById(userId, token) {
  return authenticatedRequest(`/users/${userId}`, token);
}
