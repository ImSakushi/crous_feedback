import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Custom rule adjustments to streamline code quality checks
    rules: {
      // Allow unescaped entities in JSX (e.g., apostrophes)
      "react/no-unescaped-entities": "off",
      // Permit usage of `any` where necessary
      "@typescript-eslint/no-explicit-any": "off",
      // Ignore unused variables named e, error, data, currentDate; ignore args starting with _
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^(data|currentDate)$",
          // Ignore unused catch errors named e or error
          "caughtErrorsIgnorePattern": "^(e|error)$"
        }
      ],
      // Warn on missing effect dependencies rather than erroring
      "react-hooks/exhaustive-deps": "warn"
    }
  }
];

export default eslintConfig;
