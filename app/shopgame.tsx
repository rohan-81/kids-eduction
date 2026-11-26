import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { colors } from '../src/theme/colors';
import { spacing, radii, shadows } from '../src/theme/spacing';
import { Header } from '../src/components/Header';
import { useApp } from '../src/context/AppContext';
import { soundEffects } from '../src/services/soundEffects';
import { audioService } from '../src/services/audioService';
import { formatNumberDigits, toHiDigits, toGujDigits } from '../src/utils/languageData';
import { getTryAgainSpeech } from '../src/utils/feedbackSpeech';
import { GoldCoinIcon, GoldCoinStack, CoinLabel } from '../src/components/common/GoldCoinIcon';
import { Glyph } from '../src/components/fun/KidIcons';
import { AppGlobalBackground } from '../src/components/common/AppGlobalBackground';
import { Remote3DImage } from '../src/components/common/Remote3DImage';
import { characterAsset } from '../src/utils/remoteAssets';
import * as Art from '../src/components/art3d/Art3D';

interface ShopItem {
  id: string;
  nameGu: string;
  nameHi: string;
  nameEn: string;
  icon: string;
  renderKey: string;
  price: number;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'item-apple', nameGu: 'સફરજન', nameHi: 'सेब', nameEn: 'Apple', icon: '🍎', renderKey: '3d_fr_apple', price: 2 },
  { id: 'item-banana', nameGu: 'કેળું', nameHi: 'केला', nameEn: 'Banana', icon: '🍌', renderKey: '3d_fr_banana', price: 3 },
  { id: 'item-milk', nameGu: 'દૂધ', nameHi: 'दूध', nameEn: 'Milk', icon: '🥛', renderKey: '3d_milk_glass', price: 5 },
  { id: 'item-choco', nameGu: 'ચોકલેટ', nameHi: 'चॉकलेट', nameEn: 'Chocolate', icon: '🍫', renderKey: '3d_chocolate', price: 4 },
  { id: 'item-pencil', nameGu: 'પેન્સિલ', nameHi: 'पेंसिल', nameEn: 'Pencil', icon: '✏️', renderKey: '3d_pencil', price: 1 },
  { id: 'item-toy', nameGu: 'રમકડું', nameHi: 'खिलौना', nameEn: 'Toy', icon: '🧸', renderKey: '3d_teddy_toy', price: 10 },
  { id: 'item-bread', nameGu: 'બ્રેડ', nameHi: 'ब्रेड', nameEn: 'Bread', icon: '🍞', renderKey: '3d_bread', price: 6 },
  { id: 'item-biscuit', nameGu: 'બિસ્કીટ', nameHi: 'बिस्कुट', nameEn: 'Biscuit', icon: '🍪', renderKey: '3d_biscuit', price: 5 },
];

const COINS = [1, 2, 5, 10];

const SHOP_UI = {
  en: {
    header: 'Shopping Game',
    bannerTitle: 'Kids Grocery & Toy Market',
    bannerSubtitle: 'Pick items and pay the exact amount using coins!',
    shelvesTitle: 'Store Items:',
    addBtn: '+ Add',
    cartTitle: 'Your Shopping Cart',
    itemsCount: (n: number) => `${n} items`,
    emptyCart: 'Cart is empty. Tap items above to add!',
    totalBill: 'Total Amount:',
    tapCoins: 'Count Coins (Tap to Pay):',
    paidLabel: 'Amount Paid: ',
    recount: 'Recount',
    checkout: 'Pay Bill (Checkout)',
    successTitle: 'Exact Payment Received!',
    successDesc: (amt: number) => `You bought items worth ₹${amt} successfully!`,
    bonusText: '+10 Coins Reward!',
    newShopping: 'Shop Again',
    speechAdd: (name: string, price: number) => `${name}, price ${price} rupees`,
    speechEmpty: 'Please add items to your cart first!',
    speechExact: (amt: number) => `Awesome! Exact ${amt} rupees paid!`,
    speechShort: (amt: number) => `Still need ${amt} rupees more!`,
    speechOver: (amt: number) => `You paid extra! Change to return is ${amt} rupees!`,
  },
  gu: {
    header: 'સુપરમાર્કેટ',
    bannerTitle: 'બાળકોનું શાકભાજી અને કિરાણા બજાર',
    bannerSubtitle: 'વસ્તુઓ પસંદ કરો અને સિક્કા ગણીને સાચો હિસાબ ચૂકવો!',
    shelvesTitle: 'દુકાનની વસ્તુઓ:',
    addBtn: '+ ઉમેરો',
    cartTitle: 'તમારી શોપિંગ ટોપલી',
    itemsCount: (n: number) => `${toGujDigits(n)} વસ્તુઓ`,
    emptyCart: 'ટોપલી ખાલી છે. ઉપરથી વસ્તુઓ ઉમેરો!',
    totalBill: 'કુલ બિલ:',
    tapCoins: 'સિક્કા ગણો:',
    paidLabel: 'તમે આપેલા પૈસા: ',
    recount: 'ફરીથી ગણો',
    checkout: 'પૈસા ચૂકવો',
    successTitle: 'હિસાબ સાચો પડ્યો!',
    successDesc: (amt: number) => `તમે કુલ ₹${toGujDigits(amt)} ની ખરીદી સફળતાપૂર્વક કરી!`,
    bonusText: '+૧૦ સિક્કા બોનસ મળ્યા!',
    newShopping: 'નવી ખરીદી કરો',
    speechAdd: (name: string, price: number) => `${name}, કિંમત ${toGujDigits(price)} રૂપિયા`,
    speechEmpty: 'પહેલાં ટોપલીમાં વસ્તુઓ ઉમેરો!',
    speechExact: (amt: number) => `ખૂબ સરસ! પૂરા ₹${toGujDigits(amt)} નો સાચો હિસાબ થયો!`,
    speechShort: (amt: number) => `હજુ ₹${toGujDigits(amt)} રૂપિયા ખૂટે છે!`,
    speechOver: (amt: number) => `તમે વધારે પૈસા આપ્યા! પાછા લેવાના ₹${toGujDigits(amt)} રૂપિયા!`,
  },
  hi: {
    header: 'सुपरमार्केट',
    bannerTitle: 'बच्चों का किराना और खिलौना बाज़ार',
    bannerSubtitle: 'सामान चुनें और सिक्के गिनकर सही हिसाब चुकाएं!',
    shelvesTitle: 'दुकान का सामान:',
    addBtn: '+ जोड़ें',
    cartTitle: 'आपकी शॉपिंग कार्ट',
    itemsCount: (n: number) => `${formatNumberDigits(n, 'hi')} चीजें`,
    emptyCart: 'कार्ट खाली है। ऊपर से सामान जोड़ें!',
    totalBill: 'कुल बिल:',
    tapCoins: 'सिक्के गिनें:',
    paidLabel: 'दिए गए पैसे: ',
    recount: 'फिर से गिनें',
    checkout: 'भुगतान करें',
    successTitle: 'बिल्कुल सही हिसाब!',
    successDesc: (amt: number) => `आपने कुल ₹${formatNumberDigits(amt, 'hi')} की खरीदारी सफलतापूर्वक की!`,
    bonusText: '+१० सिक्के इनाम मिला!',
    newShopping: 'नई खरीदारी करें',
    speechAdd: (name: string, price: number) => `${name}, कीमत ${formatNumberDigits(price, 'hi')} रुपये`,
    speechEmpty: 'पहले कार्ट में सामान जोड़ें!',
    speechExact: (amt: number) => `बहुत बढ़िया! पूरे ₹${formatNumberDigits(amt, 'hi')} का सही भुगतान हुआ!`,
    speechShort: (amt: number) => `अभी ₹${formatNumberDigits(amt, 'hi')} रुपये और चाहिए!`,
    speechOver: (amt: number) => `आपने ज्यादा पैसे दिए! वापस मिलने वाले ₹${formatNumberDigits(amt, 'hi')} रुपये!`,
  },
};

export default function ShopGameScreen() {
  const { speak, addCoins, progress, language } = useApp();

  const activeLang = language || 'en';
  const tUI = SHOP_UI[activeLang as keyof typeof SHOP_UI] || SHOP_UI.en;

  const [cart, setCart] = useState<ShopItem[]>([]);
  const [paidCoins, setPaidCoins] = useState<number[]>([]);
  const [successModal, setSuccessModal] = useState(false);
  const [isCheckoutCompleted, setIsCheckoutCompleted] = useState(false);

  useEffect(() => {
    return () => {
      audioService.stop();
      soundEffects.stopAnimalSound();
    };
  }, []);

  // Silence all audio immediately when this screen loses focus or user navigates to another page
  useFocusEffect(
    useCallback(() => {
      return () => {
        audioService.stop();
        soundEffects.stopAnimalSound();
      };
    }, [])
  );

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const paidTotal = paidCoins.reduce((sum, c) => sum + c, 0);

  const getItemName = (item: ShopItem) => {
    if (activeLang === 'en') return item.nameEn;
    if (activeLang === 'hi') return item.nameHi;
    return item.nameGu;
  };

  const formatPrice = (p: number) => {
    return formatNumberDigits(p, activeLang as any);
  };

  const addToCart = (item: ShopItem) => {
    soundEffects.playBubblePop();
    setCart((prev) => [...prev, item]);
    speak(tUI.speechAdd(getItemName(item), item.price), activeLang);
  };

  const removeFromCart = (index: number) => {
    soundEffects.playBubblePop();
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const addCoin = (val: number) => {
    soundEffects.playBubblePop();
    setPaidCoins((prev) => [...prev, val]);
  };

  const clearPaidCoins = () => {
    soundEffects.playBubblePop();
    setPaidCoins([]);
  };

  const handlePay = () => {
    if (cartTotal === 0) {
      speak(tUI.speechEmpty, activeLang);
      return;
    }

    if (paidTotal === cartTotal) {
      if (isCheckoutCompleted) return;
      setIsCheckoutCompleted(true);
      soundEffects.playTadaaa();
      setSuccessModal(true);
      speak(tUI.speechExact(paidTotal), activeLang);
      addCoins(10);
    } else if (paidTotal < cartTotal) {
      soundEffects.playBuzzer();
      speak(getTryAgainSpeech(activeLang), activeLang);
    } else {
      soundEffects.playBuzzer();
      speak(getTryAgainSpeech(activeLang), activeLang);
    }
  };

  const handleResetOrder = () => {
    setCart([]);
    setPaidCoins([]);
    setIsCheckoutCompleted(false);
    setSuccessModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppGlobalBackground id="shopgameBgGrad" />
      <Header title={tUI.header} showBack={true} backHref="/games" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
        {/* Banner with Mission */}
        <View style={[styles.missionBanner, shadows.soft]}>
          <Art.HouseArt size={42} />
          <View style={styles.missionTextCol}>
            <Text style={styles.missionTitle}>{tUI.bannerTitle}</Text>
            <Text style={styles.missionSubtitle}>{tUI.bannerSubtitle}</Text>
          </View>
        </View>

        {/* Store Shelves */}
        <Text style={styles.sectionHeading}>{tUI.shelvesTitle}</Text>
        <View style={styles.shelfGrid}>
          {SHOP_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemCard, shadows.card]}
              onPress={() => addToCart(item)}
              activeOpacity={0.8}
            >
              <Remote3DImage
                source={characterAsset(item.renderKey)}
                style={styles.item3DImage}
                fallback={<Text style={styles.itemEmoji}>{item.icon}</Text>}
              />
              <Text style={styles.itemName}>{getItemName(item)}</Text>
              <Text style={styles.itemPriceBadge}>₹{formatPrice(item.price)}</Text>
              <View style={styles.addBtn}>
                <Text style={styles.addBtnText}>{tUI.addBtn}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Shopping Cart & Billing Counter */}
        <View style={[styles.checkoutCard, shadows.card]}>
          <View style={styles.checkoutHeader}>
            <Text style={styles.checkoutTitle}>{tUI.cartTitle}</Text>
            <Text style={styles.cartCountText}>{tUI.itemsCount(cart.length)}</Text>
          </View>

          {cart.length === 0 ? (
            <Text style={styles.emptyCartText}>{tUI.emptyCart}</Text>
          ) : (
            <View style={styles.cartItemsList}>
              {cart.map((cItem, idx) => (
                <View key={`cart-${idx}`} style={styles.cartItemRow}>
                  <View style={styles.cartItem3DWrap}>
                    <Remote3DImage
                      source={characterAsset(cItem.renderKey)}
                      style={styles.cartItem3DImage}
                      fallback={<Text style={styles.cartItemIcon}>{cItem.icon}</Text>}
                    />
                  </View>
                  <Text style={styles.cartItemName}>{getItemName(cItem)}</Text>
                  <Text style={styles.cartItemPrice}>₹{formatPrice(cItem.price)}</Text>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeFromCart(idx)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityRole="button"
                    accessibilityLabel="Remove item"
                  >
                    <Glyph name="close" size={13} color={'#E74C3C'} strokeWidth={3} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Bill Calculation */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{tUI.totalBill}</Text>
            <Text style={styles.totalValue}>₹{formatPrice(cartTotal)}</Text>
          </View>

          {/* Cash Drawer / Coins to Pay */}
          <View style={styles.cashDrawer}>
            <Text style={styles.drawerTitle}>{tUI.tapCoins}</Text>
            <View style={styles.coinsRow}>
              {COINS.map((cVal) => (
                <TouchableOpacity
                  key={`coin-${cVal}`}
                  style={[styles.coinButton, shadows.soft]}
                  onPress={() => addCoin(cVal)}
                  activeOpacity={0.8}
                >
                  <GoldCoinIcon size={26} />
                  <Text style={styles.coinText}>₹{formatPrice(cVal)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Currently paid amount */}
            <View style={styles.paidStatusRow}>
              <Text style={styles.paidLabel}>
                {tUI.paidLabel}<Text style={styles.paidAmount}>₹{formatPrice(paidTotal)}</Text>
              </Text>
              {paidCoins.length > 0 && (
                <TouchableOpacity onPress={clearPaidCoins} style={styles.clearCoinsBtn}>
                  <Text style={styles.clearCoinsText}>{tUI.recount}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Pay Button */}
          <TouchableOpacity
            style={[styles.payButton, cartTotal === 0 && styles.payButtonDisabled]}
            onPress={handlePay}
            activeOpacity={0.8}
          >
            <CoinLabel align="center" size={22} textStyle={styles.payButtonText}>{tUI.checkout}</CoinLabel>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={successModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.successBox, shadows.card]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
              <Art.ShopCartArt size={52} />
              <GoldCoinStack size={34} />
            </View>
            <Text style={styles.successTitle}>{tUI.successTitle}</Text>
            <Text style={styles.successDesc}>
              {tUI.successDesc(cartTotal)}
            </Text>
            <CoinLabel align="center" size={20} textStyle={styles.rewardText}>{tUI.bonusText}</CoinLabel>

            <TouchableOpacity style={styles.nextShoppingBtn} onPress={handleResetOrder}>
              <Text style={styles.nextShoppingText}>{tUI.newShopping}</Text>
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
  missionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F5',
    borderRadius: radii.card,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1.5,
    borderColor: '#A3E4D7',
    gap: spacing.md,
  },
  missionEmoji: {
    fontSize: 36,
  },
  missionTextCol: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#117864',
  },
  missionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  shelfGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  itemCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8E8E4',
  },
  item3DImage: {
    width: 68,
    height: 68,
    marginBottom: spacing.xs,
  },
  itemEmoji: {
    fontSize: 42,
    marginBottom: spacing.xs,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  itemPriceBadge: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E67E22',
    marginVertical: 4,
  },
  addBtn: {
    backgroundColor: '#F2F4F4',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    marginTop: 4,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  checkoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card + 4,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: '#EAEDED',
  },
  checkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F2F4F4',
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
  },
  checkoutTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  cartCountText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emptyCartText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  cartItemsList: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9F9',
  },
  cartItem3DWrap: {
    width: 32,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  cartItem3DImage: {
    width: 28,
    height: 28,
  },
  cartItemIcon: {
    fontSize: 22,
    width: 32,
  },
  cartItemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cartItemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#E67E22',
    marginRight: spacing.md,
  },
  removeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FADBD8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: '#E74C3C',
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF9E7',
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7D6608',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#B7950B',
  },
  cashDrawer: {
    backgroundColor: '#F8F9F9',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  drawerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  coinsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  coinButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F39C12',
    borderRadius: radii.full,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  coinSymbol: {
    fontSize: 18,
  },
  coinText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#7D6608',
  },
  paidStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paidLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  paidAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#27AE60',
  },
  clearCoinsBtn: {
    padding: spacing.xs,
  },
  clearCoinsText: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '700',
  },
  payButton: {
    backgroundColor: '#10B981',
    borderRadius: radii.card,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  successBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card + 6,
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: 360,
    width: '100%',
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#27AE60',
    marginBottom: spacing.xs,
  },
  successDesc: {
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F39C12',
    marginBottom: spacing.xl,
  },
  nextShoppingBtn: {
    backgroundColor: '#2C3E50',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.full,
  },
  nextShoppingText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
