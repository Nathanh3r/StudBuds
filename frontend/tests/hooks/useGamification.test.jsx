// __tests__/hooks/useGamification.test.js
import { renderHook, act, waitFor } from '@testing-library/react';
import { GamificationProvider, useGamification } from '../../src/app/context/GamificationContext';
import { AuthProvider } from '../../src/app/context/AuthContext';

const wrapper = ({ children }) => (
  <AuthProvider>
    <GamificationProvider>{children}</GamificationProvider>
  </AuthProvider>
);

describe('useGamification Hook', () => {
  test('should handle XP award correctly', async () => {
    const { result } = renderHook(() => useGamification(), { wrapper });

    const mockXPResult = {
      awarded: true,
      xpAwarded: 25,
      totalXP: 1475,
      oldLevel: 8,
      newLevel: 8,
      leveledUp: false,
      rank: 'Sophomore',
      progress: { currentXP: 225, xpNeeded: 450, percentage: 50 },
      multiplier: 1,
      newAchievements: []
    };

    act(() => {
      result.current.handleXPAward(mockXPResult);
    });

    await waitFor(() => {
      expect(result.current.xpNotifications.length).toBeGreaterThan(0);
    });
  });

  test('should show level up modal when leveling up', async () => {
    const { result } = renderHook(() => useGamification(), { wrapper });

    const mockXPResult = {
      awarded: true,
      xpAwarded: 100,
      totalXP: 1550,
      oldLevel: 8,
      newLevel: 9,
      leveledUp: true,
      rank: 'Sophomore',
      multiplier: 1,
      newAchievements: []
    };

    act(() => {
      result.current.handleXPAward(mockXPResult);
    });

    await waitFor(() => {
      expect(result.current.showLevelUpModal).toBe(true);
      expect(result.current.levelUpData.newLevel).toBe(9);
    });
  });
});