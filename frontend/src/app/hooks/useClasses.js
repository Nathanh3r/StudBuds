// hooks/useClasses.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchClasses } from "../lib/api/classes";

/**
 * Custom hook for fetching and managing classes
 * @param {string} token - Auth token
 * @param {string} [filter='all'] - Filter type: 'all', 'enrolled', or 'catalog'
 * @param {object} [user] - Current user object (needed for 'enrolled' filter)
 * @returns {object} { classes, loading, error, refetch }
 */
export function useClasses(token, filter = "all", user = null) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadClasses = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchClasses(token);
      let filtered = data.classes || [];

      // Apply filters
      if (filter === "enrolled") {
        filtered = filtered.filter(
          (course) => course.isUserMember || user?.courses?.includes(course._id)
        );
      } else if (filter === "catalog") {
        filtered = filtered.filter((course) => !course.isUserCreated);
      } else if (filter === "user-created") {
        filtered = filtered.filter((course) => course.isUserCreated);
      }

      setClasses(filtered);
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, filter, user]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  return {
    classes,
    loading,
    error,
    refetch: loadClasses,
  };
}
