import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  GestureResponderEvent,
  Platform,
  Dimensions,
  useWindowDimensions,
  PanResponderGestureState,
  type PointerEvent
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../theme/colors';
import { radii, spacing, shadows } from '../theme/spacing';
import { soundEffects } from '../services/soundEffects';
import { toGujDigits, toHiDigits } from '../utils/languageData';

interface Point {
  x: number;
  y: number;
  color: string;
}

interface Stroke {
  d: string;
  color: string;
}

interface TracingCanvasProps {
  symbol: string;
  onTraceComplete?: (result: { pct: number; stars: number }) => void;
  language?: string;
}

/**
 * Converts a sequence of points into a butter-smooth quadratic Bézier SVG path.
 * Eliminates jagged joints and gaps while ensuring rounded caps and joins.
 */
/** Splits the flat point log into one array per finger-down stroke using recorded start indices. */
function splitIntoStrokes<T>(pts: T[], starts: number[]): T[][] {
  if (starts.length <= 1) return [pts];
  const out: T[][] = [];
  for (let i = 0; i < starts.length; i++) {
    const seg = pts.slice(starts[i], i + 1 < starts.length ? starts[i + 1] : pts.length);
    if (seg.length > 0) out.push(seg);
  }
  return out.length > 0 ? out : [pts];
}

function pointsToSmoothSvgPath(pts: { x: number; y: number }[]): string {
  if (!pts || pts.length === 0) return '';
  if (pts.length === 1) {
    return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} L ${(pts[0].x + 0.1).toFixed(1)} ${(pts[0].y + 0.1).toFixed(1)}`;
  }
  if (pts.length === 2) {
    return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} L ${pts[1].x.toFixed(1)} ${pts[1].y.toFixed(1)}`;
  }

  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    d += ` Q ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  return d;
}

import {
  buildReferenceGlyphData,
  evaluateTracingAccuracy,
  ReferenceGlyphData,
  TracingEvaluationResult,
} from '../utils/tracingEngine';
import type { TimerHandle } from '../utils/runtime';
import { webStyle, webDomNode, type WebClientPoint } from '../utils/webStyle';

// Safe requestAnimationFrame / cancelAnimationFrame cross-platform helpers
type FrameHandle = number | TimerHandle;
const hasRaf = typeof requestAnimationFrame === 'function' && typeof cancelAnimationFrame === 'function';
const requestFrame = (cb: () => void): FrameHandle => (hasRaf ? requestAnimationFrame(cb) : setTimeout(cb, 16));
const cancelFrame = (id: FrameHandle): void => {
  if (hasRaf && typeof id === 'number') cancelAnimationFrame(id);
  else clearTimeout(id as TimerHandle);
};

export const TracingCanvas: React.FC<TracingCanvasProps> = ({
  symbol,
  onTraceComplete,
  language = 'gu',
}) => {
  const [points, setPoints] = useState<Point[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const [activeColor, setActiveColor] = useState<string>(colors.accent);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [livePct, setLivePct] = useState<number>(0);
  const [liveStars, setLiveStars] = useState<number>(0);
  const { width: viewportWidth } = useWindowDimensions();
  const isNarrow = viewportWidth < 360;
  const targetCanvasHeight = isNarrow ? 260 : 350;
  const [canvasDims, setCanvasDims] = useState<{ width: number; height: number }>(() => {
    const winWidth = Dimensions.get('window').width;
    const initialW = Math.max(180, Math.min(600, Math.round(winWidth - 48)));
    return {
      width: initialW,
      height: targetCanvasHeight,
    };
  });
  // PanResponder handlers are created once (first render); read the live size through a ref so
  // coordinate clamping follows onLayout / rotation instead of the initial estimate.
  const canvasDimsRef = useRef(canvasDims);
  canvasDimsRef.current = canvasDims;

  // Reference glyph data computed synchronously during render:
  // Guarantees guide paths and coordinates ALWAYS match canvasDims on first paint.
  const targetData = useMemo(() => {
    return buildReferenceGlyphData(symbol, canvasDims.width, canvasDims.height, undefined, language);
  }, [symbol, canvasDims.width, canvasDims.height, language]);

  // Keep ref synchronized synchronously for PanResponder / touch closures
  const targetDataRef = useRef<ReferenceGlyphData>(targetData);
  targetDataRef.current = targetData;

  // Live refs to avoid closure stale state
  const pointsRef = useRef<Point[]>([]);
  pointsRef.current = points;

  const activeStrokePtsRef = useRef<Point[]>([]);
  // Index in pointsRef where each finger-down stroke begins, so the evaluator never bridges lifts.
  const strokeStartsRef = useRef<number[]>([]);

  const activeColorRef = useRef<string>(activeColor);
  activeColorRef.current = activeColor;

  const completedRef = useRef<boolean>(false);
  completedRef.current = isCompleted;

  const onTraceCompleteRef = useRef(onTraceComplete);
  onTraceCompleteRef.current = onTraceComplete;

  const canvasRef = useRef<React.ComponentRef<typeof View>>(null);
  const lastPtRef = useRef<{ x: number; y: number } | null>(null);
  const lastThrottleTimeRef = useRef<number>(0);
  const hintTimerRef = useRef<TimerHandle | null>(null);
  const rafIdRef = useRef<FrameHandle | null>(null);

  const scheduleStrokeRender = (color: string) => {
    if (rafIdRef.current === null) {
      rafIdRef.current = requestFrame(() => {
        rafIdRef.current = null;
        if (activeStrokePtsRef.current.length > 0) {
          const smoothD = pointsToSmoothSvgPath(activeStrokePtsRef.current);
          const stroke = { d: smoothD, color };
          currentStrokeRef.current = stroke;
          setCurrentStroke(stroke);
        }
      });
    }
  };

  // Clean up hint timer and RAF on unmount
  useEffect(() => {
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      if (rafIdRef.current !== null) {
        cancelFrame(rafIdRef.current);
      }
    };
  }, []);

  // Reset state when symbol changes
  useEffect(() => {
    setPoints([]);
    pointsRef.current = [];
    strokeStartsRef.current = [];
    setStrokes([]);
    setCurrentStroke(null);
    currentStrokeRef.current = null;
    activeStrokePtsRef.current = [];
    setIsCompleted(false);
    completedRef.current = false;
    setLivePct(0);
    setLiveStars(0);
    lastPtRef.current = null;
  }, [symbol]);

  /**
   * Strictly evaluates user tracing using geometric path coverage & segment validation.
   * Progress advances smoothly and continuously without artificial jumps.
   */
  const checkCompletion = (pts: Point[]): { isComplete: boolean; pct: number; stars: number; status: string } => {
    if (!pts || pts.length < 5 || targetDataRef.current.totalReferencePoints === 0) {
      return { isComplete: false, pct: 0, stars: 0, status: 'empty' };
    }
    const evalResult: TracingEvaluationResult = evaluateTracingAccuracy(
      splitIntoStrokes(pts, strokeStartsRef.current),
      targetDataRef.current
    );
    return {
      isComplete: evalResult.isComplete,
      pct: evalResult.accuracy,
      stars: evalResult.stars,
      status: evalResult.status,
    };
  };

  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  // Palm / second-finger rejection state (native): true while more than one finger is down.
  const multiTouchRef = useRef(false);
  // Web: only the first pointer draws; extra fingers or a resting palm are ignored.
  const activePointerIdRef = useRef<number | null>(null);

  // Accurate touch position calculation immune to offsets on Web/Expo/Mobile
  const getTouchCoords = (
    evt: GestureResponderEvent,
    gestureState?: PanResponderGestureState,
    isGrant = false
  ) => {
    let relX: number | undefined;
    let relY: number | undefined;
    const { width, height } = canvasDimsRef.current;

    // 1. Web browser client bounds calculation (accounts for devicePixelRatio, CSS scaling, border offsets)
    if (Platform.OS === 'web' && canvasRef.current) {
      const node = webDomNode(canvasRef.current);
      if (node) {
        const rect = node.getBoundingClientRect();
        const web = evt.nativeEvent as typeof evt.nativeEvent & WebClientPoint;
        const clientX = web.clientX ?? web.touches?.[0]?.clientX ?? evt.nativeEvent.pageX;
        const clientY = web.clientY ?? web.touches?.[0]?.clientY ?? evt.nativeEvent.pageY;

        if (clientX !== undefined && clientY !== undefined) {
          const borderL = node.clientLeft || 0;
          const borderT = node.clientTop || 0;
          relX = clientX - rect.left - borderL;
          relY = clientY - rect.top - borderT;
        }
      }
    }

    // 2. Mobile Device (Android / iOS):
    // Dedicated touch overlay has zero child elements and collapsable={false}.
    // locationX / locationY on grant is the exact local coordinate inside this canvas view.
    if (relX === undefined || relY === undefined) {
      if (isGrant) {
        relX = evt.nativeEvent.locationX ?? 0;
        relY = evt.nativeEvent.locationY ?? 0;
        touchStartRef.current = { x: relX, y: relY };
      } else {
        // On move, use accumulated displacement (dx, dy) from touchStart.
        // dx and dy are pure density-independent points, completely immune
        // to status bar, headers, navigation bar, and window insets.
        relX = touchStartRef.current.x + (gestureState?.dx ?? 0);
        relY = touchStartRef.current.y + (gestureState?.dy ?? 0);
      }
    }

    return {
      x: Math.max(0, Math.min(width, relX)),
      y: Math.max(0, Math.min(height, relY)),
    };
  };

  const startStrokeAt = (x: number, y: number) => {
    const color = activeColorRef.current;
    lastPtRef.current = { x, y };
    activeStrokePtsRef.current = [{ x, y, color }];

    const initD = pointsToSmoothSvgPath(activeStrokePtsRef.current);
    const initStroke: Stroke = { d: initD, color };
    currentStrokeRef.current = initStroke;
    setCurrentStroke(initStroke);

    if (pointsRef.current.length < 3500) {
      strokeStartsRef.current.push(pointsRef.current.length);
      pointsRef.current.push({ x, y, color });
    }
    setPoints([...pointsRef.current]);
  };

  const moveStrokeAt = (x: number, y: number) => {
    const color = activeColorRef.current;
    const lastPt = lastPtRef.current;

    const newPts: Point[] = [];
    if (lastPt) {
      const dist = Math.hypot(x - lastPt.x, y - lastPt.y);
      // Low-end digitizer jitter filter: ignore micro displacements under 1.5px
      if (dist < 1.5) {
        return;
      }
      if (dist >= 2.5) {
        const steps = Math.min(10, Math.floor(dist / 3.0));
        for (let s = 1; s <= steps; s++) {
          newPts.push({
            x: lastPt.x + (x - lastPt.x) * (s / (steps + 1)),
            y: lastPt.y + (y - lastPt.y) * (s / (steps + 1)),
            color,
          });
        }
      }
    }
    newPts.push({ x, y, color });
    lastPtRef.current = { x, y };

    activeStrokePtsRef.current.push(...newPts);
    if (pointsRef.current.length < 3500) {
      pointsRef.current.push(...newPts);
    }

    // Schedule path build and SVG paint to run at most once per animation frame (not per touchmove)
    scheduleStrokeRender(color);

    const now = Date.now();
    if (now - lastThrottleTimeRef.current > 40) {
      lastThrottleTimeRef.current = now;
      setPoints([...pointsRef.current]);
      const evalRes = checkCompletion(pointsRef.current);
      setLivePct(evalRes.pct);
      setLiveStars(evalRes.stars);
    }
  };

  const endStrokeAt = () => {
    if (rafIdRef.current !== null) {
      cancelFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (activeStrokePtsRef.current.length > 0) {
      const smoothD = pointsToSmoothSvgPath(activeStrokePtsRef.current);
      const finalized = { d: smoothD, color: activeColorRef.current };
      setStrokes((prev) => [...prev, finalized]);
      currentStrokeRef.current = null;
      setCurrentStroke(null);
      activeStrokePtsRef.current = [];
    }
    lastPtRef.current = null;
    setPoints([...pointsRef.current]);

    const { isComplete, pct, stars } = checkCompletion(pointsRef.current);
    setLivePct(pct);
    setLiveStars(stars);

    if (isComplete && pct >= 95 && !completedRef.current) {
      completedRef.current = true;
      setIsCompleted(true);
      soundEffects.playTadaaa();
      if (onTraceCompleteRef.current) {
        onTraceCompleteRef.current({ pct: 100, stars: 3 });
      }
    }
  };

  const isPointerDownRef = useRef(false);
  /** On react-native-web, `e.nativeEvent` is the DOM PointerEvent (clientX/clientY/pointerId). */
  const getWebPointerCoords = (e: PointerEvent) => {
    const node = webDomNode(canvasRef.current);
    if (node) {
      const rect = node.getBoundingClientRect();
      const { clientX, clientY } = e.nativeEvent;
      const x = Math.max(0, Math.min(canvasDimsRef.current.width, clientX - rect.left - (node.clientLeft || 0)));
      const y = Math.max(0, Math.min(canvasDimsRef.current.height, clientY - rect.top - (node.clientTop || 0)));
      return { x, y };
    }
    return { x: 0, y: 0 };
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        multiTouchRef.current = false;
        if (gestureState.numberActiveTouches > 1) {
          // Two fingers / palm landed together: wait until a single finger remains.
          multiTouchRef.current = true;
          return;
        }
        const { x, y } = getTouchCoords(evt, gestureState, true);
        startStrokeAt(x, y);
      },
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (gestureState.numberActiveTouches > 1) {
          // Palm / second finger: finish the stroke drawn so far and pause drawing. PanResponder's
          // dx/dy keep tracking the centroid of ALL touches, so they can't be trusted until we
          // re-anchor below.
          if (!multiTouchRef.current) {
            multiTouchRef.current = true;
            endStrokeAt();
          }
          return;
        }
        if (multiTouchRef.current) {
          // Back to one finger: re-anchor to its real position (the overlay has no children, so
          // locationX/Y is local to the canvas) and start a fresh stroke. This avoids both a
          // straight "connecting" line and a permanent offset from the palm's movement.
          multiTouchRef.current = false;
          const locX = evt.nativeEvent.locationX ?? 0;
          const locY = evt.nativeEvent.locationY ?? 0;
          touchStartRef.current = { x: locX - (gestureState.dx ?? 0), y: locY - (gestureState.dy ?? 0) };
          const { width, height } = canvasDimsRef.current;
          startStrokeAt(Math.max(0, Math.min(width, locX)), Math.max(0, Math.min(height, locY)));
          return;
        }
        const { x, y } = getTouchCoords(evt, gestureState, false);
        moveStrokeAt(x, y);
      },
      onPanResponderRelease: () => {
        multiTouchRef.current = false;
        endStrokeAt();
      },
      onPanResponderTerminate: () => {
        // Another responder (e.g. a system gesture) took over: close the stroke cleanly.
        multiTouchRef.current = false;
        endStrokeAt();
      },
    })
  ).current;

  const overlayHandlers = Platform.OS === 'web' ? {
    onPointerDown: (e: PointerEvent) => {
      // Only the first finger/pen draws; a resting palm or second finger is ignored.
      if (isPointerDownRef.current) return;
      isPointerDownRef.current = true;
      activePointerIdRef.current = typeof e.nativeEvent.pointerId === 'number' ? e.nativeEvent.pointerId : null;
      const { x, y } = getWebPointerCoords(e);
      startStrokeAt(x, y);
    },
    onPointerMove: (e: PointerEvent) => {
      if (!isPointerDownRef.current) return;
      if (activePointerIdRef.current !== null && e.nativeEvent.pointerId !== activePointerIdRef.current) return;
      const { x, y } = getWebPointerCoords(e);
      moveStrokeAt(x, y);
    },
    onPointerUp: (e: PointerEvent) => {
      if (activePointerIdRef.current !== null && e.nativeEvent.pointerId !== activePointerIdRef.current) return;
      if (isPointerDownRef.current) {
        isPointerDownRef.current = false;
        activePointerIdRef.current = null;
        endStrokeAt();
      }
    },
    onPointerLeave: (e: PointerEvent) => {
      if (activePointerIdRef.current !== null && e.nativeEvent.pointerId !== activePointerIdRef.current) return;
      if (isPointerDownRef.current) {
        isPointerDownRef.current = false;
        activePointerIdRef.current = null;
        endStrokeAt();
      }
    },
    onPointerCancel: (e: PointerEvent) => {
      // Browser took the touch (scroll/zoom gesture): close the stroke instead of leaving it stuck.
      if (activePointerIdRef.current !== null && e.nativeEvent.pointerId !== activePointerIdRef.current) return;
      if (isPointerDownRef.current) {
        isPointerDownRef.current = false;
        activePointerIdRef.current = null;
        endStrokeAt();
      }
    },
  } : panResponder.panHandlers;

  const clearCanvas = () => {
    soundEffects.playBubblePop();
    setPoints([]);
    pointsRef.current = [];
    strokeStartsRef.current = [];
    activeStrokePtsRef.current = [];
    setStrokes([]);
    setCurrentStroke(null);
    currentStrokeRef.current = null;
    setIsCompleted(false);
    completedRef.current = false;
    lastPtRef.current = null;
    setHint(null);
    setLivePct(0);
    setLiveStars(0);
  };

  const [hint, setHint] = useState<string | null>(null);

  const handleManualDone = () => {
    soundEffects.playBubblePop();
    const { pct, stars, status } = checkCompletion(pointsRef.current);
    const effectivePct = Math.max(pct, livePct);
    const effectiveStars = Math.max(stars, liveStars);

    if (effectivePct >= 50) {
      completedRef.current = true;
      setIsCompleted(true);
      soundEffects.playTadaaa();
      if (onTraceCompleteRef.current) {
        onTraceCompleteRef.current({ pct: effectivePct, stars: effectiveStars });
      }
    } else {
      let hintText =
        language === 'gu'
          ? 'હજી થોડું ઘૂંટો! (૫૦% જરૂરી છે ✏️)'
          : language === 'hi'
          ? 'थोड़ा और ट्रेस करें! (५०% जरूरी है ✏️)'
          : 'Keep tracing! (50% needed ✏️)';

      if (status === 'off_track') {
        hintText =
          language === 'gu'
            ? 'ચોક્કસ અક્ષર પર ઘૂંટો ✏️'
            : language === 'hi'
            ? 'अक्षर की रेखा पर ध्यान से ट्रेस करें ✏️'
            : 'Trace carefully on the line ✏️';
      } else if (status === 'missing_stroke') {
        hintText =
          language === 'gu'
            ? 'બાકીનો ભાગ પણ ઘૂંટો ✏️'
            : language === 'hi'
            ? 'बाकी का हिस्सा भी ट्रेस करें ✏️'
            : 'Trace all parts of the character ✏️';
      }

      setHint(hintText);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      hintTimerRef.current = setTimeout(() => setHint(null), 2500);
    }
  };

  const palette = [colors.accent, '#E06B6B', '#4D96FF', '#FFB703', '#9B51E0'];
  const { pct, isComplete, stars } = checkCompletion(points);
  const displayPct = Math.max(pct, livePct);
  const displayStars = Math.max(stars, liveStars);
  const canFinish = displayPct >= 50;

  // Build accurate guide paths directly from reference strokes
  const guideSvgPaths: string[] = useMemo(() => {
    return targetData.strokes?.map((s) => pointsToSmoothSvgPath(s.points)) || [];
  }, [targetData]);

  // PHASE 3: Only display the green starting dot for the CURRENT active stroke.
  // Never show multiple starting dots simultaneously. Reveal next stroke start point
  // only after current stroke reaches completion threshold (>= 55% coverage).
  const guideStartDots: Array<{ x: number; y: number }> = useMemo(() => {
    if (!targetData.strokes || targetData.strokes.length === 0) return [];
    if (targetData.strokes.length === 1) {
      const p = targetData.strokes[0].points[0];
      return p ? [p] : [];
    }

    if (!points || points.length === 0) {
      const p = targetData.strokes[0].points[0];
      return p ? [p] : [];
    }

    const reachSq = 28 * 28;
    for (let sIdx = 0; sIdx < targetData.strokes.length; sIdx++) {
      const stroke = targetData.strokes[sIdx];
      if (!stroke.points || stroke.points.length === 0) continue;

      let hits = 0;
      for (const sp of stroke.points) {
        for (let j = 0; j < points.length; j++) {
          const up = points[j];
          const d2 = (sp.x - up.x) * (sp.x - up.x) + (sp.y - up.y) * (sp.y - up.y);
          if (d2 <= reachSq) {
            hits++;
            break;
          }
        }
      }

      const ratio = hits / stroke.points.length;
      if (ratio < 0.55) {
        // Return ONLY the start point of this first uncompleted stroke
        const p = stroke.points[0];
        return p ? [p] : [];
      }
    }

    // All strokes completed
    return [];
  }, [targetData, points]);

  return (
    <View style={styles.container}>
      {/* Canvas Area */}
      <View
        ref={canvasRef}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          const roundedW = Math.round(width);
          const roundedH = Math.round(height);
          if (roundedW > 50 && roundedH > 50) {
            setCanvasDims((prev) => {
              if (Math.abs(prev.width - roundedW) < 2 && Math.abs(prev.height - roundedH) < 2) {
                return prev;
              }
              return { width: roundedW, height: roundedH };
            });
          }
        }}
        style={[
          styles.canvas,
          isNarrow && styles.canvasNarrow,
          isComplete && styles.canvasComplete,
          shadows.card,
        ]}
      >
        {/* Notebook guide lines */}
        <View pointerEvents="none" style={styles.guideLinesLayer}>
          <View style={styles.guideLineTop} />
          <View style={styles.guideLineMiddle} />
          <View style={styles.guideLineBottom} />
        </View>

        {/* Fallback Font Text in Background only if no vector stroke paths exist */}
        {guideSvgPaths.length === 0 && (
          <View pointerEvents="none" style={styles.guideTextWrapper}>
            <Text
              pointerEvents="none"
              style={[
                styles.guideText,
                { opacity: 0.12 },
                targetData.fontSize
                  ? { fontSize: targetData.fontSize }
                  : null,
              ]}
            >
              {symbol}
            </Text>
          </View>
        )}

        {/* SVG Tracing Guide Track & User Line Layer */}
        {Platform.OS === 'web' ? (
          // Web: a real DOM <svg> (react-native-web renders it directly) for crisp, GPU-cheap strokes.
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            {/* 1. Guide Stroke Layer (Wide Corridor + Dashed Centerline) */}
            {guideSvgPaths.map((d: string, idx: number) => (
              <path
                key={`guide_bg_${idx}`}
                d={d}
                stroke="#E2E8F0"
                strokeWidth={32}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
            {guideSvgPaths.map((d: string, idx: number) => (
              <path
                key={`guide_dash_${idx}`}
                d={d}
                stroke="#94A3B8"
                strokeWidth={2.5}
                strokeDasharray="6,8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}

            {/* 2. Starting Green Indicator Dots */}
            {guideStartDots.map((pt, idx: number) => (
              <circle
                key={`guide_dot_${idx}`}
                cx={pt.x}
                cy={pt.y}
                r={7}
                fill="#10B981"
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            ))}

            {/* 3. Completed User Strokes */}
            {strokes.map((s, idx) => (
              <path
                key={idx}
                d={s.d}
                stroke={s.color}
                strokeWidth={22}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}

            {/* 4. Currently Active User Stroke */}
            {currentStroke && (
              <path
                d={currentStroke.d}
                stroke={currentStroke.color}
                strokeWidth={22}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
          </svg>
        ) : (
          <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* 1. Guide Stroke Layer */}
            {guideSvgPaths.map((d: string, idx: number) => (
              <Path
                key={`guide_bg_${idx}`}
                d={d}
                stroke="#E2E8F0"
                strokeWidth={32}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
            {guideSvgPaths.map((d: string, idx: number) => (
              <Path
                key={`guide_dash_${idx}`}
                d={d}
                stroke="#94A3B8"
                strokeWidth={2.5}
                strokeDasharray="6,8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}

            {/* 2. Starting Green Indicator Dots */}
            {guideStartDots.map((pt, idx: number) => (
              <Circle
                key={`guide_dot_${idx}`}
                cx={pt.x}
                cy={pt.y}
                r={7}
                fill="#10B981"
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            ))}

            {/* 3. Completed User Strokes */}
            {strokes.map((s, idx) => (
              <Path
                key={idx}
                d={s.d}
                stroke={s.color}
                strokeWidth={22}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}

            {/* 4. Currently Active User Stroke */}
            {currentStroke && (
              <Path
                d={currentStroke.d}
                stroke={currentStroke.color}
                strokeWidth={22}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
          </Svg>
        )}

        {/* Progress pill indicator */}
        <View
          pointerEvents="none"
          style={[styles.progressPill, canFinish && styles.progressPillComplete]}
        >
          <Text
            style={[styles.progressPillText, canFinish && styles.progressPillTextComplete]}
          >
            {isComplete && displayPct >= 95
              ? (language === 'gu' ? '૧૦૦% પૂર્ણ ✓ ⭐⭐⭐' : language === 'hi' ? '१००% पूर्ण ✓ ⭐⭐⭐' : '100% Done ✓ ⭐⭐⭐')
              : language === 'gu'
              ? `${toGujDigits(displayPct)}% ઘૂંટાયું ${displayStars > 0 ? (displayStars === 3 ? '⭐⭐⭐' : displayStars === 2 ? '⭐⭐' : '⭐') : ''}`
              : language === 'hi'
              ? `${toHiDigits(displayPct)}% ट्रेस किया ${displayStars > 0 ? (displayStars === 3 ? '⭐⭐⭐' : displayStars === 2 ? '⭐⭐' : '⭐') : ''}`
              : `${displayPct}% Traced ${displayStars > 0 ? (displayStars === 3 ? '⭐⭐⭐' : displayStars === 2 ? '⭐⭐' : '⭐') : ''}`}
          </Text>
        </View>

        {/* Dedicated Touch Overlay with touchAction none */}
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(255, 255, 255, 0.01)', zIndex: 999 },
            webStyle({ touchAction: 'none' }),
          ]}
          {...overlayHandlers}
          collapsable={false}
          pointerEvents="auto"
        />
      </View>

      {/* Encouragement Hint if finished before 60% */}
      {hint && (
        <View style={styles.hintBubble}>
          <Text style={styles.hintText}>{hint}</Text>
        </View>
      )}

      {/* Control bar */}
      <View style={styles.controlsRow}>
        <View style={styles.colorsRow}>
          {palette.map((c, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                soundEffects.playBubblePop();
                setActiveColor(c);
              }}
              style={[
                styles.colorDot,
                { backgroundColor: c },
                activeColor === c && styles.activeColorDot,
              ]}
            />
          ))}
        </View>

        <View style={styles.actionBtnsRow}>
          <TouchableOpacity onPress={clearCanvas} style={styles.clearButton} activeOpacity={0.8}>
            <Text style={styles.clearText}>
              {language === 'gu' ? '🔄 ફરીથી' : language === 'hi' ? '🔄 फिर से' : '🔄 Retry'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleManualDone}
            style={[styles.doneButton, canFinish && styles.doneButtonReady]}
            activeOpacity={0.8}
          >
            <Text style={[styles.doneText, canFinish && styles.doneTextReady]}>
              {canFinish
                ? `✓ ${language === 'gu' ? 'પૂર્ણ' : language === 'hi' ? 'पूर्ण' : 'Done'} ${
                    stars === 3 ? '⭐⭐⭐' : stars === 2 ? '⭐⭐' : '⭐'
                  }`
                : `✓ ${language === 'gu' ? 'ચેક' : language === 'hi' ? 'चेक' : 'Check'}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: spacing.md,
    width: '100%',
  },
  canvas: {
    width: '100%',
    height: 350,
    minHeight: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card,
    borderWidth: 2.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  canvasNarrow: {
    height: 260,
    minHeight: 240,
  },
  canvasComplete: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  guideLinesLayer: {
    ...StyleSheet.absoluteFill,
  },
  guideLineTop: {
    position: 'absolute',
    top: '18%',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderStyle: 'dashed',
  },
  guideLineMiddle: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderStyle: 'dashed',
  },
  guideLineBottom: {
    position: 'absolute',
    top: '82%',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
  },
  guideTextWrapper: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideText: {
    fontFamily: '"Baloo 2", "Noto Sans Gujarati", "Noto Sans Devanagari", sans-serif',
    fontSize: 260,
    fontWeight: '700',
    color: '#CBD5E1',
    textAlign: 'center',
    userSelect: 'none',
  },
  brushDot: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  progressPill: {
    position: 'absolute',
    top: 10,
    right: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressPillComplete: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  progressPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },
  progressPillTextComplete: {
    color: '#15803D',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: spacing.sm + 2,
    paddingHorizontal: spacing.xs,
    flexWrap: 'wrap',
    gap: 8,
  },
  colorsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2.5,
    borderColor: colors.white,
  },
  activeColorDot: {
    borderColor: '#1E293B',
    transform: [{ scale: 1.2 }],
  },
  actionBtnsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radii.sm,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  doneButton: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radii.sm,
  },
  doneButtonReady: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  doneText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4F46E5',
  },
  doneTextReady: {
    color: '#FFFFFF',
  },
  hintBubble: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.full,
    marginTop: 6,
    alignSelf: 'center',
  },
  hintText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
});
