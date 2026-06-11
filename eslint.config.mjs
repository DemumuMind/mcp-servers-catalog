// ESLint config
import storybook from "eslint-plugin-storybook";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    ".worktrees/**",
    "next-env.d.ts",
  ]),
  ...storybook.configs["flat/recommended"],
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      "react/no-unescaped-entities": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "storybook/no-renderer-packages": "warn",
      "storybook/no-uninstalled-addons": "warn",
      "prefer-const": "warn",
      "jsx-a11y/label-has-associated-control": ["warn", { "assert": "either", "controlComponents": ["Checkbox"] }],
      "jsx-a11y/control-has-associated-label": ["warn", { "ignoreElements": ["img", "a", "button"] }],
    },
  },
  {
    files: ["scripts/**", "prisma/**", "e2e/**"],
    rules: {
      "no-console": "off",
    },
  }
]);

export default eslintConfig;
