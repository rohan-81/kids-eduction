import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';
import { spacing, radii, shadows } from '../src/theme/spacing';
import { Header } from '../src/components/Header';
import { useApp } from '../src/context/AppContext';
import { soundEffects } from '../src/services/soundEffects';
import { audioService } from '../src/services/audioService';
import { GardenPlant } from '../src/types';
import { GoldCoinIcon } from '../src/components/common/GoldCoinIcon';
import * as Art from '../src/components/art3d/Art3D';
import { ClayBadgeToken } from '../src/components/SubjectBadgeIcons';
import { SUBJECT_CARD_ART } from '../src/utils/imageHelper';
import { Glyph } from '../src/components/fun';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';
import { formatNumberDigits } from '../src/utils/languageData';
import type { TimerHandle } from '../src/utils/runtime';

type ArtIcon = React.FC<{ size?: number }>;
/** Saved plants keep their emoji id (backend data); the UI renders crisp 3D art for it. */
const PLANT_ART: Record<string, ArtIcon> = {
  '🌹': Art.RoseArt,
  '🌻': Art.SunflowerArt,
  '🥭': Art.MangoArt,
  '🍓': Art.StrawberryArt,
  '🌸': Art.LotusArt,
  '\u{1FAB7}': Art.LotusArt,
};
const plantArt = (icon?: string): ArtIcon => (icon && PLANT_ART[icon]) || Art.FlowerArt;

const SEED_TYPES: Array<{ nameGu: string; nameHi: string; nameEn: string; finalIcon: string }> = [
  { nameGu: 'ગુલાબ', nameHi: 'गुलाब', nameEn: 'Rose', finalIcon: '🌹' },
  { nameGu: 'સૂર્યમુખી', nameHi: 'सूरजमुखी', nameEn: 'Sunflower', finalIcon: '🌻' },
  { nameGu: 'કેરીનું ઝાડ', nameHi: 'आम का पेड़', nameEn: 'Mango Tree', finalIcon: '🥭' },
  { nameGu: 'સ્ટ્રોબેરી', nameHi: 'स्ट्रॉबेरी', nameEn: 'Strawberry', finalIcon: '🍓' },
  { nameGu: 'કમળ', nameHi: 'कमल', nameEn: 'Lotus', finalIcon: '🌸' },
];

const PLANT_NAME_HI: Record<string, string> = {
  Rose: 'गुलाब',
  Sunflower: 'सूरजमुखी',
  'Mango Tree': 'आम का पेड़',
  Strawberry: 'स्ट्रॉबेरी',
  Lotus: 'कमल',
  'ગુલાબ': 'गुलाब',
  'સૂર્યમુખી': 'सूरजमुखी',
  'કેરીનું ઝાડ': 'आम का पेड़',
  'સ્ટ્રોબેરી': 'स्ट्रॉबेरी',
  'કમળ': 'कमल',
};

const getPlantName = (plant: GardenPlant, lang: string) => {
  if (lang === 'en') return plant.nameEn || plant.nameGu;
  if (lang === 'hi') return plant.nameHi || PLANT_NAME_HI[plant.nameEn] || PLANT_NAME_HI[plant.nameGu] || plant.nameGu;
  return plant.nameGu;
};

export default function VirtualGardenScreen() {
  const { progress, updateProgress, addCoins, speak, language } = useApp();
  const activeLang = language || 'en';

  const plants = progress.gardenPlants || [];
  const waterCount = progress.water || 0;
  const seedCount = progress.seeds || 0;

  const [harvestModal, setHarvestModal] = useState<string | null>(null);
  const isActionInProgressRef = useRef(false);
  const gardenTimerRef = useRef<TimerHandle | null>(null);

  useEffect(() => {
    return () => {
      if (gardenTimerRef.current) clearTimeout(gardenTimerRef.current);
      audioService.stop();
    };
  }, []);

  const getStageDisplay = (plant: GardenPlant) => {
    switch (plant.stage) {
      case 0:
        return {
          icon: Art.SeedArt as ArtIcon,
          artSize: 52,
          label: activeLang === 'en' ? 'Seed' : activeLang === 'hi' ? 'बीज' : 'બીજ',
          desc: activeLang === 'en' ? 'Add water so it sprouts' : activeLang === 'hi' ? 'पानी दें ताकि अंकुर फूटे' : 'પાણી આપો જેથી અંકુર ફૂટે',
        };
      case 1:
        return {
          icon: Art.SproutArt as ArtIcon,
          artSize: 44,
          label: activeLang === 'en' ? 'Little Sprout' : activeLang === 'hi' ? 'छोटा अंकुर' : 'નાનો અંકુર',
          desc: activeLang === 'en' ? 'Give a little more water' : activeLang === 'hi' ? 'थोड़ा और पानी दें' : 'હજુ થોડું પાણી આપો',
        };
      case 2:
        return {
          icon: Art.SproutArt as ArtIcon,
          artSize: 60,
          label: activeLang === 'en' ? 'Growing Plant' : activeLang === 'hi' ? 'हरा-भरा पौधा' : 'લીલોછમ છોડ',
          desc: activeLang === 'en' ? 'Flowers will bloom soon!' : activeLang === 'hi' ? 'जल्द ही फूल खिलेंगे!' : 'જલ્દી ફૂલ ખીલશે!',
        };
      case 3:
      default:
        return {
          icon: plantArt(plant.icon),
          artSize: 64,
          label: activeLang === 'en' ? 'Fully Bloomed!' : activeLang === 'hi' ? 'खिला हुआ फूल/फल!' : 'ખીલેલું ફૂલ/ફળ!',
          desc: activeLang === 'en' ? 'Grown to full maturity!' : activeLang === 'hi' ? 'पौधा पूरी तरह बड़ा हो गया!' : 'સંપૂર્ણ મોટો થઈ ગયો!',
        };
    }
  };

  const handleWater = async (plantId: string) => {
    if (isActionInProgressRef.current) return;
    if (waterCount <= 0) {
      speak(
        activeLang === 'en'
          ? 'Out of water! Complete more lessons to earn water drops!'
          : activeLang === 'hi'
          ? 'पानी खत्म हो गया है! नए पाठ सीखकर पानी प्राप्त करें!'
          : 'પાણી ખલાસ થઈ ગયું છે! નવા લેસન ભણીને પાણી મેળવો!',
        activeLang
      );
      return;
    }

    isActionInProgressRef.current = true;
    try {
      soundEffects.playBubblePop();
      let maturedPlant: GardenPlant | null = null;
      const updatedPlants = plants.map((p) => {
        if (p.id === plantId) {
          const nextStage = Math.min(p.maxStage, p.stage + 1);
          if (nextStage === p.maxStage && p.stage < p.maxStage) {
            maturedPlant = p;
          }
          return { ...p, stage: nextStage };
        }
        return p;
      });

      if (maturedPlant) {
        const mp: GardenPlant = maturedPlant;
        const plantName =
          activeLang === 'en'
            ? mp.nameEn
            : activeLang === 'hi'
            ? (mp.nameHi || mp.nameGu)
            : mp.nameGu;

        if (gardenTimerRef.current) clearTimeout(gardenTimerRef.current);
        gardenTimerRef.current = setTimeout(() => {
          soundEffects.playTadaaa();
          setHarvestModal(
            activeLang === 'en'
              ? `${plantName} has fully bloomed!`
              : activeLang === 'hi'
              ? `${plantName} पूरी तरह खिल गया!`
              : `${plantName} પૂર્ણ ખીલી ગયું!`
          );
          speak(
            activeLang === 'en'
              ? `Hooray! ${plantName} has fully bloomed! You earned 25 bonus coins!`
              : activeLang === 'hi'
              ? `शाबाश! ${plantName} पूरी तरह खिल गया! आपको २५ बोनस सिक्के मिले!`
              : `${plantName} સંપૂર્ણ ખીલી ગયું! તમને ૨૫ સિક્કા બોનસ મળ્યા!`,
            activeLang
          );
          addCoins(25);
        }, 300);
      }

      await updateProgress({
        water: waterCount - 1,
        gardenPlants: updatedPlants,
      });
    } finally {
      isActionInProgressRef.current = false;
    }
  };

  const handlePlantNewSeed = async (seedType: typeof SEED_TYPES[0]) => {
    if (isActionInProgressRef.current) return;
    if (seedCount <= 0) {
      speak(
        activeLang === 'en'
          ? 'Out of seeds! Play games to earn new seeds!'
          : activeLang === 'hi'
          ? 'बीज समाप्त हो गए हैं! नए खेल खेलकर बीज कमाएं!'
          : 'બીજ ખૂટી ગયા છે! નવી રમતો રમીને બીજ કમાઓ!',
        activeLang
      );
      return;
    }

    isActionInProgressRef.current = true;
    try {
      soundEffects.playBubblePop();
      const newPlant: GardenPlant = {
        id: `plant-${Date.now()}`,
        nameGu: seedType.nameGu,
        nameHi: seedType.nameHi,
        nameEn: seedType.nameEn,
        icon: seedType.finalIcon,
        stage: 0,
        maxStage: 3,
      };

      await updateProgress({
        seeds: seedCount - 1,
        gardenPlants: [...plants, newPlant],
      });
      const sName =
        activeLang === 'en'
          ? seedType.nameEn
          : activeLang === 'hi'
          ? seedType.nameHi
          : seedType.nameGu;
      speak(
        activeLang === 'en'
          ? `Planted a new ${sName} seed! Now give it some water!`
          : activeLang === 'hi'
          ? `नया ${sName} का बीज बोया! अब इसे थोड़ा पानी दें!`
          : `નવું ${sName} નું બીજ વાવ્યું! હવે તેને પાણી આપો!`,
        activeLang
      );
    } finally {
      isActionInProgressRef.current = false;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="gardenBgGrad" />
      <Header
        title={
          activeLang === 'en'
            ? 'Magic Garden'
            : activeLang === 'hi'
            ? 'जादुई बगीचा'
            : 'જાદુઈ બગીચો'
        }
        showBack={true}
        backHref="/home"
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Garden Inventory Status */}
        <View style={[styles.statusBar, shadows.soft]}>
          <View style={styles.statusCol}>
            <Art.DropArt size={30} />
            <Text style={styles.statusVal}>
              {activeLang === 'en' ? `${waterCount} Drops` : activeLang === 'hi' ? `${waterCount} बूंदें` : `${waterCount} ટીપાં`}
            </Text>
            <Text style={styles.statusLabel}>{activeLang === 'en' ? 'Water' : activeLang === 'hi' ? 'पानी' : 'પાણી'}</Text>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusCol}>
            <Art.SproutArt size={30} />
            <Text style={styles.statusVal}>
              {activeLang === 'en' ? `${seedCount} Seeds` : activeLang === 'hi' ? `${seedCount} बीज` : `${seedCount} બીજ`}
            </Text>
            <Text style={styles.statusLabel}>{activeLang === 'en' ? 'Seeds' : activeLang === 'hi' ? 'बीज' : 'બીજ'}</Text>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusCol}>
            <GoldCoinIcon size={28} />
            <Text style={styles.statusVal}>{progress.coins || 0}</Text>
            <Text style={styles.statusLabel}>{activeLang === 'en' ? 'Coins' : activeLang === 'hi' ? 'सिक्के' : 'સિક્કા'}</Text>
          </View>
        </View>

        {/* Tip banner */}
        <View style={[styles.tipCard, styles.rowCenter]}>
          <ClayBadgeToken art={SUBJECT_CARD_ART.logic} tone="gold" size={34} />
          <Text style={[styles.tipText, { flex: 1 }]}>
            {activeLang === 'en'
              ? 'Tip: The more lessons and games you complete, the more water and seeds you earn for your garden!'
              : activeLang === 'hi'
              ? 'सलाह: आप जितने अधिक पाठ और खेल पूरे करेंगे, आपके बगीचे के लिए उतना ही अधिक पानी और बीज मिलेंगे!'
              : 'ટીપ: તમે જેટલા વધુ પાઠ અને રમતો રમશો, તેટલું વધારે પાણી અને બીજ બગીચા માટે મળશે!'}
          </Text>
        </View>

        {/* Plants Plots Grid */}
        <Text style={styles.sectionTitle}>
          {activeLang === 'en' ? 'Garden Pots:' : activeLang === 'hi' ? 'बगीचे के गमले:' : 'બગીચાના કૂંડાઓ:'}
        </Text>
        <View style={styles.plantsGrid}>
          {plants.map((plant) => {
            const display = getStageDisplay(plant);
            const isFull = plant.stage >= plant.maxStage;

            return (
              <View key={plant.id} style={[styles.plantCard, shadows.card]}>
                <View style={styles.potVisual}>
                  <View style={styles.plantEmoji}>{React.createElement(display.icon, { size: display.artSize })}</View>
                  <View style={styles.potGraphic}>
                    <View style={styles.potRim} />
                    <View style={styles.potBody} />
                  </View>
                </View>

                <Text style={styles.plantName}>
                  {getPlantName(plant, activeLang)}
                </Text>
                <Text style={styles.plantStageTag}>{display.label}</Text>
                <Text style={styles.plantDesc}>{display.desc}</Text>

                <TouchableOpacity
                  style={[
                    styles.waterBtn,
                    (waterCount <= 0 || isFull) && styles.waterBtnDisabled,
                  ]}
                  onPress={() => handleWater(plant.id)}
                  disabled={waterCount <= 0 || isFull}
                  activeOpacity={0.8}
                >
                  <View style={styles.rowCenter}>
                    <Glyph name={isFull ? 'sparkle' : 'drop'} size={14} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.waterBtnText}>
                      {isFull
                        ? (activeLang === 'en' ? 'Fully Grown!' : activeLang === 'hi' ? 'पूरी तरह बड़ा हो गया!' : 'સંપૂર્ણ મોટો થયો!')
                        : (activeLang === 'en' ? 'Water Plant (-1)' : activeLang === 'hi' ? 'पानी दें (-१)' : 'પાણી પીવડાવો (-૧)')}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Seed Planting Shop */}
        <View style={[styles.seedSection, shadows.soft]}>
          <View style={styles.rowCenter}>
            <Art.SproutArt size={28} />
            <Text style={[styles.seedSectionTitle, { flexShrink: 1 }]}>
              {activeLang === 'en' ? 'Plant a New Seed:' : activeLang === 'hi' ? 'नया बीज बोएं:' : 'નવું બીજ વાવો:'}
            </Text>
          </View>
          <Text style={styles.seedSectionDesc}>
            {activeLang === 'en'
              ? 'Choose a flower or tree seed to plant in a pot:'
              : activeLang === 'hi'
              ? 'गमले में बोने के लिए कोई भी फूल या पेड़ का बीज चुनें:'
              : 'નીચેનામાંથી કોઈપણ ફૂલ કે ઝાડનું બીજ કૂંડામાં વાવો:'}
          </Text>

          <View style={styles.seedChoicesRow}>
            {SEED_TYPES.map((st, sIdx) => (
              <TouchableOpacity
                key={`seed-type-${sIdx}`}
                style={[styles.seedChoiceBtn, seedCount <= 0 && { opacity: 0.5 }]}
                onPress={() => handlePlantNewSeed(st)}
                disabled={seedCount <= 0}
                activeOpacity={0.8}
              >
                <View style={styles.seedChoiceIcon}>{React.createElement(plantArt(st.finalIcon), { size: 40 })}</View>
                <Text style={styles.seedChoiceName}>
                  {activeLang === 'en' ? st.nameEn : activeLang === 'hi' ? st.nameHi : st.nameGu}
                </Text>
                <View style={styles.rowCenter}>
                  <Text style={styles.seedCost}>-{formatNumberDigits(1, activeLang)}</Text>
                  <Glyph name="sprout" size={12} color="#15803D" strokeWidth={2} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Harvest celebration modal */}
      <Modal visible={!!harvestModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.harvestBox, shadows.card]}>
            <View style={[styles.harvestEmoji, styles.rowCenter]}>
              <Art.FlowerArt size={48} />
              <Art.ButterflyArt size={48} />
              <Art.AppleArt size={48} />
            </View>
            <Text style={styles.harvestTitle}>{harvestModal}</Text>
            <Text style={styles.harvestDesc}>
              {activeLang === 'en'
                ? 'Your plant has fully grown with care and love! +25 coins'
                : activeLang === 'hi'
                ? 'आपकी देखभाल और प्यार से पौधा पूरी तरह खिल गया है! +२५ सिक्के'
                : 'તમારા પ્રેમ અને પાણીથી છોડ સંપૂર્ણ ખીલી ગયો છે! +૨૫ સિક્કા'}
            </Text>
            <TouchableOpacity
              style={styles.harvestCloseBtn}
              onPress={() => setHarvestModal(null)}
            >
              <Text style={styles.harvestCloseText}>
                {activeLang === 'en' ? 'Awesome! Great!' : activeLang === 'hi' ? 'अरे वाह! बहुत खूब!' : 'અરે વાહ! ખુબ સરસ!'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: '#EAEDED',
  },
  statusCol: {
    alignItems: 'center',
  },
  statusVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statusDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#EAEDED',
  },
  tipCard: {
    backgroundColor: '#E8F8F5',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#A3E4D7',
    marginBottom: spacing.xl,
  },
  tipText: {
    fontSize: 13,
    color: '#117864',
    fontWeight: '600',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  plantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  plantCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card + 4,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8E8E4',
  },
  potVisual: {
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  plantEmoji: {
    height: 64,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: -8,
  },
  potGraphic: {
    alignItems: 'center',
    marginTop: 4,
  },
  potRim: {
    width: 44,
    height: 8,
    backgroundColor: '#D97706',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#B45309',
  },
  potBody: {
    width: 36,
    height: 22,
    backgroundColor: '#B45309',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: -1,
    borderWidth: 1,
    borderColor: '#92400E',
  },
  plantName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  plantStageTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#27AE60',
    marginTop: 2,
  },
  plantDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.xs,
  },
  waterBtn: {
    backgroundColor: '#3498DB',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  waterBtnDisabled: {
    backgroundColor: '#BDC3C7',
  },
  waterBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  seedSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: '#EAEDED',
  },
  seedSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  seedSectionDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginVertical: 4,
  },
  seedChoicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  seedChoiceBtn: {
    width: '30%',
    backgroundColor: '#FAF9F6',
    borderWidth: 1.5,
    borderColor: '#D5D8DC',
    borderRadius: radii.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  seedChoiceIcon: {
    alignItems: 'center',
  },
  seedChoiceName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  seedCost: {
    fontSize: 11,
    fontWeight: '800',
    color: '#27AE60',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  harvestBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card + 6,
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: 360,
    width: '100%',
  },
  harvestEmoji: {
    marginBottom: spacing.md,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  harvestTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#27AE60',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  harvestDesc: {
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  harvestCloseBtn: {
    backgroundColor: '#27AE60',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.full,
  },
  harvestCloseText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
