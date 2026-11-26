const { withGradleProperties } = require('@expo/config-plugins');

/**
 * Expo config plugin to minimize Android APK size safely:
 * - Targets arm64-v8a only (cuts ~57.5 MB of x86/x86_64/armeabi-v7a native libs)
 * - Sets expo.useLegacyPackaging=true so arm64-v8a .so libs are ZIP-compressed in the APK
 *   (shrinks ~20 MB of native libs down to ~8 MB; unpacked once at install time)
 * - Keeps R8/shrinkResources disabled so Expo New Architecture reflection/resources never crash
 */
module.exports = function withSmallAndroidApk(config) {
  return withGradleProperties(config, (cfg) => {
    const props = [
      { key: 'reactNativeArchitectures', value: 'arm64-v8a' },
      { key: 'expo.useLegacyPackaging', value: 'true' },
      { key: 'android.enableMinifyInReleaseBuilds', value: 'false' },
      { key: 'android.enableShrinkResourcesInReleaseBuilds', value: 'false' },
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
};
