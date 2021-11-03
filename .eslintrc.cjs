module.exports = {
  env: {
    es6: true,
    node: true,
    browser: true
  },
  extends: [
    'standard',
    'plugin:jsdoc/recommended',
    'plugin:compat/recommended'
  ],
  plugins: [
    'jest',
    'jsdoc'
  ],
  rules: {
    'no-var': 'error',
    'require-jsdoc': [
      'error', {
        require: {
          ClassDeclaration: true,
          FunctionDeclaration: true,
          MethodDefinition: true
        }
      }
    ],
    'jsdoc/no-multi-asterisks': 'off'
  },
  globals: {
    Iterable: 'readonly',
    AsyncIterable: 'readonly'
  }
}
