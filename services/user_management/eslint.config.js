import js from '@eslint/js';
import nodePlugin from 'eslint-plugin-node';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    plugins: {
      node: nodePlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      // 'prettier/prettier': 'error',
      'block-scoped-var': 'error',
      // eqeqeq: 'error',
      'no-warning-comments': 'warn',
      'no-var': 'warn',
      'prefer-const': 'error',
      'node/no-unpublished-import': 'off',
    },
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        after: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    rules: {
      'node/no-unpublished-import': 'off',
    },
  },
];
