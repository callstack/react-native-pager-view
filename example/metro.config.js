const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config');
const { withMetroConfig } = require('react-native-monorepo-config');

const root = path.resolve(__dirname, '..');
const defaultConfig = getDefaultConfig(__dirname);
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
module.exports = withMetroConfig(
  {
    ...defaultConfig,
    resolver: {
      ...defaultConfig.resolver,
      // Use the local package at the monorepo root, not the installed peer copy.
      blockList: [
        ...[].concat(defaultConfig.resolver.blockList || []),
        new RegExp(
          `^${escapeRegExp(
            path.join(__dirname, 'node_modules', 'react-native-pager-view')
          )}[\\\\/]`
        ),
      ],
    },
  },
  { root, dirname: __dirname, workspaces: ['example'] }
);
