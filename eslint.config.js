import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default [
  { ignores: ["dist", "node_modules", "coverage"] },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { parser: tsParser, globals: { ...globals.browser, ...globals.node } },
    plugins: { "@typescript-eslint": tsPlugin, "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: { ...tsPlugin.configs.recommended.rules, ...reactHooks.configs.recommended.rules, "react-refresh/only-export-components": "warn" },
  },
];
