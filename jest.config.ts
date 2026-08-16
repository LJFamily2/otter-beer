import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Path to your Next.js app (for loading next.config.ts and .env files)
  dir: "./",
});

const config: Config = {
  displayName: "unit & integration",

  // Use jsdom for component tests
  testEnvironment: "jest-environment-jsdom",

  // Setup file runs after the test framework is installed in the environment
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // Module name mapper for @/* path aliases
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Only run unit and integration tests (Playwright E2E uses playwright.config.ts)
  testMatch: [
    "<rootDir>/tests/unit/**/*.test.ts",
    "<rootDir>/tests/unit/**/*.test.tsx",
    "<rootDir>/tests/integration/**/*.test.ts",
  ],

  // Coverage settings for unit and integration logic
  collectCoverageFrom: [
    "src/lib/utils/**/*.ts",
    "src/lib/auth/**/*.ts",
    "src/lib/validation/**/*.ts",
    "src/services/**/*.ts",
    "src/config/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
  ],

  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },

  coverageReporters: ["text", "lcov", "html"],
};

export default createJestConfig(config);
