// hooks/useClassDetail.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchClassById } from "../lib/api/classes";

/**
 * Custom hook for fetching a class's details
 * @param {string} classId - Class ID to fetch
 * @param {string} token - Auth token
 * @returns {object} { classData, loading, error, refetch }
 */
export function useClassDetail(classId, token) {
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadClass = useCallback(async () => {
    if (!token || !classId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchClassById(classId, token);
      setClassData(data);
    } catch (err) {
      console.error("Error fetching class:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [classId, token]);

  useEffect(() => {
    loadClass();
  }, [loadClass]);

  return {
    classData,
    loading,
    error,
    refetch: loadClass,
  };
}
