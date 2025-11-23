// hooks/useCourseActivity.js

/**
 * Custom hooks for course activity features:
 * - Study groups
 * - Study sessions
 * - Course chat/posts
 */

import { useState, useEffect, useCallback } from "react";
import {
  fetchStudyGroups,
  fetchStudySessions,
  fetchStudySessionStats,
  fetchCoursePosts,
} from "../lib/api/courseActivity";

/**
 * Hook for managing study groups
 * @param {string} classId - Class ID
 * @param {string} token - Auth token
 * @returns {object} Study groups state and methods
 */
export function useStudyGroups(classId, token) {
  const [studyGroups, setStudyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = useCallback(async () => {
    if (!token || !classId) return;

    try {
      setLoading(true);
      setError(null);
      const groups = await fetchStudyGroups(classId, token);
      setStudyGroups(groups);
    } catch (err) {
      console.error("Error fetching study groups:", err);
      setError(err.message || "Failed to fetch study groups");
    } finally {
      setLoading(false);
    }
  }, [classId, token]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return {
    studyGroups,
    loading,
    error,
    refetch: fetchGroups,
    setStudyGroups, // Expose for optimistic updates
  };
}

/**
 * Hook for managing study sessions
 * @param {string} classId - Class ID
 * @param {string} token - Auth token
 * @param {string} filter - Filter type ('all' or user ID)
 * @returns {object} Study sessions state and methods
 */
export function useStudySessions(classId, token, filter = "all") {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = useCallback(async () => {
    if (!token || !classId) return;

    try {
      setLoading(true);
      setError(null);
      const userId = filter !== "all" ? filter : null;
      const data = await fetchStudySessions(classId, token, userId);
      setSessions(data.sessions);
      setStats(data.stats);
      setCount(data.count);
    } catch (err) {
      console.error("Error fetching study sessions:", err);
      setError(err.message || "Failed to fetch study sessions");
    } finally {
      setLoading(false);
    }
  }, [classId, token, filter]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    stats,
    count,
    loading,
    error,
    refetch: fetchSessions,
    setSessions, // Expose for optimistic updates
  };
}

/**
 * Hook for user's study session statistics
 * @param {string} classId - Class ID
 * @param {string} token - Auth token
 * @returns {object} User stats state
 */
export function useStudySessionStats(classId, token) {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!token || !classId) return;

    try {
      setLoading(true);
      setError(null);
      const stats = await fetchStudySessionStats(classId, token);
      setUserStats(stats);
    } catch (err) {
      console.error("Error fetching user stats:", err);
      setError(err.message || "Failed to fetch user stats");
    } finally {
      setLoading(false);
    }
  }, [classId, token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    userStats,
    loading,
    error,
    refetch: fetchStats,
  };
}

/**
 * Hook for managing course posts/chat
 * @param {string} classId - Class ID
 * @param {string} token - Auth token
 * @param {number} pollInterval - Polling interval in ms (default: 5000)
 * @returns {object} Posts state and methods
 */
export function useCoursePosts(classId, token, pollInterval = 5000) {
  const [messages, setMessages] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async () => {
    if (!token || !classId) return;

    try {
      setError(null);
      const data = await fetchCoursePosts(classId, token);
      setMessages(data.posts);
      setCount(data.count);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err.message || "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }, [classId, token]);

  useEffect(() => {
    fetchMessages();

    // Set up polling if interval provided
    if (pollInterval > 0) {
      const interval = setInterval(fetchMessages, pollInterval);
      return () => clearInterval(interval);
    }
  }, [fetchMessages, pollInterval]);

  return {
    messages,
    count,
    loading,
    error,
    refetch: fetchMessages,
    setMessages, // Expose for optimistic updates
  };
}
