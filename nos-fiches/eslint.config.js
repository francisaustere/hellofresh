// ESLint flat config mimicking the house style (see SKILL.md).
// npm i -D eslint typescript-eslint eslint-plugin-vue vue-eslint-parser @stylistic/eslint-plugin globals
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import stylistic from "@stylistic/eslint-plugin";
import globals from "globals";

export default tseslint.config(
  {
    ignores: ["dist/**", "build/**", "node_modules/**", "public/**", "src/api/generated/**", "**/*.d.ts", "tmp/**", ".tmp/**"],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],

  {
    files: ["**/*.{ts,vue}"],
    languageOptions: {
      globals: { ...globals.browser },
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: "latest",
        sourceType: "module",
        extraFileExtensions: [".vue"],
      },
    },
    plugins: { "@stylistic": stylistic },
    rules: {
      // --- Formatting (warn: legacy files are not fully consistent)
      "@stylistic/indent": ["warn", 2, { SwitchCase: 1 }],
      "@stylistic/semi": ["warn", "always"],
      "@stylistic/quotes": ["warn", "double", { avoidEscape: true, allowTemplateLiterals: "always" }],
      "@stylistic/comma-dangle": ["warn", "only-multiline"],
      "@stylistic/no-multiple-empty-lines": ["warn", { max: 2, maxBOF: 1, maxEOF: 0 }],
      "@stylistic/no-trailing-spaces": "warn",
      "@stylistic/eol-last": ["warn", "always"],
      "@stylistic/space-before-blocks": "warn",
      "@stylistic/keyword-spacing": "warn",
      "@stylistic/object-curly-spacing": ["warn", "always"],
      "@stylistic/brace-style": ["warn", "1tbs", { allowSingleLine: true }],
      "curly": ["warn", "multi-line"],
      "eqeqeq": ["warn", "always", { null: "ignore" }],

      // --- Naming
      "@typescript-eslint/naming-convention": [
        "warn",
        { selector: "default", format: ["camelCase"], leadingUnderscore: "allow" },
        { selector: "variable", format: ["camelCase", "UPPER_CASE", "PascalCase"], leadingUnderscore: "allow" },
        { selector: "function", format: ["camelCase", "PascalCase"] },
        { selector: "parameter", format: ["camelCase"], leadingUnderscore: "allow" },
        { selector: "memberLike", modifiers: ["private"], format: ["camelCase", "UPPER_CASE"], leadingUnderscore: "require" },
        { selector: "memberLike", modifiers: ["protected"], format: ["camelCase", "UPPER_CASE"], leadingUnderscore: "allow" },
        { selector: "property", format: null }, // object keys: CSS vars, event types, GL names
        { selector: "typeLike", format: ["PascalCase"] },
        { selector: "enumMember", format: ["PascalCase", "UPPER_CASE"] },
        { selector: "import", format: null },
      ],

      // --- TypeScript
      "@typescript-eslint/explicit-member-accessibility": ["warn", { accessibility: "no-public", overrides: { properties: "off", methods: "off", accessors: "off" } }],
      "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports", fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-unused-expressions": ["warn", { allowShortCircuit: true, allowTernary: true }],
      "@typescript-eslint/prefer-nullish-coalescing": "off", // needs type info; enable if parserOptions.project is set
      "no-var": "error",
      "prefer-const": "warn",
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": "warn",

      // --- Hygiene
      "no-console": ["warn", { allow: ["warn", "error"] }], // console.log only behind import.meta.env.DEV
      "no-debugger": "error",
      "no-fallthrough": "error",
      "no-else-return": "warn",
      "no-useless-return": "warn",
      "no-param-reassign": "off", // gl-matrix out-params
      "no-constant-condition": ["warn", { checkLoops: false }],
      "no-warning-comments": "off",
      "max-lines": ["warn", { max: 600, skipBlankLines: true, skipComments: true }],
    },
  },

  // Vue SFC specifics
  {
    files: ["**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/component-name-in-template-casing": ["warn", "PascalCase"],
      "vue/block-order": ["warn", { order: ["template", "script", "style"] }],
      "vue/block-lang": ["warn", { script: { lang: "ts" } }],
      "vue/define-props-declaration": ["warn", "type-based"],
      "vue/define-emits-declaration": "off",
      "vue/max-attributes-per-line": ["warn", { singleline: 3, multiline: 1 }],
      "vue/html-indent": ["warn", 2],
      "vue/html-self-closing": ["warn", { html: { void: "never", normal: "never", component: "always" } }],
      "vue/html-closing-bracket-newline": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/multiline-html-element-content-newline": "off",
      "vue/require-default-prop": "off",
      "vue/no-v-html": "warn",
      "vue/attributes-order": "off",
      "@stylistic/indent": "off", // handled by vue/script-indent-ish formatting in SFC
      "no-undef": "off",
    },
  },

  // Dev tooling and shaders glue may log freely
  {
    files: ["src/**/dev/**", "src/**/debug/**", "src/**/gui/**"],
    rules: { "no-console": "off", "@typescript-eslint/no-explicit-any": "off" },
  },

  // Config / node scripts
  {
    files: ["*.config.{js,ts,mjs}", "build/**", "scripts/**"],
    languageOptions: { globals: { ...globals.node } },
    rules: { "no-console": "off" },
  },
);
