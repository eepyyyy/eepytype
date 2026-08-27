export type WordKeystrokeLog = {
  word: string;
  wordDisplayedTimestamp: number; // Timestamp when word became active cue
  keystrokes: {
    char: string;
    timestamp: number;
    correct: boolean;
  }[];
};

export type DualLatencyAnalysis = {
  word: string;
  iklMs: number; // Initial Key Latency (Cognitive planning & visual recognition)
  meanIkiMs: number; // Mean Inter-Key Interval (Motor execution speed)
  isCognitiveHesitation: boolean; // Flagged when IKL > threshold
  transitions: {
    transition: string;
    timeMs: number;
    correct: boolean;
    isTrigram: boolean;
  }[];
  motorBottlenecks: string[]; // Specific transitions that exceeded motor threshold
};

// Extract bigrams and trigrams for a word
export function extractWordTransitions(
  word: string,
  includeTrigrams = false,
): string[] {
  const clean = word.toLowerCase().trim();
  const transitions: string[] = [];

  // Extract Bigrams
  for (let i = 0; i < clean.length - 1; i++) {
    transitions.push(clean.substring(i, i + 2));
  }

  // Extract Trigrams / Clusters if enabled
  if (includeTrigrams && clean.length >= 3) {
    for (let i = 0; i < clean.length - 2; i++) {
      transitions.push(clean.substring(i, i + 3));
    }
  }

  return transitions;
}

// Common English functional motor chunks / morphemes
export const COMMON_MOTOR_CHUNKS = [
  "ing",
  "tion",
  "ment",
  "ent",
  "and",
  "the",
  "str",
  "con",
  "dis",
  "pro",
  "ter",
  "ver",
  "ate",
  "ive",
  "ous",
  "able",
  "ence",
] as const;

// Process a typed word's keystroke stream and decompose into IKL vs IKI
export function analyzeWordKeystrokes(
  log: WordKeystrokeLog,
  expectedIkiLookup?: (trans: string) => number,
  baselineIklMs = 260,
): DualLatencyAnalysis {
  const { word, wordDisplayedTimestamp, keystrokes } = log;

  if (keystrokes.length === 0) {
    return {
      word,
      iklMs: 0,
      meanIkiMs: 0,
      isCognitiveHesitation: false,
      transitions: [],
      motorBottlenecks: [],
    };
  }

  // 1. Initial Key Latency (IKL): cue display to 1st keystroke
  const firstStroke = keystrokes[0];
  const firstTimestamp = firstStroke
    ? firstStroke.timestamp
    : wordDisplayedTimestamp;
  const rawIkl =
    wordDisplayedTimestamp > 0
      ? firstTimestamp - wordDisplayedTimestamp
      : baselineIklMs;
  const iklMs = Math.max(20, Math.min(1800, rawIkl));
  const isCognitiveHesitation = iklMs > baselineIklMs * 1.8;

  // 2. Inter-Key Intervals (IKI): keystroke-to-keystroke
  const transitions: {
    transition: string;
    timeMs: number;
    correct: boolean;
    isTrigram: boolean;
  }[] = [];
  const motorBottlenecks: string[] = [];
  let totalIki = 0;
  let countIki = 0;

  for (let i = 1; i < keystrokes.length; i++) {
    const prev = keystrokes[i - 1];
    const curr = keystrokes[i];
    if (!prev || !curr) continue;

    const ikiTime = Math.max(
      10,
      Math.min(1500, curr.timestamp - prev.timestamp),
    );
    totalIki += ikiTime;
    countIki++;

    const bigram = `${prev.char}${curr.char}`.toLowerCase();
    const correct = curr.correct && prev.correct;

    transitions.push({
      transition: bigram,
      timeMs: ikiTime,
      correct,
      isTrigram: false,
    });

    const expIki = expectedIkiLookup ? expectedIkiLookup(bigram) : 250;
    if (ikiTime > expIki * 1.55 || !correct) {
      motorBottlenecks.push(bigram);
    }

    // Check Trigram (i-2, i-1, i)
    if (i >= 2) {
      const prevPrev = keystrokes[i - 2];
      if (prevPrev) {
        const trigram =
          `${prevPrev.char}${prev.char}${curr.char}`.toLowerCase();
        const trigramTime = Math.max(
          20,
          Math.min(2500, curr.timestamp - prevPrev.timestamp),
        );
        transitions.push({
          transition: trigram,
          timeMs: trigramTime,
          correct: correct && prevPrev.correct,
          isTrigram: true,
        });
      }
    }
  }

  const meanIkiMs = countIki > 0 ? Math.round(totalIki / countIki) : iklMs;

  return {
    word,
    iklMs: Math.round(iklMs),
    meanIkiMs,
    isCognitiveHesitation,
    transitions,
    motorBottlenecks: Array.from(new Set(motorBottlenecks)),
  };
}
