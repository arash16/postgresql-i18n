module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2019,
    parser: 'babel-eslint',
  },
  extends: [
    'prettier',
    'plugin:prettier/recommended',
  ],
  plugins: ['import', 'prettier'],
  // add your custom rules here
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'SequenceExpression',
        message: 'The comma operator is confusing and a common mistake.',
      },
      {
        selector: 'WithStatement',
        message: 'The with statement makes the code hard to understand.',
      },
      {
        selector: 'CallExpression[arguments.length > 5]',
        message:
          'Functions with more than 5 arguments make the code complex. ' +
          'Please use object destructring and take named parameters',
      },
      {
        selector:
          "CallExpression[callee.name='setTimeout'][arguments.length!=2]",
        message: 'setTimeout must always be invoked with two arguments.',
      },
    ],

    // following are configured by prettier
    // 'comma-dangle': ['error', 'always-multiline'],
    // 'semi': [2, 'always'],
    'prettier/prettier': 'warn',

    'no-console': 'off',
    'no-debugger': 'off',
    'no-tabs': 'error',
    'no-unused-vars': 'error',
    'curly': ['error', 'all'],
    'quotes': [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: false },
    ],

    'import/no-self-import': ['error'],
    'import/named': ['error'],
    'import/default': ['error'],
    'import/no-cycle': ['error'],
    'import/no-useless-path-segments': ['error'],
    'import/no-cycle': ['error'],
    'import/first': ['error'],
    'import/no-duplicates': ['error'],
  },
};
