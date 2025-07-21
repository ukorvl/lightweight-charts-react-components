import pluginJs from "@eslint/js";
import pluginImport from "eslint-plugin-import";
import pluginJsdoc from "eslint-plugin-jsdoc";
import playwright from "eslint-plugin-playwright";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import vitest from "eslint-plugin-vitest";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      "**/node_modules",
      "**/dist",
      "**/coverage/",
      "**/.rslib",
      "lib/tests/readme/extracted-snippets",
      "lib/tests/bench/output",
      "examples/tests/e2e/output",
      "lib/tests/readme/extracted-snippets",
      ".lighthouseci",
    ],
  },
  {
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReactHooks.configs["recommended-latest"],
  {
    plugins: {
      import: pluginImport,
    },
    settings: {
      react: {
        version: "19",
      },
      "import/resolver": {
        typescript: {
          project: ["./lib/tsconfig.json", "./examples/tsconfig.json"],
          noWarnOnMultipleProjects: true,
        },
      },
    },
    rules: {
      "no-console": "error",
      "no-debugger": "error",
      "no-shadow": "error",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
        },
      ],
      "react-hooks/exhaustive-deps": "off",
    },
  },
  {
    ignores: ["**/sandbox/**", "**/*.config.ts"],
    files: [
      "lib/src/**/*.ts",
      "lib/src/**/*.tsx",
      "examples/src/**/*.ts",
      "examples/src/**/*.tsx",
      "lib/tests/**/*.ts",
      "lib/tests/**/*.tsx",
    ],
    rules: {
      "import/no-default-export": "error",
    },
  },
  {
    rules: {
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "type",
          ],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
              position: "after",
            },
            {
              pattern: "lightweight-charts-react-components",
              group: "internal",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "never",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  {
    files: ["lib/src/**/*.ts", "lib/src/**/*.tsx"],
    plugins: {
      jsdoc: pluginJsdoc,
    },
    rules: {
      "jsdoc/require-jsdoc": [
        "error",
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: false,
            ClassDeclaration: false,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
        },
      ],
      "jsdoc/check-alignment": "error",
      "jsdoc/check-indentation": "error",
      "jsdoc/require-description": "warn",
      "jsdoc/check-syntax": "error",
      "jsdoc/require-asterisk-prefix": "warn",
      "jsdoc/check-param-names": "warn",
      "jsdoc/check-tag-names": "warn",
      "jsdoc/check-types": "off",
      "jsdoc/empty-tags": "warn",
      "jsdoc/require-param": "warn",
      "jsdoc/require-returns": "warn",
    },
  },
  {
    files: [
      "lib/src/**/*.test.ts",
      "lib/src/**/*.test.tsx",
      "lib/tests/**/*.test.ts",
      "lib/tests/**/*.test.tsx",
      "lib/tests/**/*.bench.ts",
      "lib/tests/**/*.bench.tsx",
    ],
    plugins: {
      vitest,
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
      },
    },
    rules: {
      ...vitest.configs.recommended.rules,
      "vitest/max-nested-describe": [
        "error",
        {
          max: 3,
        },
      ],
      "vitest/prefer-lowercase-title": [
        "error",
        {
          ignore: ["describe"],
        },
      ],
    },
  },
  {
    ...playwright.configs["flat/recommended"],
    files: ["**/tests/e2e/**/*.ts", "**/tests/e2e/**/*.tsx"],
    rules: {
      ...playwright.configs["flat/recommended"].rules,
    },
  },
];
