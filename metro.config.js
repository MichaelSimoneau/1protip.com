const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('jsx', 'js', 'ts', 'tsx', 'json');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native/jsx-runtime' && platform === 'web') {
    return {
      filePath: require.resolve('react/jsx-runtime'),
      type: 'sourceFile',
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
