const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Remove the 'enableBundleCompression' line from app/build.gradle.
 * This property was added to Expo's template but does not exist in
 * React Native 0.76.x's ReactExtension, causing a Gradle build failure.
 */
const withRemoveBundleCompression = (config) => {
  return withAppBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      /\s*enableBundleCompression\s*=\s*.+\n?/,
      '\n'
    );
    return config;
  });
};

module.exports = withRemoveBundleCompression;
