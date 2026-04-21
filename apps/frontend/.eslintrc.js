module.exports = {
  ignorePatterns: [".eslintrc.js"],
  extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
  plugins: ["@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  rules: {
    "import/order": "warn",
    "import/prefer-default-export": "off",
    "import/no-default-export": [0, "camel-case"],
    "import/no-extraneous-dependencies": [
      2,
      {
        optionalDependencies: true,
        devDependencies: [
          "**/tests/**.{ts,js,jsx,tsx}",
          "**/_test_/**.{ts,js,jsx,tsx}",
          "/mock/**/**.{ts,js,jsx,tsx}",
          "**/**.test.{ts,js,jsx,tsx}",
          "**/_mock.{ts,js,jsx,tsx}",
          "**/example/**.{ts,js,jsx,tsx}",
          "**/examples/**.{ts,js,jsx,tsx}",
        ],
      },
    ],
    "no-prototype-builtins": "off",
    "no-use-before-define": [
      "error",
      { functions: false, classes: true, variables: true },
    ],
    "no-param-reassign": ["error", { props: false }],
    "no-shadow": "off",
    "no-console": [1, { allow: ["error"] }],
    "import/extensions": 0,
    "import/no-cycle": 0,
    "@typescript-eslint/no-shadow": ["error"],
    "@typescript-eslint/no-use-before-define": ["error"],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-throw-literal": 0,
    "@typescript-eslint/lines-between-class-members": 0,
    "react/jsx-key": "error",
    "react/display-name": "off",
  },
  settings: {
    "import/resolver": {
      node: { extensions: [".js", ".jsx", ".ts", ".tsx", ".d.ts"] },
    },
  },
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: "./tsconfig.json",
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
};
