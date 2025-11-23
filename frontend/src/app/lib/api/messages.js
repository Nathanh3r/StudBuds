import { authenticatedRequest } from "./client";

/**
 * Fetch all conversations for the current user
 * @param {string} token - Auth token
 * @returns {Promise<{conversations: Array}>} Conversations data
 */
export async function fetchConversations(token) {
  return authenticatedRequest("/messages/conversations", token);
}

/**
 * Fetch messages with a specific user
 * @param {string} userId - User ID to fetch messages with
 * @param {string} token - Auth token
 * @param {number} [limit=50] - Number of messages to fetch
 * @returns {Promise<{messages: Array}>} Messages data
 */
export async function fetchMessages(userId, token, limit = 50) {
  return authenticatedRequest(`/messages/${userId}?limit=${limit}`, token);
}

/**
 * Send a message to a user
 * @param {string} receiverId - Receiver's user ID
 * @param {string} content - Message content
 * @param {string} token - Auth token
 * @returns {Promise<object>} Sent message data
 */
export async function sendMessage(receiverId, content, token) {
  return authenticatedRequest("/messages", token, {
    method: "POST",
    body: JSON.stringify({ receiver: receiverId, content }),
  });
}

/**
 * Mark messages with a user as read
 * @param {string} userId - User ID
 * @param {string} token - Auth token
 * @returns {Promise<object>} Response data
 */
export async function markMessagesAsRead(userId, token) {
  return authenticatedRequest(`/messages/${userId}/read`, token, {
    method: "PUT",
  });
}
