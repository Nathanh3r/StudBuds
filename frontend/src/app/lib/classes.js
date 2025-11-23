// lib/api/classes.js
import { authenticatedRequest } from "./client";

/**
 * Fetch all classes
 * @param {string} token - Auth token
 * @returns {Promise<{classes: Array}>} Classes data
 */
export async function fetchClasses(token) {
  return authenticatedRequest("/classes", token);
}

/**
 * Fetch a single class by ID
 * @param {string} classId - Class ID
 * @param {string} token - Auth token
 * @returns {Promise<object>} Class data
 */
export async function fetchClassById(classId, token) {
  return authenticatedRequest(`/classes/${classId}`, token);
}

/**
 * Join a class
 * @param {string} classId - Class ID
 * @param {string} token - Auth token
 * @returns {Promise<object>} Response data
 */
export async function joinClass(classId, token) {
  return authenticatedRequest(`/classes/${classId}/join`, token, {
    method: "POST",
  });
}

/**
 * Leave a class
 * @param {string} classId - Class ID
 * @param {string} token - Auth token
 * @returns {Promise<object>} Response data
 */
export async function leaveClass(classId, token) {
  return authenticatedRequest(`/classes/${classId}/leave`, token, {
    method: "DELETE",
  });
}

/**
 * Create a new class
 * @param {object} classData - Class data (code, name, description, etc.)
 * @param {string} token - Auth token
 * @returns {Promise<object>} Created class data
 */
export async function createClass(classData, token) {
  return authenticatedRequest("/classes", token, {
    method: "POST",
    body: JSON.stringify(classData),
  });
}
