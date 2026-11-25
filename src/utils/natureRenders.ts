// Real 1024x1024 transparent 3D Pixar renders for Plants & Nature category.
// Matches the exact 3D Pixar toy style of the characters (3d_lion.png).
// Renders are served remotely (Django /media/characters/<key>.webp) and disk-cached by expo-image;
// see src/utils/remoteAssets.ts. Bundled copies were removed to keep the app small.
import { characterAsset, RemoteImageSource } from './remoteAssets';


export const NATURE_RENDERS_BY_LESSON: Record<string, RemoteImageSource> = {
  'plant-rose': characterAsset('3d_rose'),
  'plant-sunflower': characterAsset('3d_sunflower'),
  'plant-lotus': characterAsset('3d_lotus'),
  'plant-marigold': characterAsset('3d_marigold'),
  'plant-banyan': characterAsset('3d_banyan_tree'),
  'plant-neem': characterAsset('3d_neem_tree'),
  'plant-mango-tree': characterAsset('3d_mango_tree'),
  'plant-leaf': characterAsset('3d_green_leaf'),
  'plant-root': characterAsset('3d_roots'),
  'plant-seed': characterAsset('3d_tiny_seed'),
};

export const NATURE_RENDERS_BY_EMOJI: Record<string, RemoteImageSource> = {
  '🌹': characterAsset('3d_rose'),
  '🌻': characterAsset('3d_sunflower'),
  '🌸': characterAsset('3d_lotus'),
  '🌼': characterAsset('3d_marigold'),
  '🌳': characterAsset('3d_banyan_tree'),
  '🌿': characterAsset('3d_neem_tree'),
  '🍃': characterAsset('3d_green_leaf'),
  '🌱': characterAsset('3d_roots'),
  '🌾': characterAsset('3d_tiny_seed'),
};
