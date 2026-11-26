const { withGradleProperties, withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Expo config plugin to minimize Android APK size while keeping runtime fast:
 * - Targets arm64-v8a only (cuts ~57 MB of x86/x86_64/armeabi-v7a native libs)
 * - Enables R8/ProGuard code & resource shrinking in release builds
 * - Compresses native .so libs inside the APK archive (unpacked once at install)
 */
module.exports = function withSmallAndroidApk(config) {
  config = withGradleProperties(config, (cfg) => {
    const props = [
      { key: 'reactNativeArchitectures', value: 'arm64-v8a' },
      { key: 'android.enableMinifyInReleaseBuilds', value: 'true' },
      { key: 'android.enableShrinkResourcesInReleaseBuilds', value: 'true' },
    ];
    for (const { key, value } of props) {
      const existing = cfg.modResults.find((item) => item.type === 'property' && item.key === key);
      if (existing) {
        existing.value = value;
      } else {
        cfg.modResults.push({ type: 'property', key, value });
      }
    }
    return cfg;
  });

  config = withAppBuildGradle(config, (cfg) => {
    let contents = cfg.modResults.contents;
    if (!contents.includes('useLegacyPackaging')) {
      const marker = 'android {';
      const idx = contents.indexOf(marker);
      if (idx !== -1) {
        const insert = `\n    packagingOptions {\n        jniLibs {\n            useLegacyPackaging = true\n        }\n    }`;
        contents = contents.slice(0, idx + marker.length) + insert + contents.slice(idx + marker.length);
      }
    }
    cfg.modResults.contents = contents;
    return cfg;
  });

  return config;
};

