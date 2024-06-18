const { configureProjects } = require('react-native-test-app');
const path = require('path');

module.exports = {
  dependencies: {
    'react-native-pager-view': {
      root: path.join(__dirname, '..'),
    },
  },
  project: configureProjects({
    android: {
      sourceDir: 'android',
    },
    ios: {
      sourceDir: 'ios',
    },
    visionos: {
      sourceDir: 'visionos',
    },
  }),
};
