"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchFriends } from "../lib/api/friends";

/**
 * Custom hook for fetching and managing friends
 * @param {string} token - Auth token
 * @returns {object} { friends, loading, error, refetch }
 */
export function useFriends(token) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFriends = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchFriends(token);
      setFriends(data.friends || []);
    } catch (err) {
      console.error("Error fetching friends:", err);
      setError(err.message || "Failed to load friends");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  return {
    friends,
    loading,
    error,
    refetch: loadFriends,
  };
}
