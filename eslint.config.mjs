import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslintConfigPrettier from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      "**/node_modules",
      "**/dist",
      "**/coverage/",
      "**/.rslib"
    ],
  },
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  eslintConfigPrettier,
  {
    settings: {
      react: {
        version: "19",
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      "react/prop-types": "off",
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
];
