/**
 * RvCal money control — tall hit area + velocity steps
 * Slow $1,000 · Medium $5,000 · Fast $10,000
 *
 * Drop in: components/feature/PriceMoneySlider.tsx
 * Wire in app/(tabs)/rvcal.tsx in place of PriceSlider.
 */
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';

const SCREEN_W = Dimensions.get('window').width;
const TRACK_W = SCREEN_W - 32 - 32 - 32;

const PRICE_MIN = 0;
const PRICE_MAX = 500_000;

const STEP_SLOW = 1_000;
const STEP_MED = 5_000;
const STEP_FAST = 10_000;

const V_MED = 0.45; // px/ms
const V_FAST = 1.1;
const PX_PER_STEP = 18;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function snap(n: number, step: number) {
  return clamp(Math.round(n / step) * step, PRICE_MIN, PRICE_MAX);
}

function stepFromVelocity(v: number) {
  const a = Math.abs(v);
  if (a >= V_FAST) return STEP_FAST;
  if (a >= V_MED) return STEP_MED;
  return STEP_SLOW;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

type Props = {
  value: number;
  onChange: (v: number) => void;
  /** Optional label shown above the drum */
  label?: string;
  min?: number;
  max?: number;
};

/**
 * Tall vertical money wheel — designed so the finger has room to drag
 * without fighting the parent ScrollView.
 */
export function PriceMoneySlider({
  value,
  onChange,
  label = 'Swipe to set amount',
  min = PRICE_MIN,
  max = PRICE_MAX,
}: Props) {
  const valueRef = useRef(value);
  valueRef.current = value;
  const [live, setLive] = useState(value);
  const [stepHint, setStepHint] = useState(STEP_SLOW);
  const [active, setActive] = useState(false);

  const lastY = useRef(0);
  const lastT = useRef(0);
  const accum = useRef(0);
  const samples = useRef<{ y: number; t: number }[]>([]);

  const commit = (next: number, step: number) => {
    const snapped = snap(next, step);
    if (snapped === valueRef.current) return;
    valueRef.current = snapped;
    setLive(snapped);
    onChange(snapped);
  };

  const applyDelta = (dy: number, dt: number) => {
    const velocity = Math.abs(dy) / Math.max(8, dt);
    const step = stepFromVelocity(velocity);
    setStepHint(step);
    // Finger up → amount up (iOS-style)
    accum.current -= dy;
    const unit =
      step === STEP_FAST ? PX_PER_STEP * 0.7 : step === STEP_MED ? PX_PER_STEP * 0.85 : PX_PER_STEP;
    while (Math.abs(accum.current) >= unit) {
      const dir = accum.current > 0 ? 1 : -1;
      accum.current -= dir * unit;
      const next = valueRef.current + dir * step;
      if (next < min || next > max) {
        accum.current = 0;
        commit(clamp(next, min, max), step);
        break;
      }
      commit(next, step);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        setActive(true);
        lastY.current = evt.nativeEvent.pageY;
        lastT.current = Date.now();
        accum.current = 0;
        samples.current = [{ y: evt.nativeEvent.pageY, t: Date.now() }];
      },
      onPanResponderMove: (evt) => {
        const y = evt.nativeEvent.pageY;
        const now = Date.now();
        const dy = y - lastY.current;
        const dt = now - lastT.current;
        applyDelta(dy, dt);
        lastY.current = y;
        lastT.current = now;
        samples.current.push({ y, t: now });
        while (samples.current.length > 2 && now - samples.current[0]!.t > 80) {
          samples.current.shift();
        }
      },
      onPanResponderRelease: () => {
        setActive(false);
        accum.current = 0;
        setStepHint(STEP_SLOW);
        const cleaned = snap(valueRef.current, STEP_SLOW);
        if (cleaned !== valueRef.current) commit(cleaned, STEP_SLOW);
      },
      onPanResponderTerminate: () => {
        setActive(false);
        accum.current = 0;
        setStepHint(STEP_SLOW);
      },
    }),
  ).current;

  // Keep live in sync when parent sets value from presets / text
  if (value !== live && !active) {
    // schedule soft sync without breaking controlled mode
    if (Math.abs(value - live) > 0) {
      setTimeout(() => setLive(value), 0);
    }
  }

  const above = snap(Math.max(min, live - stepHint), stepHint);
  const below = snap(Math.min(max, live + stepHint), stepHint);
  const stepLabel =
    stepHint >= STEP_FAST
      ? `Fast · $${fmt(STEP_FAST)}`
      : stepHint >= STEP_MED
        ? `Medium · $${fmt(STEP_MED)}`
        : `Slow · $${fmt(STEP_SLOW)}`;

  const PRESETS = [10, 50, 100, 150, 200, 250, 300, 400, 500];

  return (
    <View style={styles.wrap}>
      <View style={styles.hintRow}>
        <Text style={styles.hint}>{label}</Text>
        <Text style={styles.stepHint}>{stepLabel}</Text>
      </View>

      {/* Tall drum — more finger room, captures gesture from parent ScrollView */}
      <View
        style={[styles.drum, active && styles.drumActive]}
        {...panResponder.panHandlers}
      >
        <View style={styles.centerBand} pointerEvents="none" />
        <Text style={styles.neighbor}>
          {above !== live ? `$${fmt(above)}` : ' '}
        </Text>
        <Text style={styles.center}>${fmt(live)}</Text>
        <Text style={styles.neighbor}>
          {below !== live ? `$${fmt(below)}` : ' '}
        </Text>
      </View>

      <Text style={styles.legend}>
        Slow ${fmt(STEP_SLOW)} · Med ${fmt(STEP_MED)} · Fast ${fmt(STEP_FAST)}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.presetRow}
      >
        {PRESETS.map((p) => {
          const activeChip = Math.round(live / 1000) === p;
          return (
            <Pressable
              key={p}
              style={[styles.chip, activeChip && styles.chipActive]}
              onPress={() => {
                const next = clamp(p * 1000, min, max);
                valueRef.current = next;
                setLive(next);
                onChange(next);
              }}
            >
              <Text style={[styles.chipText, activeChip && styles.chipTextActive]}>
                ${p}k
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const ROW = 56;
const DRUM_H = ROW * 3;

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  hintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hint: { fontSize: FontSize.xs, color: Colors.textMuted },
  stepHint: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: '#00E676',
  },
  drum: {
    height: DRUM_H,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(0,200,83,0.40)',
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  drumActive: {
    borderColor: 'rgba(0,230,118,0.75)',
    backgroundColor: 'rgba(0,200,83,0.10)',
  },
  centerBand: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: ROW,
    height: ROW,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.35)',
    backgroundColor: 'rgba(0,200,83,0.12)',
  },
  neighbor: {
    height: ROW,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    fontWeight: FontWeight.semibold,
    color: 'rgba(255,255,255,0.35)',
    lineHeight: ROW,
  },
  center: {
    height: ROW,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 28,
    fontWeight: FontWeight.extrabold,
    color: '#00E676',
    lineHeight: ROW,
  },
  legend: {
    fontSize: 10,
    color: Colors.textDim,
    textAlign: 'center',
  },
  presetRow: { flexDirection: 'row', gap: Spacing.xs, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgCardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: '#00C853',
    borderColor: '#00A844',
  },
  chipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  chipTextActive: { color: '#000' },
});

export default PriceMoneySlider;
