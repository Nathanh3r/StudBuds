import "@testing-library/jest-dom";

// Polyfill fetch for Jest environment
global.fetch = jest.fn();

// Suppress act() warnings for async updates in context providers
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("was not wrapped in act") ||
        args[0].includes("inside a test was not wrapped in act"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock gamification API to prevent fetch calls during tests
jest.mock("./src/app/lib/api/gamification", () => ({
  fetchGamificationStats: jest.fn(() =>
    Promise.resolve({
      stats: {
        level: 1,
        xp: 0,
        totalXp: 0,
        xpForNextLevel: 100,
        streak: 0,
        achievements: [],
      },
    })
  ),
  awardXP: jest.fn(() => Promise.resolve()),
}));

jest.mock("next/router", () => require("next-router-mock"));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
