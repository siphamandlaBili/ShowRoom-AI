/** @type {import("jest").Config} */
module.exports = {
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
      },
    ],
  },

  // Coverage collection disabled by default, enabled with --coverage flag
  collectCoverage: false,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],

  // Files to include in coverage analysis
  collectCoverageFrom: [
    "components/**/*.{ts,tsx}",
    "!components/**/*.test.{ts,tsx}",
    "!**/__tests__/**",
    "!**/*.d.ts",
  ],

  // Test file patterns
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}", "**/*.test.{ts,tsx}"],

  moduleNameMapper: {
    '^components/(.*)$': '<rootDir>/components/$1',
  },

  // Enforce minimum coverage thresholds
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 85,
      functions: 85,
      lines: 85,
    },
  },

  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],
};
