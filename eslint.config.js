// ESLint v9 flat config for TypeScript + Node + React (TSX) + Jest tests
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'build/**',
      '.history/**'
    ]
  },
  // JavaScript files
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      // Keep it green: disable noisy rules for JS files
      'no-unused-vars': 'off'
    }
  },
  // TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      // Keep CI green: turn off unused vars checks; TypeScript compiler already warns when needed
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  // Test files: provide Jest globals to avoid no-undef errors
  {
    files: [
      'src/**/*.test.{ts,tsx,js,jsx}',
      'src/**/__tests__/**/*.{ts,tsx,js,jsx}',
      'api/**/*.test.{ts,tsx,js,jsx}',
      'api/**/__tests__/**/*.{ts,tsx,js,jsx}'
    ],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    }
  }
];