// components/XPBar.jsx
'use client';

import { useDarkMode } from '../context/DarkModeContext';
import { useGamification } from '../context/GamificationContext';
import { Star } from 'lucide-react';

/**
 * XP Progress Bar Component
 * Shows user's current level, XP progress, and rank
 * 
 * @param {string} size - Size variant: 'sm', 'md', 'lg'
 * @param {boolean} showRank - Whether to show rank title
 * @param {boolean} showStats - Whether to show detailed stats
 */
export default function XPBar({ size = 'md', showRank = true, showStats = false }) {
  const { darkMode } = useDarkMode();
  const { stats, loading } = useGamification();

  if (loading || !stats) {
    return (
      <div className={`animate-pulse ${
        darkMode ? 'bg-gray-800' : 'bg-gray-100'
      } rounded-xl p-4`}>
        <div className={`h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-3/4 mb-2`} />
        <div className={`h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-full`} />
      </div>
    );
  }

  const { level, xp, rank, rankColor, progress } = stats;
  const { currentXP, xpNeeded, percentage } = progress;

  // Size variants
  const sizes = {
    sm: {
      container: 'p-3',
      text: 'text-xs',
      title: 'text-sm',
      bar: 'h-1.5',
      icon: 'w-4 h-4',
    },
    md: {
      container: 'p-4',
      text: 'text-sm',
      title: 'text-base',
      bar: 'h-2',
      icon: 'w-5 h-5',
    },
    lg: {
      container: 'p-6',
      text: 'text-base',
      title: 'text-lg',
      bar: 'h-3',
      icon: 'w-6 h-6',
    },
  };

  const sizeClasses = sizes[size] || sizes.md;

  return (
    <div className={`rounded-xl transition-all duration-300 ${
      darkMode 
        ? 'bg-gray-800 border border-gray-700' 
        : 'bg-white border border-gray-100'
    } ${sizeClasses.container}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div 
            className="rounded-lg p-1.5 flex items-center justify-center"
            style={{ backgroundColor: `${rankColor}20` }}
          >
            <Star 
              className={sizeClasses.icon}
              style={{ color: rankColor }}
              fill={rankColor}
            />
          </div>
          <div>
            <div className={`font-bold ${sizeClasses.title} ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Level {level}
            </div>
            {showRank && (
              <div 
                className={`font-medium ${sizeClasses.text}`}
                style={{ color: rankColor }}
              >
                {rank}
              </div>
            )}
          </div>
        </div>
        
        {showStats && (
          <div className={`text-right ${sizeClasses.text} ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <div className="font-semibold">{xp.toLocaleString()} XP</div>
            <div className="text-xs opacity-75">Total</div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className={`w-full rounded-full overflow-hidden ${
          darkMode ? 'bg-gray-700' : 'bg-gray-200'
        } ${sizeClasses.bar}`}>
          <div 
            className={`${sizeClasses.bar} rounded-full transition-all duration-500 ease-out`}
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${rankColor}, ${rankColor}dd)`,
            }}
          />
        </div>
        
        {/* Progress Text */}
        <div className={`flex items-center justify-between ${sizeClasses.text} ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <span className="font-medium">
            {currentXP.toLocaleString()} / {xpNeeded.toLocaleString()} XP
          </span>
          <span className="font-semibold" style={{ color: rankColor }}>
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
}