/* eslint-env node */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,
  settings: {
    react: {
      version: "detect",
    },
  },
  ignorePatterns: ["site/js/"],
  rules: {
    // prefer-const's default is to complain about ANY destructured value
    // that should be const, but this is a bad tradeoff for the brevity provided
    // by destructuring.
    "prefer-const": [
      "error",
      {
        destructuring: "all",
      },
    ],
  },
};
