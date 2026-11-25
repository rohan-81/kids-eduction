// AUTO-GENERATED for Nursery Rhymes & Balgeeto
// Renders are served remotely (Django /media/characters/<key>.webp) and disk-cached by expo-image;
// see src/utils/remoteAssets.ts. Bundled copies were removed to keep the app small.
import { characterAsset, RemoteImageSource } from './remoteAssets';

export const RHYME_3D_ASSETS: Record<string, RemoteImageSource> = {
  'twinkle': characterAsset('3d_twinkling_star'),
  'johny': characterAsset('3d_johny'),
  'black-sheep': characterAsset('3d_sheep'),
  'humpty': characterAsset('3d_humpty'),
  'jack-jill': characterAsset('3d_person'),
  'rain-rain': characterAsset('3d_rain_shower'),
  'row-boat': characterAsset('3d_boat'),
  'old-macdonald': characterAsset('3d_cow'),
  'chakiben': characterAsset('3d_sparrow'),
  'dhingli': characterAsset('3d_dhingli'),
  'ekdo-salekhdo': characterAsset('3d_number_one'),
  'aav-re-varsad': characterAsset('3d_rainy'),
  'mamanu-ghar': characterAsset('3d_house'),
  'machli': characterAsset('3d_fish'),
  'mota-hathi': characterAsset('3d_elephant'),
  'upar-pankha': characterAsset('3d_sleep'),
  'bandar-mama': characterAsset('3d_monkey'),
  'aalu-kachalu': characterAsset('3d_potato'),
};

export function getRhyme3DVisual(rhymeId: string): RemoteImageSource | null {
  return RHYME_3D_ASSETS[rhymeId] || null;
}
