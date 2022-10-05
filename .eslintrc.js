module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', "prettier"],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [
      '.eslintrc.js',
      '**/.prettier*',
      '**/.version*',
      '**/*.md',
      '**/*.js',
      '**/*.js.map',
      '**/*.d.ts'
  ],
  overrides: [
    {
      files: ["*"],
      "rules": {
        "prefer-rest-params": "off"
      }
    }
  ],
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/ban-types": [
      "error",
      {
        "types": {
          "Function": false
        },
        "extendDefaults": true
      }
    ]
  },
};
