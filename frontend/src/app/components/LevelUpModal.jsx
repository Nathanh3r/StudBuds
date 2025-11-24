// components/LevelUpModal.jsx
'use client';

import { useEffect } from 'react';
import { useGamification } from '../context/GamificationContext';
import { useDarkMode } from '../context/DarkModeContext';
import { Trophy, X, Star, Zap } from 'lucide-react';

/**
 * Level Up Modal
 * Celebratory modal shown when user levels up
 * Includes confetti-like animation and rank display
 */
export default function LevelUpModal() {
  const { showLevelUpModal, levelUpData, closeLevelUpModal } = useGamification();
  const { darkMode } = useDarkMode();

  useEffect(() => {
    if (showLevelUpModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showLevelUpModal]);

  if (!showLevelUpModal || !levelUpData) return null;

  const { oldLevel, newLevel, rank } = levelUpData;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={closeLevelUpModal}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" />

      {/* Modal */}
      <div 
        className={`relative max-w-md w-full rounded-3xl shadow-2xl overflow-hidden animate-scaleIn`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 animate-gradient" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-70 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 text-white text-center">
          {/* Close Button */}
          <button
            onClick={closeLevelUpModal}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition p-2 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Trophy Icon */}
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-bounce">
              <Trophy className="w-12 h-12 text-yellow-300" fill="currentColor" />
            </div>
          </div>

          {/* Level Up Text */}
          <h2 className="text-4xl font-bold mb-2 animate-pulse">
            Level Up!
          </h2>
          
          {/* Level Display */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-6xl font-bold opacity-50">
              {oldLevel}
            </div>
            <Zap className="w-8 h-8" />
            <div className="text-6xl font-bold">
              {newLevel}
            </div>
          </div>

          {/* Rank Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
            <Star className="w-5 h-5" fill="currentColor" />
            <span className="font-semibold text-lg">{rank}</span>
          </div>

          {/* Message */}
          <p className="text-white/90 text-lg mb-8">
            You're getting stronger! Keep up the great work! 🎉
          </p>

          {/* Continue Button */}
          <button
            onClick={closeLevelUpModal}
            className="w-full bg-white text-indigo-600 font-bold py-4 rounded-xl hover:bg-white/90 transition shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}