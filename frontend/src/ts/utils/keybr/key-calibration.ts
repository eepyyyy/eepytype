export type KeySample = {
  index: number;
  timeStamp: number;
  hitCount: number;
  missCount: number;
  timeToType: number; // ms per keystroke
  filteredTimeToType: number; // smoothed ms per keystroke
};

export type BigramTransition = {
  fromKey: string;
  toKey: string;
  count: number;
  errorCount: number;
  avgTimeMs: number;
};

export type KeyCalibrationData = {
  char: string;
  samples: KeySample[];
  timeToType: number | null; // ms
  bestTimeToType: number | null; // ms
  speed: number | null; // WPM
  bestSpeed: number | null; // WPM
  confidence: number | null; // Speed-based ratio (0.0 to 1.0+)
  bestConfidence: number | null;
  accuracy: number; // 0.0 to 1.0 (recent accuracy)
  masteryScore: number; // Composite score: speed ratio * accuracy penalty
  totalHits: number;
  totalMisses: number;
  consecutiveMissDrills: number;
  transitions?: Record<
    string,
    { count: number; errors: number; avgTimeMs: number }
  >;
  isIncluded: boolean;
  isFocused: boolean;
  isForced: boolean;
};

export type KeybrSummaryMetrics = {
  speed: { last: number; delta: number };
  accuracy: { last: number; delta: number };
  score: { last: number; delta: number };
};

export type KeybrStreak = {
  level: number; // e.g. 0.95, 1.0
  count: number;
};

export type KeybrDailyGoal = {
  goalSeconds: number;
  spentSeconds: number;
  completedPercent: number;
};

// Convert milliseconds per keystroke to Words Per Minute (assuming 5 chars/word)
export function timeToSpeed(ms: number): number {
  if (ms <= 0) return 0;
  return Math.round(((1000 / ms) * 60) / 5);
}

// Convert WPM to milliseconds per keystroke
export function speedToTime(wpm: number): number {
  if (wpm <= 0) return 1000;
  return 12000 / wpm;
}

export function computeConfidence(
  timeToType: number | null,
  targetWpm: number,
): number | null {
  if (timeToType === null || timeToType <= 0) return null;
  const speed = timeToSpeed(timeToType);
  return Math.min(2.0, Number((speed / targetWpm).toFixed(2)));
}

// Calculate recent accuracy over keystroke sample window
export function calculateRecentAccuracy(
  samples: readonly KeySample[],
  windowSize = 25,
): number {
  if (samples.length === 0) return 1.0;
  const recent = samples.slice(-windowSize);
  let hits = 0;
  let misses = 0;
  for (const s of recent) {
    hits += s.hitCount;
    misses += s.missCount;
  }
  const total = hits + misses;
  if (total === 0) return 1.0;
  return Number((hits / total).toFixed(3));
}

// Composite Key Mastery Score: balances speed against accuracy
// Penalizes mistakes exponentially: >10% error rate plummets mastery
export function computeKeyMasteryScore(
  speed: number | null,
  accuracy: number,
  targetWpm: number,
): number {
  if (speed === null || speed <= 0) return 0;
  const speedRatio = Math.min(2.0, speed / targetWpm);
  const errorRate = Math.max(0, 1.0 - accuracy);

  // Exponential penalty for errors
  const accPenalty = Math.max(
    0.05,
    Math.pow(accuracy, 2.5) * (1 - errorRate * 1.5),
  );
  return Number((speedRatio * accPenalty).toFixed(2));
}

export class ExponentialFilter {
  readonly alpha: number;
  private value: number | null = null;

  constructor(alpha = 0.1) {
    this.alpha = alpha;
  }

  add(sample: number): number {
    if (this.value === null) {
      this.value = sample;
    } else {
      this.value = (1 - this.alpha) * this.value + this.alpha * sample;
    }
    return this.value;
  }

  get current(): number | null {
    return this.value;
  }
}

// Simple Polynomial / Linear Regression to calculate Learning Rate slope
export function calculateLearningRate(samples: readonly KeySample[]): {
  learningRate: number | null;
  certainty: number | null;
} {
  if (samples.length < 3) {
    return { learningRate: null, certainty: null };
  }

  const recent = samples.slice(-25);
  const n = recent.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    const s = recent[i];
    if (s === undefined) continue;
    const x = i + 1;
    const y = timeToSpeed(s.filteredTimeToType);
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) {
    return { learningRate: 0, certainty: 1 };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Compute R^2 certainty
  const meanY = sumY / n;
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const s = recent[i];
    if (!s) continue;
    const x = i + 1;
    const y = timeToSpeed(s.filteredTimeToType);
    const predicted = slope * x + intercept;
    ssTot += Math.pow(y - meanY, 2);
    ssRes += Math.pow(y - predicted, 2);
  }

  const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);
  return {
    learningRate: Number(slope.toFixed(2)),
    certainty: Number(r2.toFixed(2)),
  };
}

// Identify top problematic bigram transitions for a key
export function getTopWeakBigrams(
  transitions:
    | Record<string, { count: number; errors: number; avgTimeMs: number }>
    | undefined,
  limit = 4,
): string[] {
  if (!transitions) return [];
  return Object.entries(transitions)
    .filter(([, data]) => data.errors > 0 || data.count >= 2)
    .sort((a, b) => {
      const errA = a[1].errors;
      const errB = b[1].errors;
      const rateA = a[1].count > 0 ? errA / a[1].count : 0;
      const rateB = b[1].count > 0 ? errB / b[1].count : 0;
      const scoreA = errA * 2 + rateA * 5 + (a[1].avgTimeMs > 400 ? 1 : 0);
      const scoreB = errB * 2 + rateB * 5 + (b[1].avgTimeMs > 400 ? 1 : 0);
      return scoreB - scoreA;
    })
    .slice(0, limit)
    .map(([bg]) => bg);
}

// Rank unlocked keys by weakness / remediation need
export function getTopWeakKeys(
  keyMap: Record<string, KeyCalibrationData>,
  unlockedKeys: readonly string[],
): string[] {
  return [...unlockedKeys].sort((a, b) => {
    const dataA = keyMap[a];
    const dataB = keyMap[b];
    if (!dataA || !dataB) return 0;

    // Prioritize keys with consecutive mistake drills
    if (dataA.consecutiveMissDrills !== dataB.consecutiveMissDrills) {
      return dataB.consecutiveMissDrills - dataA.consecutiveMissDrills;
    }

    // Next prioritize lowest composite mastery score
    const masteryA = dataA.masteryScore ?? 0;
    const masteryB = dataB.masteryScore ?? 0;
    return masteryA - masteryB;
  });
}

// Calculate confidence color between red (#cc0000) and green (#60d788)
export function getConfidenceColor(confidence: number | null): string {
  if (confidence === null) {
    return "var(--sub-alt, #2c2e31)";
  }

  const clamped = Math.max(0, Math.min(1, confidence));
  // 0% -> #cc0000 (hsl 0, 100%, 40%)
  // 50% -> #e2b714 (hsl 47, 84%, 48%)
  // 100% -> #60d788 (hsl 140, 58%, 61%)
  if (clamped < 0.5) {
    const t = clamped / 0.5;
    // Red to Yellow
    const r = Math.round(204 + (226 - 204) * t);
    const g = Math.round(0 + (183 - 0) * t);
    const b = Math.round(0 + (20 - 0) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const t = (clamped - 0.5) / 0.5;
    // Yellow to Green
    const r = Math.round(226 + (96 - 226) * t);
    const g = Math.round(183 + (215 - 183) * t);
    const b = Math.round(20 + (136 - 20) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
}
