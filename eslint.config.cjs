const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const noOnlyTests = require("eslint-plugin-no-only-tests");
const importPlugin = require("eslint-plugin-import");
const unusedImports = require("eslint-plugin-unused-imports");

/**
 * List of packages or apps
 */
const workspaces = [
  "packages/core",
  "packages/compiler",
  "packages/cdk",
  "examples/dev-workflow",
];

module.exports = tseslint.config(
  {
    ignores: ["**/dist/**", "**/cdk.out/**", "**/node_modules/**"],
  },
  // tseslint.configs.recommended,
  // js.configs.recommended,
  workspaces.map((pkg) => ({
    files: [`./${pkg}/**/*.ts`],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: [`./${pkg}/tsconfig.json`],
        sourceType: "module",
      },
      globals: {
        __dirname: true,
        __filename: true,
        require: true,
        module: true,
        exports: true,
        console: true,
        process: true,
        Buffer: true,
        setTimeout: true,
        clearTimeout: true,
        setInterval: true,
        clearInterval: true,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "no-only-tests": noOnlyTests,
      import: importPlugin,
      "unused-imports": unusedImports,
    },
    rules: {
      "no-console": ["warn", { allow: ["info", "warn", "error"] }],
      "no-only-tests/no-only-tests": "error",
      "unused-imports/no-unused-imports": "error",
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
        },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  })),

  // tests
  {
    files: ["test/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.json"],
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "no-only-tests": noOnlyTests,
      import: importPlugin,
      "unused-imports": unusedImports,
    },
    rules: {
      "no-only-tests/no-only-tests": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
          // 👇 This is key:
          caughtErrors: "none",
        },
      ],
      "unused-imports/no-unused-imports": "error",
    },
  }
);
