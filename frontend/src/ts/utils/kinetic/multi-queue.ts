import { GlickoTransitionRating } from "./glicko2";
import {
  InvertedCorpusIndex,
  queryInvertedIndex,
  SpeedTier,
} from "./inverted-index";

export type QueueType = "flow" | "stress" | "decay";

export type KineticDrillItem = {
  word: string;
  queueType: QueueType;
  primaryTransition?: string;
};

export type MultiQueueWeights = {
  flowRatio: number; // e.g. 0.60
  stressRatio: number; // e.g. 0.30
  decayRatio: number; // e.g. 0.10
};

export const DEFAULT_QUEUE_WEIGHTS: MultiQueueWeights = {
  flowRatio: 0.6,
  stressRatio: 0.3,
  decayRatio: 0.1,
};

export const ANTI_TILT_QUEUE_WEIGHTS: MultiQueueWeights = {
  flowRatio: 0.8,
  stressRatio: 0.1,
  decayRatio: 0.1,
};

// Categorize transitions into Flow, Stress, and Memory Decay candidate pools
export function partitionTransitions(
  ratings: Record<string, GlickoTransitionRating>,
): {
  flowTransitions: string[];
  stressTransitions: string[];
  decayTransitions: string[];
} {
  const all = Object.values(ratings);

  // 1. Stress Pool: lowest mu (speed bottleneck) and highest error rate
  const stressTransitions = [...all]
    .filter((r) => r.sampleCount > 0)
    .sort((a, b) => {
      // Lower rating first, then higher errors
      if (a.mu !== b.mu) return a.mu - b.mu;
      return b.totalErrors - a.totalErrors;
    })
    .slice(0, 8)
    .map((r) => r.transition);

  // 2. Decay Pool: highest phi (high uncertainty / unpracticed recently)
  const decayTransitions = [...all]
    .sort((a, b) => b.phi - a.phi)
    .slice(0, 8)
    .map((r) => r.transition);

  // 3. Flow Pool: highest mu and lowest sigma (well-mastered, consistent)
  const flowTransitions = [...all]
    .filter((r) => r.sampleCount >= 2 && r.mu >= 0.0)
    .sort((a, b) => {
      if (a.mu !== b.mu) return b.mu - a.mu;
      return a.sigma - b.sigma;
    })
    .slice(0, 15)
    .map((r) => r.transition);

  return {
    flowTransitions:
      flowTransitions.length > 0
        ? flowTransitions
        : ["th", "he", "in", "er", "an", "re", "on", "at", "en", "nd"],
    stressTransitions:
      stressTransitions.length > 0
        ? stressTransitions
        : ["qu", "xy", "br", "cl", "fr", "pl", "gr", "dr"],
    decayTransitions:
      decayTransitions.length > 0
        ? decayTransitions
        : ["wh", "st", "ch", "sh", "nt", "ed", "ng", "ly"],
  };
}

// Generate an interleaved multi-queue drill list
export function generateMultiQueueDrill(
  index: InvertedCorpusIndex,
  ratings: Record<string, GlickoTransitionRating>,
  weights: MultiQueueWeights = DEFAULT_QUEUE_WEIGHTS,
  wordCount = 25,
  tier: SpeedTier = "intermediate",
): KineticDrillItem[] {
  const { flowTransitions, stressTransitions, decayTransitions } =
    partitionTransitions(ratings);

  // Fetch words for each queue
  const flowWords = queryInvertedIndex(
    index,
    flowTransitions,
    stressTransitions,
    tier,
    Math.max(15, Math.ceil(wordCount * weights.flowRatio * 1.5)),
  );

  const stressWords = queryInvertedIndex(
    index,
    stressTransitions,
    [],
    tier,
    Math.max(10, Math.ceil(wordCount * weights.stressRatio * 1.5)),
  );

  const decayWords = queryInvertedIndex(
    index,
    decayTransitions,
    stressTransitions,
    tier,
    Math.max(8, Math.ceil(wordCount * weights.decayRatio * 1.5)),
  );

  const drill: KineticDrillItem[] = [];
  let fIdx = 0;
  let sIdx = 0;
  let dIdx = 0;

  // Interleave pattern: Flow -> Stress -> Flow -> Decay -> Flow -> Stress ...
  const pattern: QueueType[] = [
    "flow",
    "stress",
    "flow",
    "decay",
    "flow",
    "stress",
    "flow",
    "flow",
    "stress",
    "decay",
  ];

  let patternIdx = 0;
  const usedWords = new Set<string>();

  while (drill.length < wordCount) {
    const qType = pattern[patternIdx % pattern.length] ?? "flow";
    patternIdx++;

    let chosenWord = "";
    let primaryTransition: string | undefined;

    if (qType === "flow" && flowWords.length > 0) {
      for (let i = 0; i < flowWords.length; i++) {
        const candidate = flowWords[(fIdx + i) % flowWords.length];
        if (
          candidate !== undefined &&
          candidate !== "" &&
          !usedWords.has(candidate)
        ) {
          chosenWord = candidate;
          fIdx = (fIdx + i + 1) % flowWords.length;
          break;
        }
      }
      primaryTransition = flowTransitions[0];
    } else if (qType === "stress" && stressWords.length > 0) {
      for (let i = 0; i < stressWords.length; i++) {
        const candidate = stressWords[(sIdx + i) % stressWords.length];
        if (
          candidate !== undefined &&
          candidate !== "" &&
          !usedWords.has(candidate)
        ) {
          chosenWord = candidate;
          sIdx = (sIdx + i + 1) % stressWords.length;
          break;
        }
      }
      primaryTransition = stressTransitions[0];
    } else if (qType === "decay" && decayWords.length > 0) {
      for (let i = 0; i < decayWords.length; i++) {
        const candidate = decayWords[(dIdx + i) % decayWords.length];
        if (
          candidate !== undefined &&
          candidate !== "" &&
          !usedWords.has(candidate)
        ) {
          chosenWord = candidate;
          dIdx = (dIdx + i + 1) % decayWords.length;
          break;
        }
      }
      primaryTransition = decayTransitions[0];
    }

    // Fallback if queue exhausted
    if (chosenWord === "") {
      const fallbackPool = index.words;
      let attempts = 0;
      do {
        chosenWord =
          fallbackPool[
            Math.floor(Math.random() * Math.min(1000, fallbackPool.length))
          ] ?? "the";
        attempts++;
      } while (usedWords.has(chosenWord) && attempts < 10);
    }

    usedWords.add(chosenWord);
    drill.push({
      word: chosenWord,
      queueType: qType,
      primaryTransition,
    });
  }

  return drill;
}
