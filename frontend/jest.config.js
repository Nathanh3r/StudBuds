const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",

  moduleNameMapper: {
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
    "^.+\\.(css|sass|scss)$": "<rootDir>/__mocks__/styleMock.js",
    "^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i":
      "<rootDir>/__mocks__/fileMock.js",
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  testMatch: ["**/tests/**/*.[jt]s?(x)"],

  collectCoverageFrom: [
    "src/app/components/**/*.{js,jsx}",
    "src/app/context/**/*.{js,jsx}",
    "src/app/hooks/**/*.{js,jsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],

  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],

  // Increase timeout for async operations
  testTimeout: 10000,
};

module.exports = createJestConfig(customJestConfig);
