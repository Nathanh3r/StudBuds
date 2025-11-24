// lib/api/courseActivity.js

/**
 * API utilities for course-related activities:
 * - Study groups
 * - Study sessions
 * - Course chat/posts
 */

import { authenticatedRequest } from "./client";

// ==================== STUDY GROUPS ====================

/**
 * Fetch study groups for a class
 * @param {string} classId - Class ID
 * @param {string} token - Auth token
 * @returns {Promise<Array>} Array of study groups
 */
export async function fetchStudyGroups(classId, token) {
  const data = await authenticatedRequest(
    `/classes/${classId}/study-groups`,
    token
  );
  return data.groups || [];
}

/**
 * Create a new study group
 * @param {string} classId - Class ID
 * @param {object} groupData - Group details
 * @param {string} token - Auth token
 * @returns {Promise<object>} Created study group
 */
export async function createStudyGroup(classId, groupData, token) {
  const data = await authenticatedRequest(
    `/classes/${classId}/study-groups`,
    token,
    {
      method: "POST",
      body: JSON.stringify({
        name: groupData.name.trim(),
        description: groupData.description?.trim() || "",
        location: groupData.location?.trim() || "",
        scheduledAt: groupData.scheduledAt || undefined,
      }),
    }
  );
  //{ group, xpAwarded }
  return data;
}

/**
 * Join a study group
 * @param {string} classId - Class ID
 * @param {string} groupId - Group ID
 * @param {string} token - Auth token
 * @returns {Promise<object>} Updated study group
 */
export async function joinStudyGroup(classId, groupId, token) {
  const data = await authenticatedRequest(
    `/classes/${classId}/study-groups/${groupId}/join`,
    token,
    { method: "POST" }
  );
  return data;
}

/**
 * Leave a study group
 * @param {string} classId - Class ID
 * @param {string} groupId - Group ID
 * @param {string} token - Auth token
 * @returns {Promise<object>} Updated study group
 */
export async function leaveStudyGroup(classId, groupId, token) {
  const data = await authenticatedRequest(
    `/classes/${classId}/study-groups/${groupId}/leave`,
    token,
    { method: "POST" }
  );
  return data.group;
}

/**
 * Delete a study group
 * @param {string} classId - Class ID
 * @param {string} groupId - Group ID
 * @param {string} token - Auth token
 * @returns {Promise<void>}
 */
export async function deleteStudyGroup(classId, groupId, token) {
  await authenticatedRequest(
    `/classes/${classId}/study-groups/${groupId}`,
    token,
    { method: "DELETE" }
  );
}

// ==================== STUDY SESSIONS ====================

/**
 * Fetch study sessions for a class
 * @param {string} classId - Class ID
 * @param {string} token - Auth token
 * @param {string} userId - Optional user ID to filter by user
 * @returns {Promise<object>} Sessions data with stats
 */
export async function fetchStudySessions(classId, token, userId = null) {
  const url = userId
    ? `/classes/${classId}/study-sessions?userId=${userId}`
    : `/classes/${classId}/study-sessions`;

  const data = await authenticatedRequest(url, token);
  return {
    sessions: data.studySessions || [],
    stats: data.stats,
    count: data.count,
  };
}

/**
 * Fetch user's study session statistics
 * @param {string} classId - Class ID
 * @param {string} token - Auth token
 * @returns {Promise<object>} User stats
 */
export async function fetchStudySessionStats(classId, token) {
  return await authenticatedRequest(
    `/classes/${classId}/study-sessions/stats`,
    token
  );
}

/**
 * Create a study session
 * @param {object} sessionData - Session details
 * @param {string} token - Auth token
 * @returns {Promise<object>} Created session
 */
export async function createStudySession(sessionData, token) {
  const data = await authenticatedRequest(`/study-sessions`, token, {
    method: "POST",
    body: JSON.stringify(sessionData),
  });
  return data.session;
}

/**
 * Like a study session
 * @param {string} sessionId - Session ID
 * @param {string} token - Auth token
 * @returns {Promise<object>} Updated session
 */
export async function likeStudySession(sessionId, token) {
  return await authenticatedRequest(
    `/study-sessions/${sessionId}/like`,
    token,
    { method: "POST" }
  );
}

/**
 * Delete a study session
 * @param {string} sessionId - Session ID
 * @param {string} token - Auth token
 * @returns {Promise<void>}
 */
export async function deleteStudySession(sessionId, token) {
  await authenticatedRequest(`/study-sessions/${sessionId}`, token, {
    method: "DELETE",
  });
}

// ==================== COURSE CHAT/POSTS ====================

/**
 * Fetch posts/messages for a class
 * @param {string} classId - Class ID
 * @param {string} token - Auth token
 * @returns {Promise<object>} Posts data
 */
export async function fetchCoursePosts(classId, token) {
  const data = await authenticatedRequest(`/classes/${classId}/posts`, token);
  return {
    posts: data.posts || [],
    count: data.count,
  };
}

/**
 * Create a new post/message
 * @param {string} classId - Class ID
 * @param {string} content - Message content
 * @param {string} token - Auth token
 * @returns {Promise<object>} Created post
 */
export async function createCoursePost(classId, content, token) {
  return await authenticatedRequest(`/classes/${classId}/posts`, token, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

/**
 * Edit a post/message
 * @param {string} classId - Class ID
 * @param {string} postId - Post ID
 * @param {string} content - Updated content
 * @param {string} token - Auth token
 * @returns {Promise<object>} Updated post
 */
export async function editCoursePost(classId, postId, content, token) {
  return await authenticatedRequest(
    `/classes/${classId}/posts/${postId}`,
    token,
    {
      method: "PUT",
      body: JSON.stringify({ content }),
    }
  );
}

/**
 * Delete a post/message
 * @param {string} classId - Class ID
 * @param {string} postId - Post ID
 * @param {string} token - Auth token
 * @returns {Promise<void>}
 */
export async function deleteCoursePost(classId, postId, token) {
  await authenticatedRequest(`/classes/${classId}/posts/${postId}`, token, {
    method: "DELETE",
  });
}
