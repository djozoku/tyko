module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['../../.eslintrc.js', 'plugin:react/recommended'],
  plugins: ['react'],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '*.graphql',
            group: 'parent',
            position: 'after',
          },
        ],
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
    linkComponents: ['Link'],
  },
};
