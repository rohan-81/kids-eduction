import React from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';
import { spacing, radii, shadows } from '../src/theme/spacing';
import { useApp } from '../src/context/AppContext';
import { Header } from '../src/components/Header';
import { BottomNav } from '../src/components/BottomNav';
import { HOME_CARD_ART } from '../src/utils/imageHelper';
import { ClayBadgeToken } from '../src/components/SubjectBadgeIcons';
import * as Art from '../src/components/art3d/Art3D';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';

export default function AboutScreen() {
  const { language } = useApp();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="aboutBgGrad" />
      <Header
        title={language === 'gu' ? 'એપ વિશે' : language === 'hi' ? 'ऐप के बारे में' : 'About'}
        showBack={true}
        backHref="/home"
      />

      <ScrollView
        contentContainerStyle={[styles.container, isMobile && styles.containerMobile]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.aboutCard, shadows.card]}>
          <View style={styles.logoBadge}>
            <Image source={HOME_CARD_ART.storybook} resizeMode="contain" style={{ width: 64, height: 64 }} />
          </View>

          <Text style={styles.appName}>KidsZone</Text>
          <Text style={styles.versionTag}>Version 2.4 • Early Childhood Edition</Text>

          <Text style={styles.aboutText}>
            {language === 'gu'
              ? 'KidsZone એ ૨ થી ૮ વર્ષના બાળકો માટે વિશિષ્ટ રીતે રચાયેલ એક રંગીન, સલામત અને આકર્ષક શૈક્ષણિક પ્લેટફોર્મ છે. આ એપમાં પ્રી-સ્કૂલ, ધોરણ ૧-૨ અને ધોરણ ૩-૫ નો વ્યાપક અભ્યાસક્રમ સમાવિષ્ટ છે.'
              : language === 'hi'
              ? 'KidsZone २ से ८ वर्ष के बच्चों के लिए विशेष रूप से डिज़ाइन किया गया एक सुरक्षित, रंगीन और आकर्षक शैक्षिक मंच है। इसमें प्री-स्कूल से लेकर कक्षा ५ तक का पाठ्यक्रम शामिल है।'
              : 'KidsZone is a child-friendly, interactive learning app designed for ages 2 to 8. Featuring structured curricula for Pre-School Nursery, Class 1-2, and Class 3-5 across multilingual scripts.'}
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <ClayBadgeToken art={Art.ShieldArt} tone="mint" size={34} />
              <Text style={styles.featureText}>100% Kid-Safe & Ad-Free Learning</Text>
            </View>
            <View style={styles.featureItem}>
              <ClayBadgeToken art={Art.MegaphoneArt} tone="sky" size={34} />
              <Text style={styles.featureText}>Trilingual Audio (Gujarati, English, Hindi)</Text>
            </View>
            <View style={styles.featureItem}>
              <ClayBadgeToken art={Art.PencilArt} tone="gold" size={34} />
              <Text style={styles.featureText}>Printable A4 Tracing Worksheets</Text>
            </View>
            <View style={styles.featureItem}>
              <ClayBadgeToken art={Art.TrophyArt} tone="peach" size={34} />
              <Text style={styles.featureText}>Certificates & Milestone Badges</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomNav activeTab="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  containerMobile: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  appName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  versionTag: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresList: {
    width: '100%',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 18,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#334155',
  },
});
