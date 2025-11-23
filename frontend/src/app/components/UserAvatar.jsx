// components/UserAvatar.jsx
'use client';

import { getInitials, getColorFromString } from '../lib/utils';

/**
 * UserAvatar Component
 * 
 * Displays a user avatar with gradient background and initials
 * Consistent styling across the app
 * 
 * @param {object} user - User object with name/username
 * @param {string} size - Size variant: 'xs', 'sm', 'md', 'lg', 'xl'
 * @param {boolean} showName - Show user's name next to avatar
 * @param {string} className - Additional CSS classes
 */
export default function UserAvatar({ 
  user, 
  size = 'md', 
  showName = false,
  className = '' 
}) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const avatarSize = sizeClasses[size] || sizeClasses.md;
  const userName = user?.name || user?.username || 'Anonymous';
  const initials = getInitials(userName);
  
  // Use consistent gradient from utils
  const gradientClass = user?.name 
    ? getColorFromString(user.name) 
    : 'from-gray-500 to-gray-600';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className={`bg-gradient-to-br ${gradientClass} rounded-full flex items-center justify-center flex-shrink-0 ${avatarSize}`}
      >
        <span className="text-white font-semibold">
          {initials}
        </span>
      </div>
      
      {showName && (
        <span className="font-medium text-gray-900 dark:text-white">
          {userName}
        </span>
      )}
    </div>
  );
}