const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
const root = path.resolve(__dirname, '..');

// Watch parent src/ for live reload
config.watchFolders = [path.resolve(root, 'src')];

// Map react-native-pager-view to parent source
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-pager-view') {
    return {
      filePath: path.resolve(root, 'src', 'index.tsx'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Force all node_modules resolution to example-web's own node_modules.
// Without this, files in ../src/ resolve deps from ../node_modules/
// which doesn't have react-native-web.
config.resolver.disableHierarchicalLookup = true;
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];

module.exports = config;
