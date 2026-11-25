module.exports = ({ config }) => {
  const profile = process.env.EAS_BUILD_PROFILE || '';
  const isReleaseProfile =
    profile === 'production' ||
    profile === 'preview' ||
    process.env.NODE_ENV === 'production';

  // Build-time validation: refuse to build a release that would point at a missing, insecure or
  // placeholder backend. Both URLs are baked into the JS bundle at build time, so a wrong value
  // cannot be fixed after the app is in the store.
  if (isReleaseProfile) {
    const label = profile || 'release';
    const requireReleaseUrl = (name, example, pathSuffix) => {
      const value = process.env[name]?.trim();
      if (!value) {
        throw new Error(
          `[EAS Build Configuration Error] ${name} is missing for ${label} build. ` +
          `Set it via 'eas secret:create --name ${name} --value ${example}' or environment variables.`
        );
      }
      if (!value.startsWith('https://')) {
        throw new Error(
          `[EAS Build Security Error] ${name} must start with https:// for ${label} builds. Received: "${value}".`
        );
      }
      if (value.includes('example.com')) {
        throw new Error(
          `[EAS Build Security Error] ${name} cannot use placeholder "example.com" in ${label} builds.`
        );
      }
      if (pathSuffix && !value.replace(/\/+$/, '').endsWith(pathSuffix)) {
        throw new Error(
          `[EAS Build Configuration Error] ${name} must end with "${pathSuffix}" for ${label} builds ` +
          `(assets are stored under that prefix). Received: "${value}".`
        );
      }
      return value;
    };

    requireReleaseUrl('EXPO_PUBLIC_API_URL', 'https://your-domain.com/api');
    // Without an explicit media URL the app silently falls back to <api-host>/media, which stops
    // working the moment Django stops serving media (DJANGO_SERVE_MEDIA=False behind a CDN).
    // Serving media from Django on purpose? Set it explicitly to https://<api-host>/media.
    requireReleaseUrl('EXPO_PUBLIC_MEDIA_URL', 'https://your-cdn-domain/media', '/media');
  }

  return {
    ...config,
    android: {
      ...config.android,
      // Cleartext HTTP enabled in development for local LAN testing over Wi-Fi (e.g. 192.168.x.x:8000);
      // Strictly disabled (usesCleartextTraffic: false) in production/preview release builds.
      usesCleartextTraffic: !isReleaseProfile,
    },
  };
};
