const reactNative = require('@react-native/eslint-config/flat');

module.exports = [
  {
    ignores: ['lib/', 'coverage/'],
  },
  ...reactNative,
];
