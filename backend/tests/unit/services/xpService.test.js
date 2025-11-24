import {
  calculateLevel,
  getCurrentMultiplier,
} from "../../../config/gamification.js";

describe("XP Service - Unit Tests", () => {
  describe("calculateLevel", () => {
    test("should return level 1 for 0 XP", () => {
      expect(calculateLevel(0)).toBe(1);
    });

    test("should return level 2 for 100 XP", () => {
      expect(calculateLevel(100)).toBe(2);
    });

    test("should handle large XP values", () => {
      const level = calculateLevel(50000);
      expect(level).toBeGreaterThan(10);
    });
  });

  describe("getCurrentMultiplier", () => {
    test("should return valid multiplier", () => {
      const user = {
        gamification: {
          streak: { count: 5 },
        },
      };

      const multiplier = getCurrentMultiplier(user);
      expect(multiplier).toBeGreaterThanOrEqual(1);
    });
  });
});
