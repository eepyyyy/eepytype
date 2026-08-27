import { describe, expect, it } from "vitest";

import {
  analyzeWordKeystrokes,
  extractWordTransitions,
} from "../../src/ts/utils/kinetic/dual-latency";
import {
  applyTimeDecay,
  createDefaultTransition,
  expectedIki,
  glicko2Update,
  performanceScore,
  transitionSpeedWpm,
} from "../../src/ts/utils/kinetic/glicko2";
import {
  buildInvertedIndex,
  indexCustomCorpus,
  queryInvertedIndex,
  scoreWordCandidate,
} from "../../src/ts/utils/kinetic/inverted-index";
import {
  generateMultiQueueDrill,
  partitionTransitions,
} from "../../src/ts/utils/kinetic/multi-queue";
import { calculateProjectedMilestones } from "../../src/ts/states/kinetic";

describe("Kinetic Glicko-2 Transition Rating Engine", () => {
  it("should calculate expected IKI and speed WPM from rating mu", () => {
    // mu = 0 (baseline) -> ~280ms -> 43 WPM
    const baseIki = expectedIki(0);
    expect(baseIki).toBeCloseTo(280, 0);
    expect(transitionSpeedWpm(0)).toBe(43);

    // mu > 0 (faster) -> lower IKI -> higher WPM
    const fastIki = expectedIki(1.5);
    expect(fastIki).toBeLessThan(baseIki);
    expect(transitionSpeedWpm(1.5)).toBeGreaterThan(43);
  });

  it("should score performance relative to expected latency", () => {
    // Fast keystroke (150ms < expected 280ms) -> score > 0.5
    const fastScore = performanceScore(150, 0, true);
    expect(fastScore).toBeGreaterThan(0.7);

    // Slow keystroke (450ms > expected 280ms) -> score < 0.5
    const slowScore = performanceScore(450, 0, true);
    expect(slowScore).toBeLessThan(0.3);

    // Error keystroke -> score = 0
    const errorScore = performanceScore(150, 0, false);
    expect(errorScore).toBe(0);
  });

  it("should update rating mu and uncertainty phi following keystrokes", () => {
    const initial = createDefaultTransition("th");
    expect(initial.mu).toBe(0);
    expect(initial.phi).toBe(1.15);

    // Fast, accurate keystroke (180ms)
    const updatedFast = glicko2Update(initial, 180, true);
    expect(updatedFast.mu).toBeGreaterThan(0);
    expect(updatedFast.phi).toBeLessThan(initial.phi);
    expect(updatedFast.sampleCount).toBe(1);

    // Mistake / Error keystroke
    const updatedError = glicko2Update(initial, 350, false);
    expect(updatedError.mu).toBeLessThan(0);
    expect(updatedError.totalErrors).toBe(1);
  });

  it("should inflate uncertainty phi over time of inactivity (forgetting curve)", () => {
    const fresh = createDefaultTransition("ed");
    fresh.phi = 0.3; // Well-known
    fresh.lastPracticed = Date.now() - 1000 * 60 * 60 * 48; // 48 hours ago

    const decayed = applyTimeDecay(fresh, Date.now());
    expect(decayed.phi).toBeGreaterThan(0.3);
  });
});

describe("Dual-Latency Model (IKL vs IKI)", () => {
  it("should extract bigrams and trigrams from words", () => {
    const bigrams = extractWordTransitions("train", false);
    expect(bigrams).toEqual(["tr", "ra", "ai", "in"]);

    const withTrigrams = extractWordTransitions("train", true);
    expect(withTrigrams).toContain("tra");
    expect(withTrigrams).toContain("rai");
    expect(withTrigrams).toContain("ain");
  });

  it("should separate cognitive IKL from physical IKI intervals", () => {
    const log = {
      word: "test",
      wordDisplayedTimestamp: 1000,
      keystrokes: [
        { char: "t", timestamp: 1250, correct: true }, // IKL = 250ms
        { char: "e", timestamp: 1400, correct: true }, // IKI = 150ms
        { char: "s", timestamp: 1540, correct: true }, // IKI = 140ms
        { char: "t", timestamp: 1690, correct: true }, // IKI = 150ms
      ],
    };

    const analysis = analyzeWordKeystrokes(log, () => 200, 200);
    expect(analysis.iklMs).toBe(250);
    expect(analysis.meanIkiMs).toBeCloseTo(147, 0);
    expect(analysis.isCognitiveHesitation).toBe(false);
    expect(analysis.transitions.length).toBe(5); // 3 bigrams + 2 trigrams
  });

  it("should flag cognitive hesitation when IKL is elevated", () => {
    const log = {
      word: "awkward",
      wordDisplayedTimestamp: 1000,
      keystrokes: [
        { char: "a", timestamp: 1700, correct: true }, // IKL = 700ms (hesitation!)
        { char: "w", timestamp: 1850, correct: true },
      ],
    };

    const analysis = analyzeWordKeystrokes(log, () => 200, 250);
    expect(analysis.iklMs).toBe(700);
    expect(analysis.isCognitiveHesitation).toBe(true);
  });
});

describe("Inverted Kinetic Index & Word Scoring", () => {
  const sampleCorpus = [
    "the",
    "there",
    "other",
    "another",
    "mother",
    "brother",
    "string",
    "strong",
    "train",
    "trainer",
    "interest",
    "pattern",
  ];

  it("should construct inverted index mapping n-grams to word indices", () => {
    const index = buildInvertedIndex(sampleCorpus);
    const thList = index.nGramMap.get("th");
    expect(thList).toBeDefined();
    expect(thList?.length).toBeGreaterThanOrEqual(4);

    const strList = index.nGramMap.get("str");
    expect(strList).toBeDefined();
    expect(strList?.length).toBeGreaterThanOrEqual(2);
  });

  it("should score candidates by target density, stress penalty, and frequency", () => {
    const scoreHigh = scoreWordCandidate(
      "trainer",
      ["tr", "er"],
      ["qu", "xy"],
      50,
      1000,
    );
    const scoreLow = scoreWordCandidate("trainer", ["qu"], ["tr"], 500, 1000);
    expect(scoreHigh).toBeGreaterThan(scoreLow);
  });

  it("should query inverted index and return ranked matching words", () => {
    const index = buildInvertedIndex(sampleCorpus);
    const results = queryInvertedIndex(
      index,
      ["th", "er"],
      [],
      "intermediate",
      5,
    );
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((w) => w.includes("th") || w.includes("er"))).toBe(
      true,
    );
  });
});

describe("Multi-Queue Selection Engine", () => {
  const sampleCorpus = [
    "the",
    "there",
    "other",
    "another",
    "mother",
    "brother",
    "water",
    "time",
    "about",
    "write",
    "practice",
    "system",
  ];
  const index = buildInvertedIndex(sampleCorpus);

  it("should partition transitions into flow, stress, and decay pools", () => {
    const ratings = {
      th: {
        transition: "th",
        mu: 1.5,
        phi: 0.2,
        sigma: 0.04,
        lastPracticed: Date.now(),
        sampleCount: 10,
        totalErrors: 0,
        meanIkiMs: 160,
      },
      qu: {
        transition: "qu",
        mu: -1.2,
        phi: 0.4,
        sigma: 0.08,
        lastPracticed: Date.now(),
        sampleCount: 5,
        totalErrors: 3,
        meanIkiMs: 420,
      },
      xy: {
        transition: "xy",
        mu: 0.0,
        phi: 1.3,
        sigma: 0.06,
        lastPracticed: Date.now() - 1000000,
        sampleCount: 0,
        totalErrors: 0,
        meanIkiMs: 280,
      },
    };

    const pools = partitionTransitions(ratings);
    expect(pools.flowTransitions).toContain("th");
    expect(pools.stressTransitions).toContain("qu");
    expect(pools.decayTransitions).toContain("xy");
  });

  it("should generate balanced multi-queue drill items", () => {
    const ratings = {
      th: {
        transition: "th",
        mu: 1.5,
        phi: 0.2,
        sigma: 0.04,
        lastPracticed: Date.now(),
        sampleCount: 10,
        totalErrors: 0,
        meanIkiMs: 160,
      },
    };

    const drill = generateMultiQueueDrill(
      index,
      ratings,
      { flowRatio: 0.6, stressRatio: 0.3, decayRatio: 0.1 },
      10,
      "intermediate",
    );

    expect(drill.length).toBe(10);
    const flowCount = drill.filter((d) => d.queueType === "flow").length;
    expect(flowCount).toBeGreaterThanOrEqual(4);
  });
});

describe("Custom Corpus Ingestion & Projection Forecast Engine", () => {
  it("should index custom source code into inverted n-gram map", () => {
    const jsSnippet = `
      function calculateVelocity(distance, duration) {
        const speed = distance / duration;
        return speed * 1.5;
      }
    `;

    const index = indexCustomCorpus(jsSnippet);
    expect(index.words.length).toBeGreaterThan(0);
    expect(index.nGramMap.has("ve")).toBe(true);
    expect(index.nGramMap.has("sp")).toBe(true);
    expect(index.nGramMap.has("ti")).toBe(true);
  });

  it("should calculate projected speed milestones and practice hours", () => {
    const ratings = {
      th: {
        transition: "th",
        mu: 1.2,
        phi: 0.2,
        sigma: 0.05,
        lastPracticed: Date.now(),
        sampleCount: 20,
        totalErrors: 0,
        meanIkiMs: 170,
      },
    };

    const projection = calculateProjectedMilestones(55, ratings);
    expect(projection.currentTier).toBe("beginner");
    expect(projection.nextTier).toBe("intermediate");
    expect(projection.targetWpm).toBe(70);
    expect(projection.estimatedPracticeHours).toBeGreaterThan(0);
    expect(projection.estimatedDaysAt15MinDaily).toBeGreaterThan(0);
  });
});
