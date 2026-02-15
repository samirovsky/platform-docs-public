import next from 'eslint-config-next';

export default [
  {
    ignores: [
      'node_modules',
      '.next',
      'playwright-report',
      'test-results',
      'dist',
    ],
  },
  ...next,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
    },
  },
];
