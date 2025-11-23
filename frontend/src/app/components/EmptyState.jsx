// components/EmptyState.jsx
'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/**
 * Reusable empty state component for when there's no content
 * @param {object} props
 * @param {React.Component} props.icon - Lucide icon component
 * @param {string} props.title - Main heading text
 * @param {string} props.description - Descriptive text
 * @param {string} [props.actionLabel] - Optional action button text
 * @param {string} [props.actionHref] - Optional action button link
 * @param {boolean} [props.darkMode] - Dark mode flag
 * @param {Function} [props.onAction] - Optional action callback (instead of link)
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  darkMode = false,
}) {
  const ActionButton = ({ children, ...props }) => {
    const buttonClasses = "inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-8 py-4 rounded-full hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-105";
    
    if (onAction) {
      return (
        <button onClick={onAction} className={buttonClasses} {...props}>
          {children}
        </button>
      );
    }
    
    return (
      <Link href={actionHref} className={buttonClasses} {...props}>
        {children}
      </Link>
    );
  };

  return (
    <div className={`rounded-3xl p-20 text-center border-2 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-gray-700 border-gray-700' 
        : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-indigo-100'
    }`}>
      <div className="relative">
        {/* Large background icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <Icon className={`w-48 h-48 ${
            darkMode ? 'text-indigo-400' : 'text-indigo-600'
          }`} strokeWidth={1} />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Icon container */}
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ${
            darkMode ? 'bg-gray-700' : 'bg-white'
          }`}>
            <Icon className={`w-10 h-10 ${
              darkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`} strokeWidth={2} />
          </div>
          
          {/* Title */}
          <h3 className={`text-2xl font-semibold mb-3 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h3>
          
          {/* Description */}
          <p className={`mb-8 max-w-md mx-auto ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {description}
          </p>
          
          {/* Action button */}
          {actionLabel && (actionHref || onAction) && (
            <ActionButton>
              {actionLabel}
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </ActionButton>
          )}
        </div>
      </div>
    </div>
  );
}