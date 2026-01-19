/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['next/core-web-vitals', 'next/typescript'],
  ignorePatterns: ['**/static/**'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
    'prefer-const': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'react/jsx-key': 'off',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
  },
};
