export type KeySample = {
  index: number;
  timeStamp: number;
  hitCount: number;
  missCount: number;
  timeToType: number; // ms per keystroke
  filteredTimeToType: number; // smoothed ms per keystroke
};

export type KeyCalibrationData = {
  char: string;
  samples: KeySample[];
  timeToType: number | null; // ms
  bestTimeToType: number | null; // ms
  speed: number | null; // WPM
  bestSpeed: number | null; // WPM
  confidence: number | null; // 0.0 to 1.0+
  bestConfidence: number | null;
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
