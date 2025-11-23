"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchConversations } from "../lib/api/messages";

/**
 * Custom hook for fetching and managing conversations
 * @param {string} token - Auth token
 * @returns {object} { conversations, loading, error, backendError, refetch }
 */
export function useConversations(token) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendError, setBackendError] = useState(false);

  const loadConversations = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchConversations(token);
      setConversations(data.conversations || []);
      setBackendError(false);
    } catch (err) {
      console.error("Error fetching conversations:", err);

      // Check if it's a backend connectivity issue
      if (
        err.message.includes("fetch") ||
        err.message.includes("Failed to fetch")
      ) {
        setBackendError(true);
      }

      setError(err.message || "Failed to load conversations");
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    loading,
    error,
    backendError,
    refetch: loadConversations,
  };
}
