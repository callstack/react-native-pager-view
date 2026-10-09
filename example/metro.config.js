const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config');
const { withMetroConfig } = require('react-native-monorepo-config');

const root = path.resolve(__dirname, '..');

// react-native-tab-view and @react-navigation/material-top-tabs list
// react-native-pager-view as a peer dependency, so Bun would install the
// published copy into node_modules and Metro would resolve it instead of the
// local source. The `"react-native-pager-view": "link:."` override in the root
// package.json symlinks node_modules/react-native-pager-view to the repo root
// instead. (`workspace:*` can't be used: the root isn't one of its workspaces.)

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
module.exports = withMetroConfig(getDefaultConfig(__dirname), {
  root,
  dirname: __dirname,
});
