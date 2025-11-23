// hooks/usePagination.js
"use client";

import { useState, useMemo, useEffect } from "react";
import { ITEMS_PER_PAGE } from "../lib/constants";

/**
 * Custom hook for client-side pagination
 * @param {Array} items - Array of items to paginate
 * @param {number} [itemsPerPage=ITEMS_PER_PAGE] - Items per page
 * @returns {object} Pagination state and controls
 */
export function usePagination(items, itemsPerPage = ITEMS_PER_PAGE) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination values
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Get current page items
  const currentItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [items, startIndex, endIndex]
  );

  // Reset to page 1 when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  // Navigation functions
  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  return {
    // Current state
    currentPage,
    currentItems,
    totalPages,
    totalItems: items.length,
    startIndex: startIndex + 1, // 1-indexed for display
    endIndex: Math.min(endIndex, items.length),

    // Booleans
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,

    // Navigation functions
    goToPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    setCurrentPage,
  };
}
