// hooks/useStudyGroups.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchMyStudyGroups } from "../lib/api/users";

/**
 * Custom hook for fetching user's study groups
 * @param {string} token - Auth token
 * @returns {object} { groups, loading, error, refetch }
 */
export function useStudyGroups(token) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadGroups = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchMyStudyGroups(token);
      setGroups(data.groups || []);
    } catch (err) {
      console.error("Error fetching study groups:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return {
    groups,
    loading,
    error,
    refetch: loadGroups,
  };
}
