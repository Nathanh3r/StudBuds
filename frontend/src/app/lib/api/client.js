// lib/api/client.js
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/**
 * Generic API request function
 * @param {string} endpoint - API endpoint (e.g., '/classes', '/users/123')
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<any>} Response data
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

/**
 * Authenticated API request helper
 * @param {string} endpoint - API endpoint
 * @param {string} token - Auth token
 * @param {object} options - Additional fetch options
 * @returns {Promise<any>} Response data
 */
export async function authenticatedRequest(endpoint, token, options = {}) {
  return apiRequest(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}
