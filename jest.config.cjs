const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: "tsconfig.jest.json"
    }],
  },

  // ✅ Enable coverage collection
  collectCoverage: true,

  // ✅ Where coverage reports go
  coverageDirectory: "coverage",

  // ✅ Report formats
  coverageReporters: ["text", "lcov", "html"],

  // ✅ Files to include in coverage
  collectCoverageFrom: [
    "components/**/*.{ts,tsx}",
    "!components/**/*.test.{ts,tsx}",
    "!**/__tests__/**",
    "!**/*.d.ts",
  ],

  // ✅ Test file patterns
  testMatch: [
    "**/__tests__/**/*.test.{ts,tsx}",
    "**/*.test.{ts,tsx}",
  ],

  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],
};
