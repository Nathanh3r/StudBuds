// components/AchievementToast.jsx
'use client';

import { useGamification } from '../context/GamificationContext';
import { useDarkMode } from '../context/DarkModeContext';
import { X, Award } from 'lucide-react';

/**
 * Achievement Toast
 * Shows when user unlocks a new achievement
 * Displays at top of screen with auto-dismiss
 */
export default function AchievementToast() {
  const { showAchievementToast, achievementData, closeAchievementToast } = useGamification();
  const { darkMode } = useDarkMode();

  if (!showAchievementToast || !achievementData) return null;

  const { name, description, icon, xpReward } = achievementData;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slideInDown">
      <div className={`relative overflow-hidden rounded-2xl shadow-2xl max-w-md ${
        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
      }`}>
        {/* Animated gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 opacity-20 animate-gradient" />
        
        {/* Content */}
        <div className="relative z-10 p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-3xl shadow-lg animate-bounce">
                {icon}
              </div>
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className={`text-xs font-semibold uppercase tracking-wide ${
                  darkMode ? 'text-yellow-400' : 'text-yellow-600'
                }`}>
                  Achievement Unlocked!
                </span>
              </div>
              
              <h3 className={`text-lg font-bold mb-1 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {name}
              </h3>
              
              <p className={`text-sm mb-2 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {description}
              </p>
              
              <div className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                <span>+{xpReward} XP</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={closeAchievementToast}
              className={`flex-shrink-0 p-1 rounded-lg transition ${
                darkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}