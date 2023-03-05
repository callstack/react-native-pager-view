const path = require('path');

const root = path.resolve(__dirname, '../');

const project = (() => {
  try {
    const {
      androidManifestPath,
      iosProjectPath,
    } = require('react-native-test-app');
    const iosProject = iosProjectPath('ios');
    return {
      android: {
        sourceDir: 'android',
        manifestPath: androidManifestPath(path.join(__dirname, 'android')),
      },

      ...(iosProject ? { ios: { project: iosProject } } : undefined),
    };
  } catch (_) {
    return undefined;
  }
})();

module.exports = {
  ...(project ? { project } : undefined),
  dependencies: {
    'react-native-pager-view': {
      root,
    },
  },
};
