const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName.includes('react/compiler-runtime') ||
    moduleName.includes('react/complier-runtime')
  ) {
    return {
      filePath: require.resolve('./emptyModule.js'),
      type: 'empty',
    };
  }

  // Use the upstream resolver.
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;