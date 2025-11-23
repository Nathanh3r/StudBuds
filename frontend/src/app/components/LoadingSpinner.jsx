// components/LoadingSpinner.jsx
'use client';

/**
 * LoadingSpinner Component
 * 
 * Reusable loading spinner with optional message
 * Supports different sizes and dark mode
 * 
 * @param {string} size - Size variant: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} message - Optional loading message
 * @param {boolean} fullScreen - Show as full screen overlay
 * @param {boolean} darkMode - Dark mode styling
 */
export default function LoadingSpinner({ 
  size = 'md', 
  message, 
  fullScreen = false,
  darkMode = false 
}) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-b-2',
    lg: 'h-16 w-16 border-b-3',
  };

  const spinnerClass = sizeClasses[size] || sizeClasses.md;

  const content = (
    <div className="text-center">
      <div 
        className={`animate-spin rounded-full ${spinnerClass} ${
          darkMode ? 'border-indigo-400' : 'border-indigo-600'
        } mx-auto`}
      />
      {message && (
        <p className={`mt-4 ${size === 'sm' ? 'text-sm' : 'text-base'} ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${
        darkMode ? 'bg-gray-900/90' : 'bg-white/90'
      }`}>
        {content}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${
      size === 'sm' ? 'p-4' : 'p-12'
    }`}>
      {content}
    </div>
  );
}