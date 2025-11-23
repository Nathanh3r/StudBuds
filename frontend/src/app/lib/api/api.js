// src/app/lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const api = {
  // Test connection
  async testConnection() {
    const res = await fetch(`${API_URL}/health`);
    return res.json();
  },

  // Register
  async register(userData) {
    const res = await fetch(`${API_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  // Login
  async login(credentials) {
    const res = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },

  // Get current user (protected)
  async getCurrentUser(token) {
    const res = await fetch(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.json();
  },
};
