const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('jsx', 'js', 'ts', 'tsx', 'json');

// Configure watch folders to avoid hitting system file watcher limits
config.watchFolders = [
  __dirname,
  path.resolve(__dirname, '../../shared'),
];

// Configure projectRoot to focus on necessary directories
config.projectRoot = __dirname;

// Add blacklist for node_modules to prevent watching unnecessary files
config.resolver.blacklistRE = /node_modules[/\\](?!@1protip)/;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    if (moduleName === 'react-native/jsx-runtime') {
      return {
        filePath: require.resolve('react/jsx-runtime'),
        type: 'sourceFile',
      };
    }
    if (moduleName === 'react-native/jsx-dev-runtime') {
      return {
        filePath: require.resolve('react/jsx-dev-runtime'),
        type: 'sourceFile',
      };
    }
    if (moduleName === 'react-native-pager-view') {
      return {
        filePath: require.resolve('./mocks/react-native-pager-view.tsx'),
        type: 'sourceFile',
      };
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
