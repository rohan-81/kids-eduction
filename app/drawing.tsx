import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Ellipse } from 'react-native-svg';
import { colors } from '../src/theme/colors';
import { spacing, radii, shadows } from '../src/theme/spacing';
import { Header } from '../src/components/Header';
import { useApp } from '../src/context/AppContext';
import { soundEffects } from '../src/services/soundEffects';
import { audioService } from '../src/services/audioService';
import { useRouter, useFocusEffect } from 'expo-router';
import { pointsToSmoothSvgPath } from '../src/utils/shapeTracingEngine';
import * as Art from '../src/components/art3d/Art3D';
import { Glyph, EraserIcon, UndoIcon, TrashIcon, PencilIcon, TargetIcon } from '../src/components/fun';
import { webDomNode, type WebClientPoint } from '../src/utils/webStyle';

/** Crisp 3D vector art for each tracing shape pill (the `emoji` field is kept as data only). */
const SHAPE_ART: Record<string, React.FC<{ size?: number }>> = {
  star: Art.StarArt,
  sun: Art.SunArt,
  apple: Art.AppleArt,
  balloon: Art.BalloonsArt,
  flower: Art.FlowerArt,
  car: Art.CarArt,
  house: Art.HouseArt,
  butterfly: Art.ButterflyArt,
  fish: Art.FishArt,
  blank: Art.PencilArt,
};

// Simple kid-friendly color palette
const SIMPLE_COLORS = [
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber Yellow
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#1E293B', // Slate Dark
];

interface StrokePath {
  id: string;
  d: string;
  color: string;
  size: number;
}

type TraceShapeId =
  | 'star'
  | 'sun'
  | 'apple'
  | 'balloon'
  | 'flower'
  | 'car'
  | 'house'
  | 'butterfly'
  | 'fish'
  | 'blank';

interface TraceShapeDef {
  id: TraceShapeId;
  emoji: string;
  nameGu: string;
  nameHi: string;
  nameEn: string;
  startHintGu: string;
  startHintHi: string;
  startHintEn: string;
  startPoint: { x: number; y: number };
}

export const TRACE_SHAPES: TraceShapeDef[] = [
  {
    id: 'star',
    emoji: '⭐',
    nameGu: 'તારો',
    nameHi: 'तारा',
    nameEn: 'Star',
    startHintGu: 'ઉપરથી શરૂ કરો',
    startHintHi: 'ऊपर से शुरू करें',
    startHintEn: 'Start at top',
    startPoint: { x: 160, y: 35 },
  },
  {
    id: 'sun',
    emoji: '☀️',
    nameGu: 'સૂર્ય',
    nameHi: 'सूरज',
    nameEn: 'Sun',
    startHintGu: 'ગોળ ફેરો',
    startHintHi: 'गोल घुमाओ',
    startHintEn: 'Circle around',
    startPoint: { x: 160, y: 102 },
  },
  {
    id: 'apple',
    emoji: '🍎',
    nameGu: 'સફરજન',
    nameHi: 'सेब',
    nameEn: 'Apple',
    startHintGu: 'દાળખીથી દોરો',
    startHintHi: 'डंडी से बनाओ',
    startHintEn: 'Start at stem',
    startPoint: { x: 160, y: 95 },
  },
  {
    id: 'balloon',
    emoji: '🎈',
    nameGu: 'ફુગ્ગો',
    nameHi: 'गुब्बारा',
    nameEn: 'Balloon',
    startHintGu: 'ઉપરથી ગોળ',
    startHintHi: 'ऊपर से गोल',
    startHintEn: 'Top to bottom',
    startPoint: { x: 160, y: 35 },
  },
  {
    id: 'flower',
    emoji: '🌸',
    nameGu: 'ફૂલ',
    nameHi: 'फूल',
    nameEn: 'Flower',
    startHintGu: 'પાંખડીઓ જોડો',
    startHintHi: 'पंखुड़ियां जोड़ो',
    startHintEn: 'Trace petals',
    startPoint: { x: 160, y: 56 },
  },
  {
    id: 'car',
    emoji: '🚗',
    nameGu: 'ગાડી',
    nameHi: 'गाड़ी',
    nameEn: 'Car',
    startHintGu: 'છતથી શરૂ કરો',
    startHintHi: 'छत से शुरू करें',
    startHintEn: 'Start at roof',
    startPoint: { x: 120, y: 90 },
  },
  {
    id: 'house',
    emoji: '🏠',
    nameGu: 'ઘર',
    nameHi: 'घर',
    nameEn: 'House',
    startHintGu: 'છાપરાથી દોરો',
    startHintHi: 'छत से बनाओ',
    startHintEn: 'Start at roof',
    startPoint: { x: 160, y: 55 },
  },
  {
    id: 'butterfly',
    emoji: '🦋',
    nameGu: 'પતંગિયું',
    nameHi: 'तितली',
    nameEn: 'Butterfly',
    startHintGu: 'પાંખો દોરો',
    startHintHi: 'पंख बनाओ',
    startHintEn: 'Trace wings',
    startPoint: { x: 160, y: 86 },
  },
  {
    id: 'fish',
    emoji: '🐟',
    nameGu: 'માછલી',
    nameHi: 'मछली',
    nameEn: 'Fish',
    startHintGu: 'મોંથી પૂંછડી',
    startHintHi: 'मुंह से पूंछ',
    startHintEn: 'Mouth to tail',
    startPoint: { x: 45, y: 160 },
  },
  {
    id: 'blank',
    emoji: '✏️',
    nameGu: 'મુક્ત ડ્રોઇંગ',
    nameHi: 'मुक्त ड्राइंग',
    nameEn: 'Free Draw',
    startHintGu: 'મનપસંદ ચિત્ર દોરો!',
    startHintHi: 'मनपसंद चित्र बनाएं!',
    startHintEn: 'Draw freely!',
    startPoint: { x: 0, y: 0 },
  },
];

export interface TargetDot {
  id: number;
  x: number;
  y: number;
}

function cubicBezierPoint(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number
) {
  const oneMinusT = 1 - t;
  const c0 = oneMinusT * oneMinusT * oneMinusT;
  const c1 = 3 * oneMinusT * oneMinusT * t;
  const c2 = 3 * oneMinusT * t * t;
  const c3 = t * t * t;
  return {
    x: c0 * p0.x + c1 * p1.x + c2 * p2.x + c3 * p3.x,
    y: c0 * p0.y + c1 * p1.y + c2 * p2.y + c3 * p3.y,
  };
}

function quadBezierPoint(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  t: number
) {
  const oneMinusT = 1 - t;
  const c0 = oneMinusT * oneMinusT;
  const c1 = 2 * oneMinusT * t;
  const c2 = t * t;
  return {
    x: c0 * p0.x + c1 * p1.x + c2 * p2.x,
    y: c0 * p0.y + c1 * p1.y + c2 * p2.y,
  };
}

/**
 * Generates accurately spaced target dots along each shape's dotted guide outline.
 * Every single dot lies exactly on the parametric SVG equations used in renderDottedGuide.
 */
export function getShapeTargetDots(shapeId: TraceShapeId): TargetDot[] {
  const rawDots: { x: number; y: number }[] = [];

  const addPoint = (x: number, y: number) => {
    rawDots.push({ x: Math.round(x), y: Math.round(y) });
  };

  const sampleLine = (x1: number, y1: number, x2: number, y2: number, steps?: number) => {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const n = Math.max(steps || 1, Math.ceil(dist / 12));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      addPoint(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
    }
  };

  const sampleCircle = (cx: number, cy: number, r: number, steps?: number) => {
    const circum = 2 * Math.PI * r;
    const n = Math.max(steps || 8, Math.ceil(circum / 12));
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
      addPoint(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    }
  };

  const sampleEllipse = (cx: number, cy: number, rx: number, ry: number, steps?: number) => {
    const circum = Math.PI * (rx + ry);
    const n = Math.max(steps || 8, Math.ceil(circum / 12));
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
      addPoint(cx + rx * Math.cos(angle), cy + ry * Math.sin(angle));
    }
  };

  const sampleCubic = (
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    steps?: number
  ) => {
    const approx = Math.hypot(p1.x - p0.x, p1.y - p0.y) + Math.hypot(p2.x - p1.x, p2.y - p1.y) + Math.hypot(p3.x - p2.x, p3.y - p2.y);
    const n = Math.max(steps || 4, Math.ceil(approx / 12));
    for (let i = 0; i <= n; i++) {
      const pt = cubicBezierPoint(p0, p1, p2, p3, i / n);
      addPoint(pt.x, pt.y);
    }
  };

  const sampleQuad = (
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    steps?: number
  ) => {
    const approx = Math.hypot(p1.x - p0.x, p1.y - p0.y) + Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const n = Math.max(steps || 4, Math.ceil(approx / 12));
    for (let i = 0; i <= n; i++) {
      const pt = quadBezierPoint(p0, p1, p2, i / n);
      addPoint(pt.x, pt.y);
    }
  };

  switch (shapeId) {
    case 'star': {
      // 10-point star polygon: M 160,35 L 198,118 L 288,122 L 218,178 L 242,265 L 160,215 L 78,265 L 102,178 L 32,122 L 122,118 Z
      const v = [
        { x: 160, y: 35 },
        { x: 198, y: 118 },
        { x: 288, y: 122 },
        { x: 218, y: 178 },
        { x: 242, y: 265 },
        { x: 160, y: 215 },
        { x: 78, y: 265 },
        { x: 102, y: 178 },
        { x: 32, y: 122 },
        { x: 122, y: 118 },
      ];
      for (let i = 0; i < v.length; i++) {
        const p1 = v[i];
        const p2 = v[(i + 1) % v.length];
        sampleLine(p1.x, p1.y, p2.x, p2.y, 3);
      }
      break;
    }

    case 'sun': {
      // Circle at center (160, 160) r=58
      sampleCircle(160, 160, 58, 16);
      // 8 Rays exactly matching SVG Path
      sampleLine(160, 82, 160, 30, 2);
      sampleLine(160, 238, 160, 290, 2);
      sampleLine(82, 160, 30, 160, 2);
      sampleLine(238, 160, 290, 160, 2);
      sampleLine(105, 105, 68, 68, 2);
      sampleLine(215, 105, 252, 68, 2);
      sampleLine(105, 215, 68, 252, 2);
      sampleLine(215, 215, 252, 252, 2);
      // Smile
      sampleQuad({ x: 144, y: 175 }, { x: 160, y: 190 }, { x: 176, y: 175 }, 3);
      break;
    }

    case 'apple': {
      // Body: M 160,95 C 130,65 72,75 72,140 C 72,210 130,270 160,285 C 190,270 248,210 248,140 C 248,75 190,65 160,95 Z
      sampleCubic({ x: 160, y: 95 }, { x: 130, y: 65 }, { x: 72, y: 75 }, { x: 72, y: 140 }, 6);
      sampleCubic({ x: 72, y: 140 }, { x: 72, y: 210 }, { x: 130, y: 270 }, { x: 160, y: 285 }, 6);
      sampleCubic({ x: 160, y: 285 }, { x: 190, y: 270 }, { x: 248, y: 210 }, { x: 248, y: 140 }, 6);
      sampleCubic({ x: 248, y: 140 }, { x: 248, y: 75 }, { x: 190, y: 65 }, { x: 160, y: 95 }, 6);
      // Stem: M 160,95 Q 165,55 185,42
      sampleQuad({ x: 160, y: 95 }, { x: 165, y: 55 }, { x: 185, y: 42 }, 4);
      // Leaf: M 165,72 Q 220,50 225,82 Q 195,105 165,72 Z
      sampleQuad({ x: 165, y: 72 }, { x: 220, y: 50 }, { x: 225, y: 82 }, 4);
      sampleQuad({ x: 225, y: 82 }, { x: 195, y: 105 }, { x: 165, y: 72 }, 4);
      break;
    }

    case 'balloon': {
      // Body: M 160,35 C 225,35 245,95 245,150 C 245,210 195,232 165,238 L 160,244 L 155,238 C 125,232 75,210 75,150 C 75,95 95,35 160,35 Z
      sampleCubic({ x: 160, y: 35 }, { x: 225, y: 35 }, { x: 245, y: 95 }, { x: 245, y: 150 }, 6);
      sampleCubic({ x: 245, y: 150 }, { x: 245, y: 210 }, { x: 195, y: 232 }, { x: 165, y: 238 }, 6);
      sampleLine(165, 238, 160, 244, 2);
      sampleLine(160, 244, 155, 238, 2);
      sampleCubic({ x: 155, y: 238 }, { x: 125, y: 232 }, { x: 75, y: 210 }, { x: 75, y: 150 }, 6);
      sampleCubic({ x: 75, y: 150 }, { x: 75, y: 95 }, { x: 95, y: 35 }, { x: 160, y: 35 }, 6);
      // Knot: M 152,244 L 168,244 L 160,256 Z
      sampleLine(152, 244, 168, 244, 2);
      sampleLine(168, 244, 160, 256, 1);
      sampleLine(160, 256, 152, 244, 1);
      // Wavy String: M 160,256 Q 142,280 162,300 Q 172,310 160,320
      sampleQuad({ x: 160, y: 256 }, { x: 142, y: 280 }, { x: 162, y: 300 }, 4);
      sampleQuad({ x: 162, y: 300 }, { x: 172, y: 310 }, { x: 160, y: 320 }, 4);
      break;
    }

    case 'flower': {
      // 6 Petals: circles of radius 26
      sampleCircle(160, 82, 26, 8);
      sampleCircle(210, 110, 26, 8);
      sampleCircle(210, 170, 26, 8);
      sampleCircle(160, 198, 26, 8);
      sampleCircle(110, 170, 26, 8);
      sampleCircle(110, 110, 26, 8);
      // Center circle
      sampleCircle(160, 140, 28, 8);
      // Stem: M 160,224 Q 166,265 160,305
      sampleQuad({ x: 160, y: 224 }, { x: 166, y: 265 }, { x: 160, y: 305 }, 4);
      // Leaf: M 162,260 Q 200,248 206,270 Q 188,280 162,268 Z
      sampleQuad({ x: 162, y: 260 }, { x: 200, y: 248 }, { x: 206, y: 270 }, 3);
      sampleQuad({ x: 206, y: 270 }, { x: 188, y: 280 }, { x: 162, y: 268 }, 3);
      break;
    }

    case 'car': {
      // Roof: M 85,150 L 120,90 L 200,90 L 235,150 Z
      sampleLine(85, 150, 120, 90, 3);
      sampleLine(120, 90, 200, 90, 4);
      sampleLine(200, 90, 235, 150, 3);
      // Body: M 45,150 L 275,150 Q 285,150 285,170 L 285,200 Q 285,210 275,210 L 245,210 C 245,182 195,182 195,210 L 125,210 C 125,182 75,182 75,210 L 45,210 Q 35,210 35,200 L 35,170 Q 35,150 45,150 Z
      sampleLine(45, 150, 275, 150, 7);
      sampleQuad({ x: 275, y: 150 }, { x: 285, y: 150 }, { x: 285, y: 170 }, 2);
      sampleLine(285, 170, 285, 200, 2);
      sampleQuad({ x: 285, y: 200 }, { x: 285, y: 210 }, { x: 275, y: 210 }, 2);
      sampleLine(275, 210, 245, 210, 2);
      sampleCubic({ x: 245, y: 210 }, { x: 245, y: 182 }, { x: 195, y: 182 }, { x: 195, y: 210 }, 5);
      sampleLine(195, 210, 125, 210, 3);
      sampleCubic({ x: 125, y: 210 }, { x: 125, y: 182 }, { x: 75, y: 182 }, { x: 75, y: 210 }, 5);
      sampleLine(75, 210, 45, 210, 2);
      sampleQuad({ x: 45, y: 210 }, { x: 35, y: 210 }, { x: 35, y: 200 }, 2);
      sampleLine(35, 200, 35, 170, 2);
      sampleQuad({ x: 35, y: 170 }, { x: 35, y: 150 }, { x: 45, y: 150 }, 2);
      // Wheels: cx=100, cy=210, r=24 & cx=220, cy=210, r=24
      sampleCircle(100, 210, 24, 8);
      sampleCircle(220, 210, 24, 8);
      break;
    }

    case 'house': {
      // Roof: M 50,145 L 160,55 L 270,145 Z
      sampleLine(50, 145, 160, 55, 4);
      sampleLine(160, 55, 270, 145, 4);
      sampleLine(270, 145, 50, 145, 6);
      // Body: M 72,145 L 72,275 L 248,275 L 248,145
      sampleLine(72, 145, 72, 275, 4);
      sampleLine(72, 275, 248, 275, 6);
      sampleLine(248, 275, 248, 145, 4);
      // Door: M 135,275 L 135,200 L 185,200 L 185,275
      sampleLine(135, 275, 135, 200, 3);
      sampleLine(135, 200, 185, 200, 2);
      sampleLine(185, 200, 185, 275, 3);
      // Window: Rect x=92, y=175, w=32, h=32
      sampleLine(92, 175, 124, 175, 2);
      sampleLine(124, 175, 124, 207, 2);
      sampleLine(124, 207, 92, 207, 2);
      sampleLine(92, 207, 92, 175, 2);
      break;
    }

    case 'butterfly': {
      // Head: Circle cx=160, cy=100, r=14
      sampleCircle(160, 100, 14, 6);
      // Body: Ellipse cx=160, cy=165, rx=10, ry=52
      sampleEllipse(160, 165, 10, 52, 12);
      // Top-left wing: M 152,130 C 85,80 45,140 152,180
      sampleCubic({ x: 152, y: 130 }, { x: 85, y: 80 }, { x: 45, y: 140 }, { x: 152, y: 180 }, 7);
      // Top-right wing: M 168,130 C 235,80 275,140 168,180
      sampleCubic({ x: 168, y: 130 }, { x: 235, y: 80 }, { x: 275, y: 140 }, { x: 168, y: 180 }, 7);
      // Bottom-left wing: M 152,180 C 95,210 110,250 155,210
      sampleCubic({ x: 152, y: 180 }, { x: 95, y: 210 }, { x: 110, y: 250 }, { x: 155, y: 210 }, 6);
      // Bottom-right wing: M 168,180 C 225,210 210,250 165,210
      sampleCubic({ x: 168, y: 180 }, { x: 225, y: 210 }, { x: 210, y: 250 }, { x: 165, y: 210 }, 6);
      break;
    }

    case 'fish': {
      // Body: M 230,160 C 180,85 75,105 45,160 C 75,215 180,235 230,160 Z
      // Top curve from tail to nose:
      sampleCubic({ x: 230, y: 160 }, { x: 180, y: 85 }, { x: 75, y: 105 }, { x: 45, y: 160 }, 8);
      // Bottom curve from nose to tail:
      sampleCubic({ x: 45, y: 160 }, { x: 75, y: 215 }, { x: 180, y: 235 }, { x: 230, y: 160 }, 8);
      // Tail: M 225,160 L 275,115 L 260,160 L 275,205 Z
      sampleLine(225, 160, 275, 115, 3);
      sampleLine(275, 115, 260, 160, 3);
      sampleLine(260, 160, 275, 205, 3);
      sampleLine(275, 205, 225, 160, 3);
      // Eye: Circle cx=85, cy=148, r=6
      sampleCircle(85, 148, 6, 4);
      break;
    }

    case 'blank':
    default:
      break;
  }

  // Filter out duplicate or overly clustered dots for clean visual spacing
  const uniqueDots: TargetDot[] = [];
  for (const d of rawDots) {
    const isTooClose = uniqueDots.some(
      (u) => Math.hypot(u.x - d.x, u.y - d.y) < 14
    );
    if (!isTooClose) {
      uniqueDots.push({ id: uniqueDots.length, x: d.x, y: d.y });
    }
  }

  return uniqueDots;
}

/**
 * Extracts point coordinates from an SVG path 'd' string
 */
function extractPointsFromSvgD(d: string): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const regex = /([0-9.]+)[,\s]+([0-9.]+)/g;
  let match;
  while ((match = regex.exec(d)) !== null) {
    const x = parseFloat(match[1]);
    const y = parseFloat(match[2]);
    if (!isNaN(x) && !isNaN(y)) {
      points.push({ x, y });
    }
  }
  return points;
}

interface RatingResult {
  stars: number; // 0, 1, 2, or 3
  percentage: number;
  coveredCount: number;
  totalCount: number;
  title: string;
  subtitle: string;
  earnedStars: number;
}

export default function CreativeDrawingScreen() {
  const router = useRouter();
  const { speak, language, progress, updateProgress, addCoins } = useApp();
  const activeLang = language || 'en';

  const [selectedShape, setSelectedShape] = useState<TraceShapeId>('star');
  const [selectedColor, setSelectedColor] = useState<string>('#EF4444');
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [brushSize, setBrushSize] = useState<number>(10);

  const [strokes, setStrokes] = useState<StrokePath[]>([]);
  const [currentD, setCurrentD] = useState<string>('');
  const [ratingResult, setRatingResult] = useState<RatingResult | null>(null);

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

  // Target dots for active shape
  const targetDots = useMemo(() => getShapeTargetDots(selectedShape), [selectedShape]);
  const coveredIdsRef = useRef<Set<number>>(new Set());
  const [coveredCount, setCoveredCount] = useState<number>(0);
  const [eraserPreview, setEraserPreview] = useState<{ x: number; y: number } | null>(null);
  const undoHistoryRef = useRef<StrokePath[][]>([]);
  // Stars already paid for the current canvas. "Done" -> "Keep Drawing" -> "Done" used to pay
  // the full reward every time (and the blank canvas paid even with nothing drawn); now only an
  // improvement on the best rating so far is credited. Reset whenever the canvas is reset.
  const rewardedStarsRef = useRef(0);
  const resetCanvasSession = () => {
    rewardedStarsRef.current = 0;
    undoHistoryRef.current = []; // undo must not bring back the previous shape's strokes
  };
  const creditStars = (stars: number) => {
    const delta = Math.max(0, stars - rewardedStarsRef.current);
    if (delta === 0) return;
    rewardedStarsRef.current = stars;
    updateProgress({ stars: (progress.stars || 0) + delta });
    addCoins(delta * 2);
  };

  const activeShape = TRACE_SHAPES.find((s) => s.id === selectedShape) || TRACE_SHAPES[0];

  const unhitDots = useMemo(() => {
    void coveredCount;
    return targetDots.filter((d) => !coveredIdsRef.current.has(d.id));
  }, [targetDots, coveredCount]);

  const currentTargetDot = unhitDots.length > 0 ? unhitDots[0] : null;
  const suggestionDots = unhitDots.slice(1, 4);

  const currentPtsRef = useRef<{ x: number; y: number }[]>([]);
  const currentDRef = useRef<string>('');
  const lastPtRef = useRef<{ x: number; y: number } | null>(null);
  const currentColorRef = useRef<string>(selectedColor);
  const currentSizeRef = useRef<number>(brushSize);
  const isEraserRef = useRef<boolean>(isEraser);

  currentColorRef.current = selectedColor;
  currentSizeRef.current = isEraser ? 24 : brushSize;
  isEraserRef.current = isEraser;

  const strokesRef = useRef<StrokePath[]>([]);
  strokesRef.current = strokes;

  const selectedShapeRef = useRef<TraceShapeId>(selectedShape);
  selectedShapeRef.current = selectedShape;

  const targetDotsRef = useRef<TargetDot[]>(targetDots);
  targetDotsRef.current = targetDots;

  const ratingResultRef = useRef<RatingResult | null>(ratingResult);
  ratingResultRef.current = ratingResult;

  const canvasRef = useRef<React.ComponentRef<typeof View>>(null);
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasLayoutRef = useRef<{ width: number; height: number }>({
    width: 320,
    height: 320,
  });

  /**
   * Converts raw pointer touch coordinates (Web client bounds or Mobile localX/Y + dx/dy)
   * directly into the exact SVG coordinate space (0..320, 0..320 with preserveAspectRatio="xMidYMid meet").
   * Completely immune to Android status bar heights, window insets, async measure delays, and screen scaling.
   */
  const getPointerCoords = (
    evt: GestureResponderEvent,
    gestureState?: PanResponderGestureState,
    isGrant = false
  ): { x: number; y: number } => {
    const VB_W = 320;
    const VB_H = 320;
    let rawX: number | undefined;
    let rawY: number | undefined;
    let contW = canvasLayoutRef.current.width || 320;
    let contH = canvasLayoutRef.current.height || 320;

    // 1. Web browser client bounds calculation
    if (Platform.OS === 'web' && canvasRef.current) {
      const node = webDomNode(canvasRef.current);
      if (typeof node?.getBoundingClientRect === 'function') {
        const rect = node.getBoundingClientRect();
        const clientX =
          (evt.nativeEvent as typeof evt.nativeEvent & WebClientPoint).clientX ??
          (evt.nativeEvent as typeof evt.nativeEvent & WebClientPoint).touches?.[0]?.clientX ??
          evt.nativeEvent.pageX;
        const clientY =
          (evt.nativeEvent as typeof evt.nativeEvent & WebClientPoint).clientY ??
          (evt.nativeEvent as typeof evt.nativeEvent & WebClientPoint).touches?.[0]?.clientY ??
          evt.nativeEvent.pageY;

        if (clientX !== undefined && clientY !== undefined) {
          rawX = clientX - rect.left;
          rawY = clientY - rect.top;
          contW = rect.width;
          contH = rect.height;
        }
      }
    }

    // 2. Mobile Device (Android / iOS)
    // Since the touch overlay has NO child views and collapsable={false},
    // locationX / locationY on grant is the exact local coordinate inside the canvas view (in dp).
    if (rawX === undefined || rawY === undefined) {
      if (isGrant) {
        rawX = evt.nativeEvent.locationX ?? 0;
        rawY = evt.nativeEvent.locationY ?? 0;
        touchStartRef.current = { x: rawX, y: rawY };
      } else {
        // On move, use accumulated delta (dx, dy) from touchStartRef.
        // dx and dy are in pure density-independent points, completely immune
        // to status bar, safe area, navigation bar, headers, and window offsets.
        rawX = touchStartRef.current.x + (gestureState?.dx ?? 0);
        rawY = touchStartRef.current.y + (gestureState?.dy ?? 0);
      }
    }

    // Clamp within canvas container boundaries
    rawX = Math.max(0, Math.min(contW, rawX));
    rawY = Math.max(0, Math.min(contH, rawY));

    // 3. Transform container coordinates (rawX, rawY) into SVG viewBox coordinates (0..320, 0..320)
    const scale = Math.min(contW / VB_W, contH / VB_H) || 1;
    const offsetX = (contW - VB_W * scale) / 2;
    const offsetY = (contH - VB_H * scale) / 2;

    const svgX = (rawX - offsetX) / scale;
    const svgY = (rawY - offsetY) / scale;

    return {
      x: Math.round(svgX * 10) / 10,
      y: Math.round(svgY * 10) / 10,
    };
  };

  /**
   * Distance from point (px, py) to line segment (x1, y1)-(x2, y2)
   */
  const distancePointToSegment = (
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const l2 = dx * dx + dy * dy;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  };

  /**
   * Checks whether pointer stroke actually touches target dots.
   * Distance tolerance is strictly 9.5px (brush radius 5px + dot radius 4.5px).
   * A stroke drawn outside the shape (15-25px away) will NEVER touch or activate the dots!
   */
  const checkDotAttachment = (
    currPt: { x: number; y: number },
    prevPt?: { x: number; y: number } | null
  ) => {
    if (isEraserRef.current || selectedShape === 'blank' || targetDots.length === 0) return;

    const STRICT_MAX_DIST = 9.5; // Strictly requires brush (10px wide) to actually touch the dot
    let newlyCovered = false;

    for (let i = 0; i < targetDots.length; i++) {
      if (!coveredIdsRef.current.has(i)) {
        const dot = targetDots[i];
        const dist = prevPt
          ? distancePointToSegment(dot.x, dot.y, prevPt.x, prevPt.y, currPt.x, currPt.y)
          : Math.hypot(currPt.x - dot.x, currPt.y - dot.y);

        if (dist <= STRICT_MAX_DIST) {
          coveredIdsRef.current.add(i);
          newlyCovered = true;
        }
      }
    }

    if (newlyCovered) {
      setCoveredCount(coveredIdsRef.current.size);
    }
  };

  /**
   * Recomputes covered target dots from remaining strokes (after undo/clear)
   */
  const recomputeCoveredDots = (remainingStrokes: StrokePath[]) => {
    const dots = getShapeTargetDots(selectedShape);
    const newSet = new Set<number>();
    const REACH_DIST = 16;

    for (const s of remainingStrokes) {
      if (s.color === '#FFFFFF') continue; // Skip eraser
      const pts = extractPointsFromSvgD(s.d);
      for (let j = 0; j < pts.length; j++) {
        const curr = pts[j];
        const prev = j > 0 ? pts[j - 1] : null;

        for (let i = 0; i < dots.length; i++) {
          const dot = dots[i];
          if (!newSet.has(dot.id)) {
            const dist = prev
              ? distancePointToSegment(dot.x, dot.y, prev.x, prev.y, curr.x, curr.y)
              : Math.hypot(curr.x - dot.x, curr.y - dot.y);

            if (dist <= REACH_DIST) {
              newSet.add(dot.id);
            }
          }
        }
      }
    }

    coveredIdsRef.current = newSet;
    setCoveredCount(newSet.size);
  };



  /**
   * Calculates comprehensive tracing accuracy:
   * 1. coveragePct: % of target dots touched
   * 2. precisionPct: % of user drawn stroke points that are on or near the shape outline (<= 11.5px)
   * 3. isScribble: user made random strokes across the canvas with < 50% precision
   * 4. effectiveAccuracy: coveragePct * (precisionPct / 100)
   */
  const calculateTracingAccuracy = (strokesList: StrokePath[]) => {
    if (selectedShape === 'blank' || targetDots.length === 0) {
      return {
        coveragePct: 100,
        coveredCount: strokesList.length,
        totalDots: Math.max(1, strokesList.length),
        isScribble: false,
      };
    }

    const totalDots = targetDots.length;
    const covered = coveredIdsRef.current.size;
    const coveragePct = totalDots > 0 ? Math.round((covered / totalDots) * 100) : 0;

    let totalDrawnPoints = 0;
    for (const s of strokesList) {
      if (s.color === '#FFFFFF') continue;
      const pts = extractPointsFromSvgD(s.d);
      totalDrawnPoints += pts.length;
    }

    // A scribble is only flagged if child made heavy random marks (> 40 points) with very low dot coverage (< 20%)
    const isScribble = coveragePct < 20 && totalDrawnPoints > 40;

    return {
      coveragePct,
      coveredCount: covered,
      totalDots,
      isScribble,
    };
  };

  /**
   * Evaluates current coverage and opens the 3-star rating celebration modal!
   */
  const handleEvaluateAndRate = () => {
    if (selectedShape === 'blank') {
      if (strokes.length === 0) {
        soundEffects.playBubblePop();
        speak(
          activeLang === 'gu'
            ? 'પહેલા કંઈક સુંદર દોરો!'
            : activeLang === 'hi'
            ? 'पहले कुछ सुंदर बनाओ!'
            : 'Draw something first!',
          activeLang
        );
        return;
      }
      soundEffects.playTadaaa();
      speak(
        activeLang === 'gu'
          ? 'સરસ! ખૂબ જ સુંદર ચિત્ર દોર્યું! શાબાશ!'
          : activeLang === 'hi'
          ? 'बहुत बढ़िया! सुंदर चित्र बनाया! शाबाश!'
          : 'Super job! Beautiful drawing!',
        activeLang
      );
      setRatingResult({
        stars: 3,
        percentage: 100,
        coveredCount: strokes.length,
        totalCount: Math.max(1, strokes.length),
        title:
          activeLang === 'gu'
            ? 'સરસ! સુંદર ચિત્ર!'
            : activeLang === 'hi'
            ? 'सुंदर चित्र!'
            : 'Beautiful Drawing!',
        subtitle:
          activeLang === 'gu'
            ? 'તમારું મનપસંદ ચિત્ર બની ગયું!'
            : activeLang === 'hi'
            ? 'आपका मनपसंद चित्र तैयार है!'
            : 'Your drawing is complete!',
        earnedStars: 3,
      });
      creditStars(3);
      return;
    }

    if (targetDots.length === 0) return;

    const { coveragePct, coveredCount, totalDots, isScribble } =
      calculateTracingAccuracy(strokes);

    let stars = 0;
    let title = '';
    let subtitle = '';
    let voiceText = '';

    if (isScribble) {
      stars = 0;
      title =
        activeLang === 'gu'
          ? 'આકારની બહાર લીટા ન કરો!'
          : activeLang === 'hi'
          ? 'आकार के बाहर लाइन न खींचें!'
          : 'Stay along the dotted lines!';
      subtitle =
        activeLang === 'gu'
          ? 'માત્ર ટપકાં પર જ લાઇન દોરો અને સ્ટાર મેળવો!'
          : activeLang === 'hi'
          ? 'केवल डॉट्स पर ही लाइन बनाएं और स्टार पाएं!'
          : 'Please trace along the dots carefully to earn stars!';
      voiceText =
        activeLang === 'gu'
          ? 'આકારની બહાર લીટા ન કરો! માત્ર ટપકાં જોડીને સરસ રીતે દોરો!'
          : activeLang === 'hi'
          ? 'आकार के बाहर न बनाएं! सिर्फ डॉट्स जोड़कर सुंदर ट्रेसिंग करें!'
          : 'Do not scribble outside! Trace carefully along the dotted line!';
    } else if (coveragePct >= 70) {
      // ⭐⭐⭐ 3 Stars: Successfully traced >= 70% of dots!
      stars = 3;
      title =
        activeLang === 'gu'
          ? 'સરસ! અદ્ભુત ટ્રેસિંગ!'
          : activeLang === 'hi'
          ? 'शानदार ट्रेसिंग!'
          : 'Awesome Tracing!';
      subtitle =
        activeLang === 'gu'
          ? `બધા જ ટપકાં એકદમ સરસ રીતે જોડાયા! (${coveragePct}%)`
          : activeLang === 'hi'
          ? `सारे डॉट्स बहुत अच्छे से जुड़ गए! (${coveragePct}%)`
          : `All dots traced perfectly! (${coveragePct}%)`;
      voiceText =
        activeLang === 'gu'
          ? 'સરસ! ખૂબ જ સરસ! તમે બધા ટપકાં જોડીને ૩ સ્ટાર મેળવ્યા! શાબાશ!'
          : activeLang === 'hi'
          ? 'बहुत बढ़िया! आपने सारे डॉट्स जोड़कर ३ स्टार जीते!'
          : 'Super job! You traced the dots and earned 3 stars!';
    } else if (coveragePct >= 40) {
      // ⭐⭐ 2 Stars: Good attempt
      stars = 2;
      title =
        activeLang === 'gu'
          ? 'સરસ! સુંદર ટ્રેસિંગ!'
          : activeLang === 'hi'
          ? 'बहुत अच्छा प्रयास!'
          : 'Well Done!';
      subtitle =
        activeLang === 'gu'
          ? `મોટાભાગના ટપકાં જોડાયા! (${coveragePct}%)`
          : activeLang === 'hi'
          ? `ज्यादातर डॉट्स जुड़ गए! (${coveragePct}%)`
          : `Most dots were traced! (${coveragePct}%)`;
      voiceText =
        activeLang === 'gu'
          ? 'સરસ! તમે ૨ સ્ટાર મેળવ્યા! ખૂબ સુંદર ટ્રેસિંગ!'
          : activeLang === 'hi'
          ? 'बहुत अच्छा! आपको २ स्टार मिले!'
          : 'Well done! You earned 2 stars!';
    } else if (coveragePct >= 15) {
      // ⭐ 1 Star: Started tracing
      stars = 1;
      title =
        activeLang === 'gu'
          ? 'સરસ પ્રયત્ન!'
          : activeLang === 'hi'
          ? 'अच्छा प्रयास!'
          : 'Good Try!';
      subtitle =
        activeLang === 'gu'
          ? `હજુ થોડાં ટપકાં જોડીને ૩ સ્ટાર મેળવો! (${coveragePct}%)`
          : activeLang === 'hi'
          ? `और डॉट्स जोड़कर ३ स्टार पाएं! (${coveragePct}%)`
          : `Trace more dots for 3 stars! (${coveragePct}%)`;
      voiceText =
        activeLang === 'gu'
          ? 'સરસ પ્રયત્ન! ફરી ટ્રેસ કરીને ૩ સ્ટાર મેળવો!'
          : activeLang === 'hi'
          ? 'अच्छा प्रयास! फिर से कोशिश करें!'
          : 'Good try! Trace again for 3 stars!';
    } else {
      // 0 Stars: Barely any dots
      stars = 0;
      title =
        activeLang === 'gu'
          ? 'ટપકાં જોડો!'
          : activeLang === 'hi'
          ? 'डॉट्स जोड़ें!'
          : 'Trace the Dots!';
      subtitle =
        activeLang === 'gu'
          ? 'લીલા ટપકાથી શરૂ કરી લીટી પરના ટપકાં જોડો!'
          : activeLang === 'hi'
          ? 'हरे डॉट से शुरू कर लाइन के डॉट्स जोड़ें!'
          : 'Trace along the dotted lines!';
      voiceText =
        activeLang === 'gu'
          ? 'લીટી પરના ટપકાં જોડીને દોરો અને સ્ટાર મેળવો!'
          : activeLang === 'hi'
          ? 'लाइन पर डॉट्स जोड़कर स्टार पाएं!'
          : 'Trace along the dotted lines to earn stars!';
    }

    soundEffects.playTadaaa();
    speak(voiceText, activeLang);

    setRatingResult({
      stars,
      percentage: coveragePct,
      coveredCount,
      totalCount: totalDots,
      title,
      subtitle,
      earnedStars: stars,
    });

    if (stars > 0) creditStars(stars);
  };

  /**
   * Erases user-drawn stroke points touched by the eraser.
   * Removes only user strokes and preserves background, guide outlines, and target dots.
   */
  const eraseStrokesAtPoint = (pt: { x: number; y: number }, radius: number) => {
    let changed = false;
    const currentList = strokesRef.current;
    const updated: StrokePath[] = [];

    for (const s of currentList) {
      if (s.color === '#FFFFFF') continue; // Ignore legacy white strokes
      const pts = extractPointsFromSvgD(s.d);
      if (pts.length === 0) continue;

      const subSegments: { x: number; y: number }[][] = [];
      let currentSeg: { x: number; y: number }[] = [];

      for (const p of pts) {
        const dist = Math.hypot(p.x - pt.x, p.y - pt.y);
        if (dist <= radius) {
          changed = true;
          if (currentSeg.length > 0) {
            subSegments.push(currentSeg);
            currentSeg = [];
          }
        } else {
          currentSeg.push(p);
        }
      }
      if (currentSeg.length > 0) {
        subSegments.push(currentSeg);
      }

      for (const seg of subSegments) {
        if (seg.length >= 2) {
          let d = `M ${seg[0].x},${seg[0].y}`;
          for (let i = 1; i < seg.length; i++) {
            d += ` L ${seg[i].x},${seg[i].y}`;
          }
          updated.push({
            id: `${s.id}-${Math.random().toString(36).substr(2, 4)}`,
            d,
            color: s.color,
            size: s.size,
          });
        }
      }
    }

    if (changed) {
      strokesRef.current = updated;
      setStrokes(updated);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const pt = getPointerCoords(evt, gestureState, true);
        lastPtRef.current = pt;

        // Save current strokes to undo history before making new stroke or erasing
        undoHistoryRef.current.push([...strokesRef.current]);
        if (undoHistoryRef.current.length > 30) {
          undoHistoryRef.current.shift();
        }

        if (isEraserRef.current) {
          setEraserPreview(pt);
          eraseStrokesAtPoint(pt, 18);
          return;
        }

        if (selectedShapeRef.current === 'blank') {
          currentPtsRef.current = [pt];
          const initialD = `M ${pt.x},${pt.y}`;
          currentDRef.current = initialD;
          setCurrentD(initialD);
          return;
        }

        // For template shapes: Find closest valid unhit dot to start tracing
        const dots = targetDotsRef.current;
        if (dots.length === 0) return;

        const unhit = dots.filter((d) => !coveredIdsRef.current.has(d.id));
        if (unhit.length === 0) return;

        // Look for candidate starting dot (immediate target, upcoming suggestion dots, or segment start)
        let startDot: TargetDot | null = null;
        const currentTarget = unhit[0];

        if (Math.hypot(pt.x - currentTarget.x, pt.y - currentTarget.y) <= 32) {
          startDot = currentTarget;
        } else {
          // Check next 2 suggestion dots
          for (let i = 1; i < Math.min(unhit.length, 3); i++) {
            if (Math.hypot(pt.x - unhit[i].x, pt.y - unhit[i].y) <= 24) {
              startDot = unhit[i];
              break;
            }
          }
          // Check any unhit dot within 26px (e.g. child starting new segment of multi-part shape)
          if (!startDot) {
            for (const d of unhit) {
              if (Math.hypot(pt.x - d.x, pt.y - d.y) <= 26) {
                startDot = d;
                break;
              }
            }
          }
        }

        if (!startDot) {
          // Touch was too far from guide path! Reject starting a rogue stroke in blank margins
          currentPtsRef.current = [];
          currentDRef.current = '';
          setCurrentD('');
          return;
        }

        // Snap starting point cleanly to the guide dot
        const snappedPt = { x: startDot.x, y: startDot.y };
        currentPtsRef.current = [snappedPt];

        if (!coveredIdsRef.current.has(startDot.id)) {
          coveredIdsRef.current.add(startDot.id);
          setCoveredCount(coveredIdsRef.current.size);
          soundEffects.playBubblePop();
        }

        const initialD = `M ${snappedPt.x},${snappedPt.y}`;
        currentDRef.current = initialD;
        setCurrentD(initialD);
        lastPtRef.current = snappedPt;
      },
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const pt = getPointerCoords(evt, gestureState, false);

        if (isEraserRef.current) {
          setEraserPreview(pt);
          if (lastPtRef.current) {
            const steps = 3;
            for (let i = 1; i <= steps; i++) {
              const ix = lastPtRef.current.x + ((pt.x - lastPtRef.current.x) * i) / steps;
              const iy = lastPtRef.current.y + ((pt.y - lastPtRef.current.y) * i) / steps;
              eraseStrokesAtPoint({ x: ix, y: iy }, 18);
            }
          } else {
            eraseStrokesAtPoint(pt, 18);
          }
          lastPtRef.current = pt;
          return;
        }

        if (selectedShapeRef.current === 'blank') {
          currentPtsRef.current.push(pt);
          const nextD = pointsToSmoothSvgPath(currentPtsRef.current);
          currentDRef.current = nextD;
          setCurrentD(nextD);
          lastPtRef.current = pt;
          return;
        }

        // Template shape tracing
        const dots = targetDotsRef.current;
        if (dots.length === 0) return;

        // If no stroke is active (e.g. grant was too far), check if finger entered range of target dot
        if (currentPtsRef.current.length === 0) {
          const unhit = dots.filter((d) => !coveredIdsRef.current.has(d.id));
          if (unhit.length > 0) {
            const target = unhit[0];
            if (Math.hypot(pt.x - target.x, pt.y - target.y) <= 24) {
              const snapped = { x: target.x, y: target.y };
              currentPtsRef.current = [snapped];
              coveredIdsRef.current.add(target.id);
              setCoveredCount(coveredIdsRef.current.size);
              soundEffects.playBubblePop();
              const d = `M ${target.x},${target.y}`;
              currentDRef.current = d;
              setCurrentD(d);
              lastPtRef.current = snapped;
            }
          }
          return;
        }

        const lastPt = currentPtsRef.current[currentPtsRef.current.length - 1];
        const unhit = dots.filter((d) => !coveredIdsRef.current.has(d.id));

        if (unhit.length === 0) {
          // All dots covered! Allow smooth finishing stroke
          currentPtsRef.current.push(pt);
          const d = pointsToSmoothSvgPath(currentPtsRef.current);
          currentDRef.current = d;
          setCurrentD(d);
          lastPtRef.current = pt;
          return;
        }

        const nextTarget = unhit[0];
        const distToNextSeg = distancePointToSegment(pt.x, pt.y, lastPt.x, lastPt.y, nextTarget.x, nextTarget.y);
        const distToNextDot = Math.hypot(pt.x - nextTarget.x, pt.y - nextTarget.y);

        const secondTarget = unhit.length > 1 ? unhit[1] : null;
        const distToSecondSeg = secondTarget
          ? distancePointToSegment(pt.x, pt.y, nextTarget.x, nextTarget.y, secondTarget.x, secondTarget.y)
          : Infinity;
        const distToSecondDot = secondTarget ? Math.hypot(pt.x - secondTarget.x, pt.y - secondTarget.y) : Infinity;

        const MAX_CORRIDOR_DIST = 26; // Disallow shortcuts or stray scribbles far from outline
        const inFirstCorridor = distToNextSeg <= MAX_CORRIDOR_DIST || distToNextDot <= MAX_CORRIDOR_DIST;
        const inSecondCorridor =
          secondTarget && (distToSecondSeg <= MAX_CORRIDOR_DIST || distToSecondDot <= MAX_CORRIDOR_DIST);

        if (!inFirstCorridor && !inSecondCorridor) {
          // Touch is too far from guide path or cutting across shape!
          // Reject adding point so line never cuts across shape.
          return;
        }

        // Project onto segment to keep line hugging the shape outline
        let targetForProj = nextTarget;
        if (inSecondCorridor && distToSecondDot < distToNextDot) {
          targetForProj = secondTarget!;
        }

        const segDx = targetForProj.x - lastPt.x;
        const segDy = targetForProj.y - lastPt.y;
        const segLen2 = segDx * segDx + segDy * segDy;
        let projX = pt.x;
        let projY = pt.y;

        if (segLen2 > 0) {
          let t = ((pt.x - lastPt.x) * segDx + (pt.y - lastPt.y) * segDy) / segLen2;
          t = Math.max(0, Math.min(1, t));
          projX = lastPt.x + t * segDx;
          projY = lastPt.y + t * segDy;
        }

        // Guide point: 75% on guideline, 25% user touch
        const strokePt = {
          x: Math.round((0.75 * projX + 0.25 * pt.x) * 10) / 10,
          y: Math.round((0.75 * projY + 0.25 * pt.y) * 10) / 10,
        };

        if (Math.hypot(strokePt.x - lastPt.x, strokePt.y - lastPt.y) >= 2.5) {
          currentPtsRef.current.push(strokePt);
        }

        // Check if nextTarget or secondTarget reached within tolerance
        if (
          distToNextDot <= 18 ||
          distancePointToSegment(nextTarget.x, nextTarget.y, lastPt.x, lastPt.y, strokePt.x, strokePt.y) <= 16
        ) {
          coveredIdsRef.current.add(nextTarget.id);
          setCoveredCount(coveredIdsRef.current.size);
          soundEffects.playBubblePop();

          if (
            secondTarget &&
            (distToSecondDot <= 18 ||
              distancePointToSegment(secondTarget.x, secondTarget.y, strokePt.x, strokePt.y, pt.x, pt.y) <= 16)
          ) {
            coveredIdsRef.current.add(secondTarget.id);
            setCoveredCount(coveredIdsRef.current.size);
          }
        }

        const smoothD = pointsToSmoothSvgPath(currentPtsRef.current);
        currentDRef.current = smoothD;
        setCurrentD(smoothD);
        lastPtRef.current = strokePt;
      },
      onPanResponderRelease: () => {
        lastPtRef.current = null;

        if (isEraserRef.current) {
          setEraserPreview(null);
          recomputeCoveredDots(strokesRef.current);
          return;
        }

        if (currentDRef.current && currentPtsRef.current.length > 0) {
          const finalD = pointsToSmoothSvgPath(currentPtsRef.current) || currentDRef.current;
          const newStroke: StrokePath = {
            id: `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            d: finalD,
            color: currentColorRef.current,
            size: currentSizeRef.current,
          };
          const nextStrokes = [...strokesRef.current, newStroke];
          strokesRef.current = nextStrokes;
          setStrokes(nextStrokes);
          currentPtsRef.current = [];
          currentDRef.current = '';
          setCurrentD('');

          // Auto-trigger completion ONLY when genuine, accurate tracing was completed!
          if (selectedShapeRef.current !== 'blank' && targetDotsRef.current.length > 0) {
            const { coveragePct, isScribble } = calculateTracingAccuracy(nextStrokes);

            if (!isScribble && coveragePct >= 75 && !ratingResultRef.current) {
              handleEvaluateAndRate();
            }
          }
        } else {
          currentPtsRef.current = [];
          currentDRef.current = '';
          setCurrentD('');
        }
      },
    })
  ).current;

  const handleSelectShape = (shape: TraceShapeDef) => {
    soundEffects.playBubblePop();
    setSelectedShape(shape.id);
    resetCanvasSession();
    setStrokes([]);
    currentPtsRef.current = [];
    currentDRef.current = '';
    setCurrentD('');
    coveredIdsRef.current.clear();
    setCoveredCount(0);
    setRatingResult(null);

    const shapeName =
      activeLang === 'gu' ? shape.nameGu : activeLang === 'hi' ? shape.nameHi : shape.nameEn;
    if (shape.id === 'blank') {
      speak(
        activeLang === 'gu'
          ? 'મુક્ત કેનવાસ! મનપસંદ ચિત્ર દોરો!'
          : activeLang === 'hi'
          ? 'मुक्त कैनवास! मनपसंद चित्र बनाएं!'
          : 'Free canvas! Draw whatever you like!',
        activeLang
      );
    } else {
      speak(
        activeLang === 'gu'
          ? `ચાલો ${shapeName}ની ડોટેડ લાઇન ટ્રેસ કરીએ!`
          : activeLang === 'hi'
          ? `चलो ${shapeName} की डॉट्स लाइन ट्रेस करें!`
          : `Let's trace the ${shapeName}!`,
        activeLang
      );
    }
  };

  const handleClear = () => {
    soundEffects.playBubblePop();
    resetCanvasSession();
    setStrokes([]);
    currentPtsRef.current = [];
    currentDRef.current = '';
    setCurrentD('');
    coveredIdsRef.current.clear();
    setCoveredCount(0);
    setRatingResult(null);
    speak(
      activeLang === 'gu'
        ? 'કેનવાસ સાફ થઈ ગયું!'
        : activeLang === 'hi'
        ? 'कैनवास साफ हो गया!'
        : 'Canvas cleared!',
      activeLang
    );
  };

  const handleUndo = () => {
    soundEffects.playBubblePop();
    currentPtsRef.current = [];
    currentDRef.current = '';
    setCurrentD('');
    if (undoHistoryRef.current.length > 0) {
      const prev = undoHistoryRef.current.pop()!;
      strokesRef.current = prev;
      setStrokes(prev);
      recomputeCoveredDots(prev);
    } else {
      setStrokes((prev) => {
        const next = prev.slice(0, Math.max(0, prev.length - 1));
        recomputeCoveredDots(next);
        return next;
      });
    }
  };

  const handleTraceAgain = () => {
    soundEffects.playBubblePop();
    resetCanvasSession();
    setRatingResult(null);
    setStrokes([]);
    currentPtsRef.current = [];
    currentDRef.current = '';
    setCurrentD('');
    coveredIdsRef.current.clear();
    setCoveredCount(0);
    speak(
      activeLang === 'gu'
        ? 'ચાલો ફરીથી સુંદર રીતે ટ્રેસ કરીએ!'
        : activeLang === 'hi'
        ? 'चलो फिर से सुंदर ट्रेसिंग करें!'
        : "Let's trace it again!",
      activeLang
    );
  };

  const handleNextShape = () => {
    soundEffects.playBubblePop();
    resetCanvasSession();
    setRatingResult(null);
    setStrokes([]);
    currentPtsRef.current = [];
    currentDRef.current = '';
    setCurrentD('');
    coveredIdsRef.current.clear();
    setCoveredCount(0);

    const shapesList = TRACE_SHAPES.filter((s) => s.id !== 'blank');
    const currentIndex = shapesList.findIndex((s) => s.id === selectedShape);
    const nextShape = shapesList[(currentIndex + 1) % shapesList.length];
    setSelectedShape(nextShape.id);

    const shapeName =
      activeLang === 'gu' ? nextShape.nameGu : activeLang === 'hi' ? nextShape.nameHi : nextShape.nameEn;
    speak(
      activeLang === 'gu'
        ? `સરસ! હવે ચાલો ${shapeName} ટ્રેસ કરીએ!`
        : activeLang === 'hi'
        ? `शाबाश! अब चलो ${shapeName} ट्रेस करें!`
        : `Awesome! Now let's trace the ${shapeName}!`,
      activeLang
    );
  };

  /* Render Dotted Guide Lines in SVG */
  /* Render Dotted Guide Lines in SVG with Separate Persistent Layers */
  const renderDottedGuide = (layer: 'background' | 'foreground') => {
    if (selectedShape === 'blank') return null;

    if (layer === 'background') {
      // LAYER 1: Non-erasable Pale Yellow / Soft-Tinted Shape Fill
      switch (selectedShape) {
        case 'star':
          return (
            <Path
              d="M 160,35 L 198,118 L 288,122 L 218,178 L 242,265 L 160,215 L 78,265 L 102,178 L 32,122 L 122,118 Z"
              fill="rgba(254, 240, 138, 0.22)"
              stroke="none"
            />
          );
        case 'sun':
          return (
            <Circle
              cx={160}
              cy={160}
              r={58}
              fill="rgba(254, 240, 138, 0.25)"
              stroke="none"
            />
          );
        case 'apple':
          return (
            <>
              <Path
                d="M 160,95 C 130,65 72,75 72,140 C 72,210 130,270 160,285 C 190,270 248,210 248,140 C 248,75 190,65 160,95 Z"
                fill="rgba(254, 202, 202, 0.25)"
                stroke="none"
              />
              <Path
                d="M 165,72 Q 220,50 225,82 Q 195,105 165,72 Z"
                fill="rgba(187, 247, 208, 0.3)"
                stroke="none"
              />
            </>
          );
        case 'balloon':
          return (
            <Path
              d="M 160,35 C 225,35 245,95 245,150 C 245,210 195,232 165,238 L 160,244 L 155,238 C 125,232 75,210 75,150 C 75,95 95,35 160,35 Z"
              fill="rgba(191, 219, 254, 0.25)"
              stroke="none"
            />
          );
        case 'flower':
          return (
            <>
              <Circle cx={160} cy={140} r={28} fill="rgba(254, 240, 138, 0.35)" stroke="none" />
              <Circle cx={160} cy={82} r={26} fill="rgba(254, 205, 211, 0.25)" stroke="none" />
              <Circle cx={210} cy={110} r={26} fill="rgba(254, 205, 211, 0.25)" stroke="none" />
              <Circle cx={210} cy={170} r={26} fill="rgba(254, 205, 211, 0.25)" stroke="none" />
              <Circle cx={160} cy={198} r={26} fill="rgba(254, 205, 211, 0.25)" stroke="none" />
              <Circle cx={110} cy={170} r={26} fill="rgba(254, 205, 211, 0.25)" stroke="none" />
              <Circle cx={110} cy={110} r={26} fill="rgba(254, 205, 211, 0.25)" stroke="none" />
              <Path
                d="M 162,260 Q 200,248 206,270 Q 188,280 162,268 Z"
                fill="rgba(187, 247, 208, 0.3)"
                stroke="none"
              />
            </>
          );
        case 'car':
          return (
            <>
              <Path
                d="M 85,150 L 120,90 L 200,90 L 235,150 Z"
                fill="rgba(221, 214, 254, 0.25)"
                stroke="none"
              />
              <Path
                d="M 45,150 L 275,150 Q 285,150 285,170 L 285,200 Q 285,210 275,210 L 245,210 C 245,182 195,182 195,210 L 125,210 C 125,182 75,182 75,210 L 45,210 Q 35,210 35,200 L 35,170 Q 35,150 45,150 Z"
                fill="rgba(254, 240, 138, 0.2)"
                stroke="none"
              />
              <Circle cx={100} cy={210} r={24} fill="rgba(203, 213, 225, 0.3)" stroke="none" />
              <Circle cx={220} cy={210} r={24} fill="rgba(203, 213, 225, 0.3)" stroke="none" />
            </>
          );
        case 'house':
          return (
            <>
              <Path
                d="M 50,145 L 160,55 L 270,145 Z"
                fill="rgba(254, 215, 170, 0.3)"
                stroke="none"
              />
              <Path
                d="M 72,145 L 72,275 L 248,275 L 248,145 Z"
                fill="rgba(254, 240, 138, 0.2)"
                stroke="none"
              />
              <Path
                d="M 135,275 L 135,200 L 185,200 L 185,275 Z"
                fill="rgba(203, 213, 225, 0.35)"
                stroke="none"
              />
            </>
          );
        case 'butterfly':
          return (
            <>
              <Circle cx={160} cy={100} r={14} fill="rgba(254, 240, 138, 0.25)" stroke="none" />
              <Ellipse cx={160} cy={165} rx={10} ry={52} fill="rgba(254, 240, 138, 0.3)" stroke="none" />
              <Path d="M 152,130 C 85,80 45,140 152,180 Z" fill="rgba(254, 205, 211, 0.25)" stroke="none" />
              <Path d="M 168,130 C 235,80 275,140 168,180 Z" fill="rgba(254, 205, 211, 0.25)" stroke="none" />
              <Path d="M 152,180 C 95,210 110,250 155,210 Z" fill="rgba(191, 219, 254, 0.25)" stroke="none" />
              <Path d="M 168,180 C 225,210 210,250 165,210 Z" fill="rgba(191, 219, 254, 0.25)" stroke="none" />
            </>
          );
        case 'fish':
          return (
            <>
              <Path
                d="M 230,160 C 180,85 75,105 45,160 C 75,215 180,235 230,160 Z"
                fill="rgba(191, 219, 254, 0.25)"
                stroke="none"
              />
              <Path
                d="M 225,160 L 275,115 L 260,160 L 275,205 Z"
                fill="rgba(254, 215, 170, 0.3)"
                stroke="none"
              />
            </>
          );
        default:
          return null;
      }
    }

    // LAYER 3: Persistent Foreground Guide (Dashed Guide Lines, Dots, Start Point, Eraser Indicator)
    let guideOutlineJsx = null;

    switch (selectedShape) {
      case 'star':
        guideOutlineJsx = (
          <Path
            d="M 160,35 L 198,118 L 288,122 L 218,178 L 242,265 L 160,215 L 78,265 L 102,178 L 32,122 L 122,118 Z"
            stroke="#64748B"
            strokeWidth={4.5}
            strokeDasharray="9, 9"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
        break;

      case 'sun':
        guideOutlineJsx = (
          <>
            <Circle
              cx={160}
              cy={160}
              r={58}
              stroke="#64748B"
              strokeWidth={4.5}
              strokeDasharray="9, 9"
              fill="none"
            />
            <Path
              d="M 160,82 L 160,30 M 160,238 L 160,290 M 82,160 L 30,160 M 238,160 L 290,160 M 105,105 L 68,68 M 215,105 L 252,68 M 105,215 L 68,252 M 215,215 L 252,252"
              stroke="#64748B"
              strokeWidth={4.5}
              strokeDasharray="9, 9"
              strokeLinecap="round"
            />
            <Circle cx={142} cy={150} r={5} fill="#64748B" />
            <Circle cx={178} cy={150} r={5} fill="#64748B" />
            <Path
              d="M 144,175 Q 160,190 176,175"
              stroke="#64748B"
              strokeWidth={3.5}
              fill="none"
              strokeLinecap="round"
            />
          </>
        );
        break;

      case 'apple':
        guideOutlineJsx = (
          <>
            <Path
              d="M 160,95 C 130,65 72,75 72,140 C 72,210 130,270 160,285 C 190,270 248,210 248,140 C 248,75 190,65 160,95 Z"
              stroke="#64748B"
              strokeWidth={4.5}
              strokeDasharray="9, 9"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M 160,95 Q 165,55 185,42"
              stroke="#64748B"
              strokeWidth={4.5}
              strokeDasharray="7, 7"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M 165,72 Q 220,50 225,82 Q 195,105 165,72 Z"
              stroke="#64748B"
              strokeWidth={4.5}
              strokeDasharray="8, 8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );
        break;

      case 'balloon':
        guideOutlineJsx = (
          <>
            <Path
              d="M 160,35 C 225,35 245,95 245,150 C 245,210 195,232 165,238 L 160,244 L 155,238 C 125,232 75,210 75,150 C 75,95 95,35 160,35 Z"
              stroke="#64748B"
              strokeWidth={4.5}
              strokeDasharray="9, 9"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M 152,244 L 168,244 L 160,256 Z"
              stroke="#64748B"
              strokeWidth={3.5}
              strokeDasharray="6, 6"
              fill="none"
            />
            <Path
              d="M 160,256 Q 142,280 162,300 Q 175,315 158,335"
              stroke="#64748B"
              strokeWidth={4}
              strokeDasharray="8, 8"
              fill="none"
              strokeLinecap="round"
            />
          </>
        );
        break;

      case 'flower':
        guideOutlineJsx = (
          <>
            <Circle
              cx={160}
              cy={140}
              r={28}
              stroke="#64748B"
              strokeWidth={4.5}
              strokeDasharray="8, 8"
              fill="none"
            />
            <Circle cx={160} cy={82} r={26} stroke="#64748B" strokeWidth={4} strokeDasharray="8, 8" fill="none" />
            <Circle cx={210} cy={110} r={26} stroke="#64748B" strokeWidth={4} strokeDasharray="8, 8" fill="none" />
            <Circle cx={210} cy={170} r={26} stroke="#64748B" strokeWidth={4} strokeDasharray="8, 8" fill="none" />
            <Circle cx={160} cy={198} r={26} stroke="#64748B" strokeWidth={4} strokeDasharray="8, 8" fill="none" />
            <Circle cx={110} cy={170} r={26} stroke="#64748B" strokeWidth={4} strokeDasharray="8, 8" fill="none" />
            <Circle cx={110} cy={110} r={26} stroke="#64748B" strokeWidth={4} strokeDasharray="8, 8" fill="none" />
            <Path
              d="M 160,224 Q 166,265 160,305"
              stroke="#64748B"
              strokeWidth={4.5}
              strokeDasharray="8, 8"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M 162,260 Q 200,248 206,270 Q 188,280 162,268 Z"
              stroke="#64748B"
              strokeWidth={4}
              strokeDasharray="7, 7"
              fill="none"
              strokeLinecap="round"
            />
          </>
        );
        break;

      case 'car':
        guideOutlineJsx = (
          <>
            <Path
              d="M 85,150 L 120,90 L 200,90 L 235,150 Z"
              stroke="#64748B"
              strokeWidth={4.5}
              strokeDasharray="8, 8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M 45,150 L 275,150 Q 285,150 285,170 L 285,200 Q 285,210 275,210 L 245,210 C 245,182 195,182 195,210 L 125,210 C 125,182 75,182 75,210 L 45,210 Q 35,210 35,200 L 35,170 Q 35,150 45,150 Z"
              stroke="#64748B"
              strokeWidth={4.5}
              strokeDasharray="8, 8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle cx={100} cy={210} r={24} stroke="#64748B" strokeWidth={4.5} strokeDasharray="8, 8" fill="none" />
            <Circle cx={220} cy={210} r={24} stroke="#64748B" strokeWidth={4.5} strokeDasharray="8, 8" fill="none" />
          </>
        );
        break;

      case 'house':
        guideOutlineJsx = (
          <>
            <Path
              d="M 50,145 L 160,55 L 270,145 Z"
              stroke="#64748B"
              strokeWidth={4.5}
              strokeDasharray="8, 8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M 72,145 L 72,275 L 248,275 L 248,145"
              stroke="#64748B"
              strokeWidth={4.5}
              strokeDasharray="8, 8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M 135,275 L 135,200 L 185,200 L 185,275"
              stroke="#64748B"
              strokeWidth={4}
              strokeDasharray="7, 7"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Rect
              x={92}
              y={175}
              width={32}
              height={32}
              rx={4}
              stroke="#64748B"
              strokeWidth={4}
              strokeDasharray="6, 6"
              fill="none"
            />
          </>
        );
        break;

      case 'butterfly':
        guideOutlineJsx = (
          <>
            <Ellipse
              cx={160}
              cy={165}
              rx={10}
              ry={52}
              stroke="#64748B"
              strokeWidth={4.5}
              strokeDasharray="8, 8"
              fill="none"
            />
            <Circle cx={160} cy={100} r={14} stroke="#64748B" strokeWidth={4} strokeDasharray="7, 7" fill="none" />
            <Path
              d="M 152,130 C 85,80 45,140 152,180"
              stroke="#64748B"
              strokeWidth={4.5}
              strokeDasharray="8, 8"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M 168,130 C 235,80 275,140 168,180"
              stroke="#64748B"
              strokeWidth={4.5}
              strokeDasharray="8, 8"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M 152,180 C 95,210 110,250 155,210"
              stroke="#64748B"
              strokeWidth={4}
              strokeDasharray="7, 7"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M 168,180 C 225,210 210,250 165,210"
              stroke="#64748B"
              strokeWidth={4}
              strokeDasharray="7, 7"
              fill="none"
              strokeLinecap="round"
            />
          </>
        );
        break;

      case 'fish':
        guideOutlineJsx = (
          <>
            <Path
              d="M 230,160 C 180,85 75,105 45,160 C 75,215 180,235 230,160 Z"
              stroke="#64748B"
              strokeWidth={4.5}
              strokeDasharray="9, 9"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M 225,160 L 275,115 L 260,160 L 275,205 Z"
              stroke="#64748B"
              strokeWidth={4.5}
              strokeDasharray="8, 8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle cx={85} cy={148} r={6} stroke="#64748B" strokeWidth={3.5} strokeDasharray="4, 4" fill="none" />
          </>
        );
        break;

      default:
        break;
    }

    return (
      <>
        {guideOutlineJsx}

        {/* Dynamic Interactive Target Dots with sequential guidance & suggestion hints */}
        {targetDots.map((dot) => {
          const isHit = coveredIdsRef.current.has(dot.id);
          const isCurrentTarget = currentTargetDot?.id === dot.id;
          const isSuggestion = suggestionDots.some((s) => s.id === dot.id);

          if (isCurrentTarget) {
            // Immediate Target Dot: Highlighted Emerald Green with Pulsing Halo Ring
            return (
              <React.Fragment key={`target-dot-${dot.id}`}>
                <Circle
                  cx={dot.x}
                  cy={dot.y}
                  r={11}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  strokeDasharray="4, 3"
                  opacity={0.95}
                />
                <Circle
                  cx={dot.x}
                  cy={dot.y}
                  r={7}
                  fill="#059669"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              </React.Fragment>
            );
          }

          if (isSuggestion) {
            // Suggestion Dots Ahead: Electric Blue (2-3 dots ahead showing direction)
            return (
              <React.Fragment key={`target-dot-${dot.id}`}>
                <Circle
                  cx={dot.x}
                  cy={dot.y}
                  r={8.5}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  strokeDasharray="3, 3"
                  opacity={0.85}
                />
                <Circle
                  cx={dot.x}
                  cy={dot.y}
                  r={5.5}
                  fill="#2563EB"
                  stroke="#DBEAFE"
                  strokeWidth={1.5}
                />
              </React.Fragment>
            );
          }

          if (isHit) {
            // Completed Hit Dot: Solid Emerald Green
            return (
              <Circle
                key={`target-dot-${dot.id}`}
                cx={dot.x}
                cy={dot.y}
                r={6}
                fill="#10B981"
                stroke="#FFFFFF"
                strokeWidth={1.8}
                opacity={1}
              />
            );
          }

          // Future Unreached Dot: Soft Slate Grey
          return (
            <Circle
              key={`target-dot-${dot.id}`}
              cx={dot.x}
              cy={dot.y}
              r={4.5}
              fill="#64748B"
              stroke="#F8FAFC"
              strokeWidth={1}
              opacity={0.55}
            />
          );
        })}

        {/* Start Point Dot - visible when tracing has not yet begun */}
        {coveredCount === 0 && (
          <Circle
            cx={activeShape.startPoint.x}
            cy={activeShape.startPoint.y}
            r={9}
            fill="#059669"
            stroke="#6EE7B7"
            strokeWidth={3}
          />
        )}

        {/* Live Active Eraser Indicator Circle */}
        {eraserPreview && (
          <Circle
            cx={eraserPreview.x}
            cy={eraserPreview.y}
            r={18}
            fill="rgba(239, 68, 68, 0.15)"
            stroke="#EF4444"
            strokeWidth={2}
            strokeDasharray="4, 4"
          />
        )}
      </>
    );
  };

  const progressPct =
    targetDots.length > 0 ? Math.min(100, Math.round((coveredCount / targetDots.length) * 100)) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={
          activeLang === 'gu'
            ? 'ડ્રોઇંગ પેડ'
            : activeLang === 'hi'
            ? 'ड्राइंग पैड'
            : 'Drawing Pad'
        }
        showBack={true}
        backHref="/home"
      />

      <View style={styles.container}>
        {/* ==================== 1. TOP CONTROLS ==================== */}
        <View style={[styles.controlBar, shadows.soft]}>
          {/* Row A: Shape Selector with Friendly Labels */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.controlSectionLabel}>
              {activeLang === 'gu'
                ? 'દોરવા માટે આકાર પસંદ કરો:'
                : activeLang === 'hi'
                ? 'ट्रेस करने के लिए आकार चुनें:'
                : 'Choose shape to trace:'}
            </Text>
            {selectedShape !== 'blank' && (
              <View style={styles.startHintBadge}>
                <Text style={styles.startHintText}>
                  {activeLang === 'gu'
                    ? activeShape.startHintGu
                    : activeLang === 'hi'
                    ? activeShape.startHintHi
                    : activeShape.startHintEn}
                </Text>
              </View>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shapeScrollContainer}
            nestedScrollEnabled={true}
            directionalLockEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {TRACE_SHAPES.map((shape) => {
              const isSelected = selectedShape === shape.id;
              const shapeName =
                activeLang === 'gu'
                  ? shape.nameGu
                  : activeLang === 'hi'
                  ? shape.nameHi
                  : shape.nameEn;
              return (
                <TouchableOpacity
                  key={shape.id}
                  style={[styles.shapePill, isSelected && styles.shapePillActive]}
                  onPress={() => handleSelectShape(shape)}
                  activeOpacity={0.8}
                >
                  <View style={styles.shapePillEmoji}>{React.createElement(SHAPE_ART[shape.id] ?? Art.PencilArt, { size: 24 })}</View>
                  <Text
                    style={[styles.shapePillText, isSelected && styles.shapePillTextActive]}
                  >
                    {shapeName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Row B: Clean Color Dots & Action Tools */}
          <View style={styles.toolsRow}>
            {/* Colors */}
            <View style={styles.paletteRow}>
              {SIMPLE_COLORS.map((color) => {
                const isSelected = selectedColor === color && !isEraser;
                return (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color },
                      isSelected && styles.colorCircleSelected,
                    ]}
                    onPress={() => {
                      setIsEraser(false);
                      setSelectedColor(color);
                      soundEffects.playBubblePop();
                    }}
                    activeOpacity={0.8}
                  />
                );
              })}
            </View>

            {/* Tool Toggles & Actions */}
            <View style={styles.actionToolsRow}>
              {/* Eraser */}
              <TouchableOpacity
                style={[styles.toolBtn, isEraser && styles.toolBtnActive]}
                onPress={() => {
                  soundEffects.playBubblePop();
                  setIsEraser(!isEraser);
                }}
              >
                <EraserIcon size={14} color="#1E293B" />
                <Text style={styles.toolBtnText}>
                  {activeLang === 'gu' ? 'રબર' : activeLang === 'hi' ? 'रबर' : 'Eraser'}
                </Text>
              </TouchableOpacity>

              {/* Undo */}
              <TouchableOpacity
                style={styles.toolBtn}
                onPress={handleUndo}
                disabled={strokes.length === 0}
              >
                <View style={[styles.toolInner, strokes.length === 0 && { opacity: 0.4 }]}>
                  <UndoIcon size={14} color="#1E293B" />
                  <Text style={styles.toolBtnText}>
                    {activeLang === 'gu' ? 'પાછા' : activeLang === 'hi' ? 'वापस' : 'Undo'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Clear */}
              <TouchableOpacity style={styles.toolBtn} onPress={handleClear}>
                <TrashIcon size={14} color="#1E293B" />
                <Text style={styles.toolBtnText}>
                  {activeLang === 'gu' ? 'સાફ' : activeLang === 'hi' ? 'साफ' : 'Clear'}
                </Text>
              </TouchableOpacity>

              {/* Done / Rate */}
              <TouchableOpacity style={[styles.toolBtn, styles.doneBtn]} onPress={handleEvaluateAndRate}>
                <Glyph name="sparkle" size={13} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.doneBtnText}>
                  {activeLang === 'gu' ? 'પૂરું!' : activeLang === 'hi' ? 'पूर्ण!' : 'Done!'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ==================== 2. DOTTED TRACE CANVAS ==================== */}
        <View style={[styles.canvasCard, shadows.card]}>
          {/* Subtle guide instruction badge at top of canvas */}
          {selectedShape !== 'blank' && (
            <View style={styles.canvasGuidePromptRow}>
              <View style={[styles.canvasGuidePrompt, styles.rowCenter]}>
                <PencilIcon size={13} color="#334155" />
                <Text style={styles.canvasGuidePromptText}>
                  {activeLang === 'gu'
                    ? 'લીલા ટપકાથી શરૂ કરી ટપકાં (dots) જોડો!'
                    : activeLang === 'hi'
                    ? 'हरे बिंदु से शुरू कर डॉट्स को जोड़ें!'
                    : 'Start at the green dot & trace the dots!'}
                </Text>
              </View>

              {/* Live Dot Tracking Indicator & Stars */}
              {targetDots.length > 0 && (
                <View style={styles.liveProgressBadge}>
                  <View style={styles.liveProgressBarTrack}>
                    <View
                      style={[
                        styles.liveProgressBarFill,
                        {
                          width: `${progressPct}%`,
                          backgroundColor:
                            progressPct >= 75
                              ? '#10B981'
                              : progressPct >= 45
                              ? '#F59E0B'
                              : '#3B82F6',
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.rowCenter}>
                    <Glyph name="star" size={12} color="#F59E0B" strokeWidth={1.5} />
                    <Text style={styles.liveProgressText}>
                      {coveredCount}/{targetDots.length} ({progressPct}%)
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Svg Layer: Background Dotted Guide + User Drawn Vector Strokes */}
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Svg viewBox="0 0 320 320" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
              {/* LAYER 1: Background Pale Yellow Guide Shading (Never Erased) */}
              {renderDottedGuide('background')}

              {/* LAYER 2: Child's Drawn Strokes */}
              {strokes.map((s) => (
                <Path
                  key={s.id}
                  d={s.d}
                  stroke={s.color}
                  strokeWidth={s.size}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* Live Active Drawing Stroke (only when drawing in color) */}
              {currentD ? (
                <Path
                  d={currentD}
                  stroke={selectedColor}
                  strokeWidth={brushSize}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}

              {/* LAYER 3: Persistent Foreground Guide Outline, Target Dots & Start Point */}
              {renderDottedGuide('foreground')}
            </Svg>
          </View>

          {/* Interactive Touch Layer: 100% responsive gesture tracking aligned with SVG */}
          <View
            ref={canvasRef}
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(255, 255, 255, 0.01)', zIndex: 10 },
            ]}
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              if (width > 0 && height > 0) {
                canvasLayoutRef.current.width = width;
                canvasLayoutRef.current.height = height;
              }
            }}
            {...panResponder.panHandlers}
            collapsable={false}
          />
        </View>

        {/* ==================== 3. 3-STAR RATING CELEBRATION MODAL ==================== */}
        {ratingResult && (
          <View style={styles.modalOverlay}>
            <View style={[styles.ratingCard, shadows.card]}>
              {/* Celebration Emojis */}
              <View style={[styles.ratingEmojiBanner, styles.rowCenter]}>
                <Art.PaletteArt size={52} />
                <Art.StarArt size={44} />
              </View>

              {/* Title */}
              <Text style={styles.ratingTitle}>{ratingResult.title}</Text>
              <Text style={styles.ratingSubtitle}>{ratingResult.subtitle}</Text>

              {/* Big 3-Star Rating Display */}
              <View style={styles.starsRow}>
                {[1, 2, 3].map((starNum) => {
                  const isFilled = starNum <= ratingResult.stars;
                  return (
                    <View
                      key={starNum}
                      style={[
                        styles.starBadge,
                        isFilled ? styles.starBadgeFilled : styles.starBadgeEmpty,
                      ]}
                    >
                      <View style={!isFilled && styles.starEmojiEmpty}>
                        {isFilled ? <Art.StarArt size={48} /> : <Glyph name="star" size={34} color="#CBD5E1" strokeWidth={1.5} />}
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Rating Label */}
              <View style={styles.ratingStatsBox}>
                <View style={[styles.ratingScorePill, styles.rowCenter]}>
                <TargetIcon size={14} color="#059669" />
                <Text style={[styles.ratingScorePill, styles.pillTextReset]}>
                  {activeLang === 'gu'
                    ? `${ratingResult.coveredCount} / ${ratingResult.totalCount} ટપકાં જોડાયા (${ratingResult.percentage}%)`
                    : activeLang === 'hi'
                    ? `${ratingResult.coveredCount} / ${ratingResult.totalCount} डॉट्स जुड़े (${ratingResult.percentage}%)`
                    : `${ratingResult.coveredCount} / ${ratingResult.totalCount} Dots Connected (${ratingResult.percentage}%)`}
                </Text>
                </View>

                {ratingResult.earnedStars > 0 && (
                  <View style={styles.rowCenter}>
                    <Glyph name="star" size={14} color="#F59E0B" strokeWidth={1.5} />
                    <Text style={styles.ratingRewardText}>
                      +{ratingResult.earnedStars}{' '}
                      {activeLang === 'gu'
                        ? 'સ્ટાર્સ ઉમેરાયા!'
                        : activeLang === 'hi'
                        ? 'स्टार्स मिले!'
                        : 'Stars Added!'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.modalButtonsRow}>
                {/* 1. Next Shape */}
                {selectedShape !== 'blank' && (
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalPrimaryBtn]}
                    onPress={handleNextShape}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalPrimaryBtnText}>
                      {activeLang === 'gu'
                        ? 'આગળનો આકાર'
                        : activeLang === 'hi'
                        ? 'अगला आकार'
                        : 'Next Shape'}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* 2. Trace Again */}
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalSecondaryBtn]}
                  onPress={handleTraceAgain}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalSecondaryBtnText}>
                    {activeLang === 'gu' ? 'ફરી ટ્રેસ કરો' : activeLang === 'hi' ? 'फिर से ट्रेस करें' : 'Trace Again'}
                  </Text>
                </TouchableOpacity>

                {/* 3. Keep Drawing */}
                <TouchableOpacity
                  style={styles.modalTextBtn}
                  onPress={() => setRatingResult(null)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalTextBtnLabel}>
                    {activeLang === 'gu' ? 'ચિત્રમાં રંગ પૂરો / જુઓ' : activeLang === 'hi' ? 'चित्र देखें' : 'Keep Drawing'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  container: {
    flex: 1,
    padding: spacing.sm + 2,
  },

  /* 1. TOP CONTROL BAR */
  controlBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  controlSectionLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  startHintBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  startHintText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },

  /* Horizontal Shape Selector */
  shapeScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    gap: 6,
  },
  shapePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 5,
  },
  shapePillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
    borderBottomWidth: 3,
  },
  shapePillEmoji: {
    width: 24,
    height: 24,
    marginRight: 4,
  },
  shapePillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  shapePillTextActive: {
    color: '#1D4ED8',
    fontWeight: '700',
  },

  /* Tools & Colors Row */
  toolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexWrap: 'wrap',
    gap: 8,
  },
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  colorCircleSelected: {
    borderColor: '#0F172A',
    transform: [{ scale: 1.25 }],
    borderWidth: 2.5,
  },

  actionToolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
  },
  toolBtnActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  toolBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  doneBtn: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  doneBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* 2. CANVAS CARD */
  canvasCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
    position: 'relative',
  },
  canvasGuidePromptRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    zIndex: 10,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  canvasGuidePrompt: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  canvasGuidePromptText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  liveProgressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  liveProgressBarTrack: {
    width: 65,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  liveProgressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  liveProgressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },

  /* 3. 3-STAR RATING CELEBRATION MODAL OVERLAY */
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: spacing.md,
  },
  ratingCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 3.5,
    borderColor: '#FCD34D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  ratingEmojiBanner: {
    marginBottom: 8,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  toolInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pillTextReset: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  ratingTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  ratingSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 16,
  },

  /* Big 3 Stars Row */
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  starBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  starBadgeFilled: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    transform: [{ scale: 1.08 }],
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  starBadgeEmpty: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  starEmojiEmpty: {
    opacity: 0.25,
  },

  /* Stats Box */
  ratingStatsBox: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  ratingScorePill: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  ratingRewardText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },

  /* Action Buttons */
  modalButtonsRow: {
    width: '100%',
    gap: 10,
    alignItems: 'center',
  },
  modalBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryBtn: {
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  modalPrimaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSecondaryBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  modalSecondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  modalTextBtn: {
    paddingVertical: 6,
  },
  modalTextBtnLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
});
