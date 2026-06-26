import js from '@eslint/js';
import globals from 'globals';

const ignored = [
  'android/**',
  'ios/**',
  'node_modules/**',
  'www/**',
  'docs/**',
  '__BestPractice/**',
  'Init/**',
  'project-context.md',

  // Legacy integration file is not currently loaded by index.html and has
  // module-export issues that belong to the SPA refactor stage.
  'spa_integration.js'
];

const baseRules = {
  ...js.configs.recommended.rules,

  // Initial baseline: keep ESLint focused on parser/runtime hazards before
  // tightening style and legacy globals during the refactor.
  'no-undef': 'off',
  'no-unused-vars': 'off',
  'no-empty': 'off',
  'no-console': 'off',
  'no-useless-escape': 'off',
  'no-prototype-builtins': 'off',
  'no-useless-assignment': 'off',
  'no-unreachable': 'off',
  'preserve-caught-error': 'off'
};

export default [
  {
    ignores: ignored
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2022
      }
    },
    rules: baseRules
  },
  {
    files: ['scripts/**/*.mjs', '*.config.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2022
      }
    },
    rules: baseRules
  },
  {
    files: ['tests/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2022
      }
    },
    rules: baseRules
  }
];
