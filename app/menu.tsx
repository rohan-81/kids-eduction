import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';
import { spacing, radii, shadows } from '../src/theme/spacing';
import { useApp } from '../src/context/AppContext';
import { Header } from '../src/components/Header';
import { BottomNav } from '../src/components/BottomNav';
import { soundEffects } from '../src/services/soundEffects';
import { HOME_CARD_ART, SUBJECT_CARD_ART, REWARD_ART } from '../src/utils/imageHelper';
import { ClayBadgeToken, TokenTone } from '../src/components/SubjectBadgeIcons';
import * as Art from '../src/components/art3d/Art3D';
import { Glyph } from '../src/components/fun';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';

/** 3D clay token art for every menu row: crisp vector art or real 3D renders (no emojis). */
const MENU_ART: Record<string, { art: any; tone: TokenTone }> = {
  games: { art: Art.GamepadArt, tone: 'peach' },
  classes: { art: Art.BackpackArt, tone: 'sky' },
  subjects: { art: SUBJECT_CARD_ART.english, tone: 'mint' },
  worksheets: { art: Art.ScrollArt, tone: 'gold' },
  certificates: { art: REWARD_ART.medal, tone: 'gold' },
  habits: { art: Art.CalendarArt, tone: 'pink' },
  adventure: { art: Art.TreasureMapArt, tone: 'lavender' },
  stories: { art: HOME_CARD_ART.storybook, tone: 'sky' },
  challenges: { art: SUBJECT_CARD_ART.star, tone: 'peach' },
  progress: { art: Art.ChartArt, tone: 'lavender' },
  rewards: { art: REWARD_ART.gift, tone: 'gold' },
  settings: { art: Art.GearsArt, tone: 'sky' },
  help: { art: SUBJECT_CARD_ART.logic, tone: 'mint' },
  about: { art: Art.ShieldArt, tone: 'mint' },
};

interface MenuItem {
  id: string;
  titleEn: string;
  titleGu: string;
  titleHi: string;
  descEn: string;
  descGu: string;
  descHi: string;
  bgColor: string;
  badge?: string;
  route: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'games',
    titleEn: 'Fun Games Arcade',
    titleGu: 'મજેદાર રમતો અને ગેમ્સ',
    titleHi: 'मजेदार खेल और गेम्स',
    descEn: 'Balloon pop, math shop, word builder & quiz duel',
    descGu: 'ફુગ્ગા ફોડો, શોપિંગ ગેમ, વર્ડ બિલ્ડર અને ડ્યૂઅલ',
    descHi: 'गुब्बारे फोड़ें, खरीदारी खेल, शब्द जोड़ें और क्विज़',
    bgColor: '#FFF7ED',
    badge: 'Kids Favorite',
    route: '/games',
  },
  {
    id: 'classes',
    titleEn: 'My Classes',
    titleGu: 'મારા વર્ગો (ક્લાસ)',
    titleHi: 'मेरी कक्षाएं',
    descEn: 'Switch class levels (Nursery, Class 1-2, Class 3-5)',
    descGu: 'બાળકના વય મુજબ ક્લાસ બદલો',
    descHi: 'आयु के अनुसार कक्षा चुनें',
    bgColor: '#EFF6FF',
    route: '/classes',
  },
  {
    id: 'subjects',
    titleEn: 'All Subjects',
    titleGu: 'તમામ વિષયો',
    titleHi: 'सभी विषय',
    descEn: 'Math, Science, English, GK, Art and Reasoning',
    descGu: 'ગણિત, વિજ્ઞાન, અંગ્રેજી, કળા અને કોયડા',
    descHi: 'गणित, विज्ञान, अंग्रेजी, कला और तर्क',
    bgColor: '#F0FDF4',
    route: '/subjects',
  },
  {
    id: 'worksheets',
    titleEn: 'Worksheets',
    titleGu: 'વર્કશીટ્સ',
    titleHi: 'वर्कशीट्स',
    descEn: 'Printable practice papers & tracing sheets',
    descGu: 'પેન્સિલથી પ્રેક્ટિસ માટે A4 પ્રિન્ટેબલ શીટ્સ',
    descHi: 'प्रिंट करने योग्य अभ्यास पत्र',
    bgColor: '#FFFBEB',
    route: '/worksheets',
  },
  {
    id: 'certificates',
    titleEn: 'Certificates',
    titleGu: 'પ્રમાણપત્રો',
    titleHi: 'प्रमाण पत्र',
    descEn: 'Official achievement honors and earned diplomas',
    descGu: 'શીખવાના સિદ્ધિ પ્રમાણપત્રો ડાઉનલોડ કરો',
    descHi: 'उपलब्धि प्रमाण पत्र और डिप्लोमा',
    bgColor: '#FEF3C7',
    route: '/certificate',
  },
  {
    id: 'habits',
    titleEn: 'Habits & Goals',
    titleGu: 'આદતો અને દૈનિક લક્ષ્યો',
    titleHi: 'आदतें और लक्ष्य',
    descEn: 'Daily reading habits, water intake & streak tracker',
    descGu: 'રોજિંદી સારી આદતો અને વાંચન કેલેન્ડર',
    descHi: 'दैनिक आदतें और लक्ष्य ट्रैकर',
    bgColor: '#FDF2F8',
    route: '/calendar_habits',
  },
  {
    id: 'adventure',
    titleEn: 'Adventure Quests',
    titleGu: 'એડવેન્ચર ક્વેસ્ટ્સ',
    titleHi: 'रोमांचक यात्रा',
    descEn: 'Magical island map missions and star challenges',
    descGu: 'ટાપુ નકશો અને સ્ટાર મિશન',
    descHi: 'नक्शा मिशन और स्टार चुनौतियां',
    bgColor: '#F5F3FF',
    route: '/adventure',
  },
  {
    id: 'stories',
    titleEn: 'Stories & Rhymes',
    titleGu: 'વાર્તાઓ અને બાલગીતો',
    titleHi: 'कहानियां और बालगीत',
    descEn: 'Audio read-along stories, fables & musical poems',
    descGu: 'ઓડિયો સંગીત સાથે વાર્તાઓ અને ગીતો',
    descHi: 'ऑडियो कहानियां और बालगीत',
    bgColor: '#F0F9FF',
    route: '/stories',
  },
  {
    id: 'challenges',
    titleEn: 'Daily Challenges',
    titleGu: 'ડેઇલી ચેલેન્જ',
    titleHi: 'दैनिक प्रतियोगिता',
    descEn: 'Interactive quiz test & speed memory round',
    descGu: 'દૈનિક ટેસ્ટ આપીને કોઈન્સ અને સ્ટાર્સ જીતો',
    descHi: 'दैनिक क्विज़ टेस्ट और पुरस्कार',
    bgColor: '#FFF7ED',
    route: '/challenge',
  },
  {
    id: 'progress',
    titleEn: 'Progress Report',
    titleGu: 'પ્રગતિ રિપોર્ટ',
    titleHi: 'प्रगति रिपोर्ट',
    descEn: 'Subject scores, completion percentage & learning time',
    descGu: 'કુલ શીખેલ પાઠ અને ગુણાંક વિશ્લેષણ',
    descHi: 'विषयवार प्रगति और समय विवरण',
    bgColor: '#EEF2FF',
    route: '/progress',
  },
  {
    id: 'rewards',
    titleEn: 'Rewards & Badges',
    titleGu: 'ઇનામ અને બેજ',
    titleHi: 'इनाम और बैज',
    descEn: 'Stars, golden coins, trophy collection and badges',
    descGu: 'સ્ટાર્સ, ગોલ્ડ કોઈન્સ અને ટ્રોફી કલેક્શન',
    descHi: 'स्टार्स, सिक्के और ट्राफियां',
    bgColor: '#FEFCE8',
    route: '/rewards',
  },
  {
    id: 'settings',
    titleEn: 'Settings',
    titleGu: 'સેટિંગ્સ',
    titleHi: 'सेटिंग्स',
    descEn: 'Audio controls, language switcher and timer',
    descGu: 'ઓડિયો, ભાષા અને સ્ક્રીન ટાઈમ કંટ્રોલ',
    descHi: 'ऑडियो, भाषा और स्क्रीन टाइम',
    bgColor: '#F1F5F9',
    route: '/settings',
  },
  {
    id: 'help',
    titleEn: 'Help & Support',
    titleGu: 'મદદ અને માર્ગદર્શન',
    titleHi: 'सहायता और मार्गदर्शन',
    descEn: 'User guide, learning tips and parent support',
    descGu: 'વાલીઓ અને બાળકો માટે માર્ગદર્શિકા',
    descHi: 'उपयोगकर्ता गाइड और सहायता',
    bgColor: '#ECFDF5',
    route: '/help',
  },
  {
    id: 'about',
    titleEn: 'About the App',
    titleGu: 'એપ વિશે',
    titleHi: 'ऐप के बारे में',
    descEn: 'KidsZone curriculum version and safety standards',
    descGu: 'સલામત બાળ શિક્ષણ અને વર્ઝન વિગતો',
    descHi: 'सुरक्षित बाल शिक्षा विवरण',
    bgColor: '#F8FAFC',
    route: '/about',
  },
];

export default function MenuScreen() {
  const router = useRouter();
  const { language } = useApp();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="menuBgGrad" />
      <Header
        title={language === 'gu' ? 'મેનુ' : language === 'hi' ? 'मेन्यू' : 'Menu'}
        showBack={true}
        backHref="/home"
      />

      <ScrollView
        contentContainerStyle={[styles.container, isMobile && styles.containerMobile]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionHeader}>
          {language === 'gu' ? 'મુખ્ય સુવિધાઓ' : language === 'hi' ? 'मुख्य सुविधाएं' : 'All Sections & Learning Tools'}
        </Text>

        <View style={styles.menuList}>
          {MENU_ITEMS.map((item) => {
            const title =
              language === 'gu'
                ? item.titleGu
                : language === 'hi'
                ? item.titleHi
                : item.titleEn;

            const desc =
              language === 'gu'
                ? item.descGu
                : language === 'hi'
                ? item.descHi
                : item.descEn;

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuRow, shadows.soft]}
                onPress={() => {
                  soundEffects.playBubblePop();
                  router.push(item.route as any);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.iconCircle}>
                  <ClayBadgeToken art={MENU_ART[item.id].art} tone={MENU_ART[item.id].tone} size={46} />
                </View>

                <View style={styles.textCol}>
                  <Text style={styles.itemTitle}>{title}</Text>
                  <Text style={styles.itemDesc} numberOfLines={1}>
                    {desc}
                  </Text>
                </View>

                <View style={styles.chevronWrap}>
                  <Glyph name="next" size={15} color="#64748B" strokeWidth={3} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomNav activeTab="home" />
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
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  containerMobile: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuList: {
    gap: 10,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textCol: {
    flex: 1,
    paddingRight: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 12.5,
    color: '#64748B',
  },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
