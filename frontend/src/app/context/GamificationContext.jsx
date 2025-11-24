// context/GamificationContext.jsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { fetchGamificationStats } from '../lib/api/gamification';

const GamificationContext = createContext();

export function GamificationProvider({ children }) {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [showAchievementToast, setShowAchievementToast] = useState(false);
  const [achievementData, setAchievementData] = useState(null);
  const [xpNotifications, setXpNotifications] = useState([]);

  // Fetch stats on mount and when user changes
  useEffect(() => {
    if (token && user) {
      loadStats();
    } else {
      setLoading(false);
    }
  }, [token, user]);

  /**
   * Load gamification stats from API
   */
  const loadStats = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const data = await fetchGamificationStats(token);
      setStats(data.stats);
    } catch (error) {
      console.error('Error loading gamification stats:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh stats (call after XP-earning actions)
   */
  const refreshStats = useCallback(async () => {
    if (!token) return;
    
    try {
      const data = await fetchGamificationStats(token);
      setStats(data.stats);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  }, [token]);

  /**
   * Handle XP award from API response
   * Shows notifications and updates stats
   * 
   * @param {object} xpResult - XP result from backend
   */
  const handleXPAward = useCallback((xpResult) => {
    if (!xpResult || !xpResult.awarded) return;

    // Add XP notification
    const notificationId = Date.now();
    setXpNotifications(prev => [
      ...prev,
      {
        id: notificationId,
        xp: xpResult.xpAwarded,
        multiplier: xpResult.multiplier,
      }
    ]);

    // Remove notification after 3 seconds
    setTimeout(() => {
      setXpNotifications(prev => prev.filter(n => n.id !== notificationId));
    }, 3000);

    // Check for level up
    if (xpResult.leveledUp) {
      setLevelUpData({
        oldLevel: xpResult.oldLevel,
        newLevel: xpResult.newLevel,
        rank: xpResult.rank,
      });
      setShowLevelUpModal(true);
    }

    // Check for new achievements
    if (xpResult.newAchievements && xpResult.newAchievements.length > 0) {
      // Show first achievement
      setAchievementData(xpResult.newAchievements[0]);
      setShowAchievementToast(true);

      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowAchievementToast(false);
      }, 5000);
    }

    // Refresh stats
    refreshStats();
  }, [refreshStats]);

  /**
   * Close level up modal
   */
  const closeLevelUpModal = () => {
    setShowLevelUpModal(false);
    setLevelUpData(null);
  };

  /**
   * Close achievement toast
   */
  const closeAchievementToast = () => {
    setShowAchievementToast(false);
    setAchievementData(null);
  };

  const value = {
    // Stats
    stats,
    loading,
    refreshStats,
    
    // XP handling
    handleXPAward,
    xpNotifications,
    
    // Level up modal
    showLevelUpModal,
    levelUpData,
    closeLevelUpModal,
    
    // Achievement toast
    showAchievementToast,
    achievementData,
    closeAchievementToast,
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
}