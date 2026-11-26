const { withGradleProperties, withSettingsGradle } = require('@expo/config-plugins');

const WINDOWS_CMAKE_SNIPPET = `
// Fix Windows MAX_PATH (260-char) CMake/Ninja mkdir failures in deep node_modules paths
if (System.getProperty("os.name").toLowerCase().contains("windows")) {
  def sysDrive = System.getenv("SystemDrive") ?: "C:"
  def configureCmake = { p ->
    def hasCmake = new File(p.projectDir, "CMakeLists.txt").exists() ||
      new File(p.projectDir, "src/main/jni/CMakeLists.txt").exists() ||
      p.name == "app" ||
      p.name == "react-native-screens"
    if (!hasCmake) return
    def androidExt = p.extensions.findByName("android")
    if (androidExt != null) {
      androidExt.externalNativeBuild {
        cmake {
          buildStagingDirectory new File("\${sysDrive}/kx/\${Math.abs(p.name.hashCode()) % 10000}")
        }
      }
      androidExt.defaultConfig {
        externalNativeBuild {
          cmake {
            // CMake converts NDK clang++.exe paths with spaces to 8.3 CLANG_~1.EXE, which with
            // -no-canonical-prefixes loses C++ driver detection and drops -lc++ when linking.
            arguments "-DCMAKE_OBJECT_PATH_MAX=240",
              "-DCMAKE_SHARED_LINKER_FLAGS=--driver-mode=g++",
              "-DCMAKE_MODULE_LINKER_FLAGS=--driver-mode=g++",
              "-DCMAKE_EXE_LINKER_FLAGS=--driver-mode=g++"
          }
        }
      }
    }
  }
  gradle.beforeProject { p ->
    if (p != rootProject) {
      p.pluginManager.withPlugin("com.android.library") { configureCmake(p) }
      p.pluginManager.withPlugin("com.android.application") { configureCmake(p) }
    }
  }
}
`;

/**
 * Expo config plugin to minimize Android APK size safely and fix Windows CMake path limits:
 * - Targets arm64-v8a only (cuts ~57.5 MB of x86/x86_64/armeabi-v7a native libs)
 * - Sets expo.useLegacyPackaging=true so arm64-v8a .so libs are ZIP-compressed in the APK
 *   (shrinks ~20 MB of native libs down to ~8 MB; unpacked once at install time)
 * - Keeps R8/shrinkResources disabled so Expo New Architecture reflection/resources never crash
 */
module.exports = function withSmallAndroidApk(config) {
  config = withGradleProperties(config, (cfg) => {
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

  return withSettingsGradle(config, (cfg) => {
    if (!cfg.modResults.contents.includes('CMAKE_OBJECT_PATH_MAX')) {
      cfg.modResults.contents = `${cfg.modResults.contents.trimEnd()}\n${WINDOWS_CMAKE_SNIPPET}`;
    }
    return cfg;
  });
};
