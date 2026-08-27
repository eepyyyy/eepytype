import { KEYBR_DICTIONARY } from "../keybr/dictionary";

export type SpeedTier = "beginner" | "intermediate" | "advanced" | "elite";

export type InvertedCorpusIndex = {
  words: readonly string[];
  wordFreqRanks: Map<string, number>;
  nGramMap: Map<string, number[]>; // Maps bigram/trigram -> array of word indices in `words`
};

// Build inverted n-gram index over a word list
export function buildInvertedIndex(
  wordList: readonly string[],
): InvertedCorpusIndex {
  const words = wordList
    .map((w) => w.toLowerCase().trim())
    .filter((w) => w.length >= 2);
  const wordFreqRanks = new Map<string, number>();
  const nGramMap = new Map<string, number[]>();

  for (let idx = 0; idx < words.length; idx++) {
    const word = words[idx];
    if (word === undefined || word === "") continue;

    wordFreqRanks.set(word, idx + 1);

    // Index Bigrams
    for (let i = 0; i < word.length - 1; i++) {
      const bg = word.substring(i, i + 2);
      let list = nGramMap.get(bg);
      if (list === undefined) {
        list = [];
        nGramMap.set(bg, list);
      }
      if (list.length === 0 || list[list.length - 1] !== idx) {
        list.push(idx);
      }
    }

    // Index Trigrams
    for (let i = 0; i < word.length - 2; i++) {
      const tg = word.substring(i, i + 3);
      let list = nGramMap.get(tg);
      if (list === undefined) {
        list = [];
        nGramMap.set(tg, list);
      }
      if (list.length === 0 || list[list.length - 1] !== idx) {
        list.push(idx);
      }
    }
  }

  return {
    words,
    wordFreqRanks,
    nGramMap,
  };
}

// Fallback in-memory index built from KEYBR_DICTIONARY
let cachedDefaultIndex: InvertedCorpusIndex | null = null;

export function getDefaultCorpusIndex(): InvertedCorpusIndex {
  cachedDefaultIndex ??= buildInvertedIndex(KEYBR_DICTIONARY);
  return cachedDefaultIndex;
}

export type WordScoreWeights = {
  targetDensityWeight?: number; // w1, default 4.0
  secondaryStressWeight?: number; // w2, default 2.5
  frequencyWeight?: number; // w3, default 1.5
};

// Calculate word fitness score for targeted kinetic drill
// Score(w) = w1 * TargetDensity(w) - w2 * SecondaryStressPenalty(w) + w3 * FrequencyWeight(w)
export function scoreWordCandidate(
  word: string,
  targetTransitions: readonly string[],
  stressTransitions: readonly string[],
  rank = 500,
  totalWords = 10000,
  weights: WordScoreWeights = {},
): number {
  const w1 = weights.targetDensityWeight ?? 4.0;
  const w2 = weights.secondaryStressWeight ?? 2.5;
  const w3 = weights.frequencyWeight ?? 1.5;

  // 1. Target Density: count occurrences of primary target transitions
  let targetCount = 0;
  for (const trans of targetTransitions) {
    let pos = 0;
    while ((pos = word.indexOf(trans, pos)) !== -1) {
      targetCount++;
      pos += 1;
    }
  }

  // 2. Secondary Stress Penalty: count other weak transitions
  let stressCount = 0;
  for (const stress of stressTransitions) {
    if (!targetTransitions.includes(stress) && word.includes(stress)) {
      stressCount++;
    }
  }

  // 3. Frequency Weight: log-scaled rank boost (higher rank = more common)
  const freqScore = Math.max(0, Math.log10(Math.max(2, totalWords / rank)));

  return Number(
    (w1 * targetCount - w2 * stressCount + w3 * freqScore).toFixed(3),
  );
}

// Find best matching candidate words containing target transitions
export function queryInvertedIndex(
  index: InvertedCorpusIndex,
  targetTransitions: readonly string[],
  secondaryStressTransitions: readonly string[] = [],
  tier: SpeedTier = "intermediate",
  limit = 20,
): string[] {
  const matchedWordIndices = new Set<number>();

  // Gather matching word indices from inverted index
  for (const trans of targetTransitions) {
    const list = index.nGramMap.get(trans.toLowerCase()) ?? [];
    for (const idx of list) {
      matchedWordIndices.add(idx);
    }
  }

  const maxLen =
    tier === "beginner"
      ? 6
      : tier === "intermediate"
        ? 9
        : tier === "advanced"
          ? 12
          : 16;
  const minLen = tier === "beginner" ? 2 : 3;

  const totalWords = index.words.length;
  const scoredCandidates: { word: string; score: number }[] = [];

  for (const idx of matchedWordIndices) {
    const word = index.words[idx];
    if (
      word === undefined ||
      word === "" ||
      word.length < minLen ||
      word.length > maxLen
    ) {
      continue;
    }

    const rank = index.wordFreqRanks.get(word) ?? 1000;
    const score = scoreWordCandidate(
      word,
      targetTransitions,
      secondaryStressTransitions,
      rank,
      totalWords,
    );

    if (score > 0) {
      scoredCandidates.push({ word, score });
    }
  }

  scoredCandidates.sort((a, b) => b.score - a.score);
  return scoredCandidates.slice(0, limit).map((c) => c.word);
}
