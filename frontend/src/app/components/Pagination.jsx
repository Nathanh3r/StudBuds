// components/Pagination.jsx
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable pagination component
 * @param {object} props
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {boolean} [props.darkMode] - Dark mode flag
 * @param {boolean} [props.showFirstLast] - Show first/last buttons
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  darkMode = false,
  showFirstLast = false,
}) {
  if (totalPages <= 1) return null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Maximum page numbers to show
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust range if at edges
      if (currentPage <= 2) {
        end = 4;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }
      
      // Add ellipsis before range if needed
      if (start > 2) {
        pages.push('ellipsis-start');
      }
      
      // Add range
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis after range if needed
      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-3 rounded-xl border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
          darkMode 
            ? 'border-gray-700 hover:border-indigo-500 hover:bg-gray-800 text-gray-400' 
            : 'border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 text-gray-600'
        }`}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" strokeWidth={2} />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-2">
        {pageNumbers.map((page, index) => {
          if (typeof page === 'string') {
            // Ellipsis
            return (
              <span 
                key={page}
                className={`px-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}
              >
                ···
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[48px] h-12 px-4 rounded-xl font-medium transition-all ${
                currentPage === page
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                  : darkMode
                  ? 'border-2 border-gray-700 text-gray-300 hover:border-indigo-500 hover:bg-gray-800'
                  : 'border-2 border-gray-100 text-gray-600 hover:border-indigo-200 hover:bg-indigo-50'
              }`}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-3 rounded-xl border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
          darkMode 
            ? 'border-gray-700 hover:border-indigo-500 hover:bg-gray-800 text-gray-400' 
            : 'border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 text-gray-600'
        }`}
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" strokeWidth={2} />
      </button>
    </div>
  );
}