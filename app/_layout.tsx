import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { Platform, AppState, AppStateStatus, BackHandler, ToastAndroid, View, StyleSheet } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../src/context/AppContext';
import { kidPalette, kidSizes } from '../src/theme/kidTheme';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';

const shellStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: kidSizes.maxContent,
    alignSelf: 'center',
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
});
import { audioService } from '../src/services/audioService';
import { rhymeAudioService } from '../src/services/rhymeAudioService';
import { soundEffects } from '../src/services/soundEffects';
import { ScreenWellnessOverlay } from '../src/components/ScreenWellnessOverlay';
import { schedulePrefetchCharacterAssets } from '../src/services/assetPrefetchService';
import { apiService } from '../src/services/apiService';
import { contentPackService } from '../src/services/contentPackService';

function GlobalAudioRouteWatcher() {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);

  // 1. Immediately silence previous screen audio BEFORE newly mounted child useEffects trigger speech
  useLayoutEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      audioService.stop();
      rhymeAudioService.stop();
      soundEffects.stopAnimalSound();
      soundEffects.stopBgm();

      // On Web: Prevent 'Blocked aria-hidden on an element because its descendant retained focus'
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    }
  }, [pathname]);

  // 2. Android & Mobile: Immediately silence audio when app goes to background or screen locks
  useEffect(() => {
    const appStateSub = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // Only 'background' stops audio. iOS reports 'inactive' for transient overlays (Control
      // Center, notification shade, Face ID prompt) where the child is still in the app; stopping
      // there restarted rhymes from the top. Real backgrounding always passes through 'background',
      // and phone calls interrupt the audio session at the OS level.
      if (nextAppState === 'background') {
        audioService.stop();
        rhymeAudioService.stop();
        soundEffects.stopAnimalSound();
        soundEffects.stopBgm();
      }
    });

    return () => {
      appStateSub.remove();
    };
  }, []);

  // 2b. Web & Desktop Browser: Immediately silence audio when browser tab is hidden
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        audioService.stop();
        rhymeAudioService.stop();
        soundEffects.stopAnimalSound();
        soundEffects.stopBgm();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 3. Android: Friendly double-tap Back to exit on Home screen
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let lastBackPressTime = 0;
    const onBackPress = () => {
      if (pathname === '/home' || pathname === '/') {
        const now = Date.now();
        if (now - lastBackPressTime < 2000) {
          BackHandler.exitApp();
          return true;
        }
        lastBackPressTime = now;
        if (ToastAndroid?.show) {
          ToastAndroid.show('બહાર નીકળવા માટે ફરીથી દબાવો (Press back again to exit)', ToastAndroid.SHORT);
        }
        return true;
      }
      return false;
    };

    const backSub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      backSub.remove();
    };
  }, [pathname]);

  return null;
}

export default function RootLayout() {
  // Initialize permanent offline media pack, pre-warm native TTS voices, wake Render backend, and prefetch if needed
  useEffect(() => {
    audioService.loadNativeVoices().catch(() => {});
    contentPackService.init().then((installed) => {
      apiService.warmUpBackend();
      if (!installed) {
        schedulePrefetchCharacterAssets();
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const fontLinkId = 'kidszone-google-fonts';
      if (!document.getElementById(fontLinkId)) {
        // Preconnect to Google Fonts servers for fastest font resolution
        const preconnect1 = document.createElement('link');
        preconnect1.rel = 'preconnect';
        preconnect1.href = 'https://fonts.googleapis.com';
        document.head.appendChild(preconnect1);

        const preconnect2 = document.createElement('link');
        preconnect2.rel = 'preconnect';
        preconnect2.href = 'https://fonts.gstatic.com';
        preconnect2.crossOrigin = 'anonymous';
        document.head.appendChild(preconnect2);

        const link = document.createElement('link');
        link.id = fontLinkId;
        link.rel = 'stylesheet';
        link.href =
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Gujarati:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Cinzel:wght@600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Great+Vibes&display=swap';
        document.head.appendChild(link);

        const style = document.createElement('style');
        style.id = 'kidszone-font-styles';
        style.textContent = `
          html, body, #root {
            min-height: 100%;
            background: linear-gradient(180deg, #E0F2FE 0%, #FFFDF5 40%, #FEF9C3 75%, #FDE68A 100%) !important;
            background-attachment: fixed !important;
          }

          /* Multilingual Typography System:
             English: Inter
             Gujarati: Noto Sans Gujarati
             Hindi: Noto Sans Devanagari
          */
          *, *::before, *::after, html, body, div, span, p, h1, h2, h3, h4, h5, h6, a, button, input, select, textarea, [dir="ltr"], [dir="rtl"], [dir="auto"] {
            font-family: 'Noto Sans Gujarati', 'Noto Sans Devanagari', 'Inter', 'Noto Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            letter-spacing: normal !important;
          }

          /* Global safeguards: prevent clipping of upper matras (શિરોરેખા/માત્રા) and lower vowel signs */
          [dir="auto"], [class*="r-text-"] {
            overflow: visible !important;
          }

          /* Ensure all text nodes have vertical breathing room so glyphs never clip */
          :lang(gu), [lang="gu"], :lang(hi), [lang="hi"] {
            letter-spacing: normal !important;
            font-feature-settings: "kern" 1, "liga" 1, "clig" 1;
            line-height: 1.5;
          }

          .classic-cert-title, .classic-cert-title * {
            font-family: 'Cinzel', 'Playfair Display', Georgia, 'Times New Roman', serif !important;
            letter-spacing: 1.5px !important;
          }
          .classic-cert-signature, .classic-cert-signature * {
            font-family: 'Great Vibes', 'Brush Script MT', cursive !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
          @media print {
            header, nav, .no-print, [role="navigation"],
            #no-print-header, #no-print-controls, [data-print="hide"],
            div[style*="position: fixed"] {
              display: none !important;
              visibility: hidden !important;
              height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            html, body {
              background: #FFFFFF !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              height: 100% !important;
              overflow: hidden !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body * {
              visibility: hidden;
            }
            #certificate-print-canvas,
            #certificate-print-canvas * {
              visibility: visible !important;
            }
            #certificate-print-canvas {
              position: absolute !important;
              left: 0 !important;
              right: 0 !important;
              top: 6mm !important;
              margin: 0 auto !important;
              width: 195mm !important;
              max-width: 195mm !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              background: #FFFEF7 !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-before: avoid !important;
              page-break-after: avoid !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `;
        document.head.appendChild(style);
      }

      // Chrome 125+ WAI-ARIA safeguard: Prevent 'Blocked aria-hidden on an element because its descendant retained focus'
      // When navigating or switching views, blur any focused element so hidden containers don't hold active focus.
      const handleWebPointerDown = (e: MouseEvent | TouchEvent) => {
        const target = e.target as HTMLElement | null;
        if (target && (target.closest('[role="button"]') || target.closest('button') || target.closest('a'))) {
          if (document.activeElement instanceof HTMLElement && document.activeElement !== target) {
            document.activeElement.blur();
          }
        }
      };
      window.addEventListener('pointerdown', handleWebPointerDown, { passive: true });
      window.addEventListener('popstate', () => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });
    }
  }, []);

  return (
    <SafeAreaProvider>
      <AppProvider>
        <GlobalAudioRouteWatcher />
        <ScreenWellnessOverlay />
        <StatusBar style="dark" />
        {/* Responsive shell: full-bleed signature sky-to-sunshine gradient background */}
        <View style={shellStyles.page}>
          <AppGlobalBackground id="shellGlobalBg" />
          <View style={shellStyles.column}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
                animation: 'slide_from_right',
              }}
            >
          <Stack.Screen name="index" />
          <Stack.Screen name="setup" />
          <Stack.Screen name="offline-warning" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="home" />
          <Stack.Screen name="language" />
          <Stack.Screen name="lessons/index" />
          <Stack.Screen
            name="lessons/[id]"
            options={({ route }) => ({
              animation: (route?.params as any)?.dir === 'prev' ? 'slide_from_left' : 'slide_from_right',
            })}
          />
          <Stack.Screen name="games/index" />
          <Stack.Screen name="games/[type]" />
          <Stack.Screen name="rewards" />
          <Stack.Screen name="parent/index" />
          <Stack.Screen name="adventure" />
          <Stack.Screen name="drawing" />
          <Stack.Screen name="coloring" />
          <Stack.Screen name="stories" />
          <Stack.Screen name="shopgame" />
          <Stack.Screen name="garden" />
          <Stack.Screen name="missions" />
          <Stack.Screen name="avatar" />
          <Stack.Screen name="wordbuilder" />
          <Stack.Screen name="challenge" />
          <Stack.Screen name="worksheets" />
          <Stack.Screen name="certificate" />
          <Stack.Screen name="calendar_habits" />
          <Stack.Screen name="rhymes" />
          <Stack.Screen name="classes" />
          <Stack.Screen name="subjects" />
          <Stack.Screen name="menu" />
          <Stack.Screen name="progress" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="help" />
          <Stack.Screen name="about" />
        </Stack>
          </View>
        </View>
      </AppProvider>
    </SafeAreaProvider>
  );
}
