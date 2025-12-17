const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

// Find workspace root by looking for pnpm-workspace.yaml
function findWorkspaceRoot(startPath) {
  let currentPath = startPath;
  while (currentPath !== path.dirname(currentPath)) {
    if (fs.existsSync(path.join(currentPath, 'pnpm-workspace.yaml'))) {
      return currentPath;
    }
    currentPath = path.dirname(currentPath);
  }
  return startPath;
}

const workspaceRoot = findWorkspaceRoot(__dirname);
const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('jsx', 'js', 'ts', 'tsx', 'json');

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
