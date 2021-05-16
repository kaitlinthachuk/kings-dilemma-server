module.exports = {
  env: {
    node: true,
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    'no-var': 'error',
    'dot-notation': 'error',
    'prefer-const': 'error',
    '@typescript-eslint/ban-ts-comment': 'warn',
  },
}
