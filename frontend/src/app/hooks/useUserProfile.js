// hooks/useUserProfile.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchUserProfile } from "../lib/api/users";

/**
 * Custom hook for fetching a user's profile
 * @param {string} userId - User ID to fetch
 * @param {string} token - Auth token
 * @returns {object} { user, loading, error, refetch }
 */
export function useUserProfile(userId, token) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUser = useCallback(async () => {
    if (!token || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchUserProfile(userId, token);
      setUser(data.user);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return {
    user,
    loading,
    error,
    refetch: loadUser,
  };
}
