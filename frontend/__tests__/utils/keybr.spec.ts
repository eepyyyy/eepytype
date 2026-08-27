import { describe, expect, it } from "vitest";
import {
  generateKeybrWord,
  generateKeybrLessonWords,
  KEYBR_ENGLISH_ORDER,
  INITIAL_UNLOCKED_COUNT,
} from "../../src/ts/utils/keybr/phonetic-model";
import {
  calculateRecentAccuracy,
  computeConfidence,
  computeKeyMasteryScore,
  ExponentialFilter,
  calculateLearningRate,
  getConfidenceColor,
  getTopWeakBigrams,
  getTopWeakKeys,
  speedToTime,
  timeToSpeed,
  KeyCalibrationData,
} from "../../src/ts/utils/keybr/key-calibration";

describe("Keybr Phonetic Model and Generator", () => {
  it("should have correct English letter order starting with top 6 letters", () => {
    expect(KEYBR_ENGLISH_ORDER.length).toBe(26);
    expect(INITIAL_UNLOCKED_COUNT).toBe(6);
    expect(KEYBR_ENGLISH_ORDER.slice(0, 6)).toEqual([
      "e",
      "n",
      "i",
      "t",
      "r",
      "l",
    ]);
  });

  it("should generate words containing only allowed letters", () => {
    const allowed = ["e", "n", "i", "t", "r", "l"];
    const allowedSet = new Set(allowed);

    for (let i = 0; i < 20; i++) {
      const word = generateKeybrWord(allowed, "e", 3, 8);
      expect(word.length).toBeGreaterThanOrEqual(3);
      for (const char of word) {
        expect(allowedSet.has(char.toLowerCase())).toBe(true);
      }
    }
  });

  it("should generate lesson word list with proper length and options", () => {
    const unlocked = ["e", "n", "i", "t", "r", "l", "s", "a"];
    const words = generateKeybrLessonWords({
      unlockedChars: unlocked,
      focusedChar: "s",
      wordCount: 30,
      withCapitals: true,
      withPunctuation: true,
    });

    expect(words.length).toBe(30);
    const hasFocus = words.some((w) => w.toLowerCase().includes("s"));
    expect(hasFocus).toBe(true);
  });

  it("should generate intensive remediation words targeting weak key and bigrams", () => {
    const unlocked = ["e", "n", "i", "t", "r", "l", "s", "a", "u", "o", "d"];
    const words = generateKeybrLessonWords({
      unlockedChars: unlocked,
      focusedChar: "r",
      targetedBigrams: ["er", "re", "tr", "or"],
      remediationMode: true,
      wordCount: 30,
    });

    expect(words.length).toBe(30);
    const rWords = words.filter((w) => w.toLowerCase().includes("r"));
    // In remediation mode, >80% of words should contain target key 'r'
    expect(rWords.length).toBeGreaterThanOrEqual(24);
  });
});

describe("Keybr Calibration & Learning Rate Engine", () => {
  it("should convert time to speed and speed to time accurately", () => {
    expect(timeToSpeed(300)).toBe(40);
    expect(speedToTime(40)).toBe(300);
  });

  it("should compute confidence relative to target WPM", () => {
    const timeFor35Wpm = speedToTime(35);
    expect(computeConfidence(timeFor35Wpm, 35)).toBe(1.0);
    expect(computeConfidence(speedToTime(70), 35)).toBe(2.0);
    expect(computeConfidence(null, 35)).toBe(null);
  });

  it("should compute recent accuracy and heavily penalize mistakes in composite mastery score", () => {
    const samplesClean = [
      {
        index: 0,
        timeStamp: 1,
        hitCount: 1,
        missCount: 0,
        timeToType: 300,
        filteredTimeToType: 300,
      },
      {
        index: 1,
        timeStamp: 2,
        hitCount: 1,
        missCount: 0,
        timeToType: 300,
        filteredTimeToType: 300,
      },
      {
        index: 2,
        timeStamp: 3,
        hitCount: 1,
        missCount: 0,
        timeToType: 300,
        filteredTimeToType: 300,
      },
      {
        index: 3,
        timeStamp: 4,
        hitCount: 1,
        missCount: 0,
        timeToType: 300,
        filteredTimeToType: 300,
      },
    ];
    const accClean = calculateRecentAccuracy(samplesClean);
    expect(accClean).toBe(1.0);
    const masteryClean = computeKeyMasteryScore(40, accClean, 35);
    expect(masteryClean).toBeGreaterThan(1.0);

    const samplesMistakes = [
      {
        index: 0,
        timeStamp: 1,
        hitCount: 1,
        missCount: 1,
        timeToType: 300,
        filteredTimeToType: 300,
      },
      {
        index: 1,
        timeStamp: 2,
        hitCount: 0,
        missCount: 2,
        timeToType: 300,
        filteredTimeToType: 300,
      },
      {
        index: 2,
        timeStamp: 3,
        hitCount: 1,
        missCount: 0,
        timeToType: 300,
        filteredTimeToType: 300,
      },
    ];
    const accMistakes = calculateRecentAccuracy(samplesMistakes);
    expect(accMistakes).toBeLessThan(0.6);
    const masteryMistakes = computeKeyMasteryScore(40, accMistakes, 35);
    // Error penalty should drastically reduce mastery score
    expect(masteryMistakes).toBeLessThan(0.3);
  });

  it("should identify top weak bigram transitions", () => {
    const transitions = {
      e: { count: 10, errors: 4, avgTimeMs: 450 },
      t: { count: 8, errors: 1, avgTimeMs: 300 },
      a: { count: 12, errors: 0, avgTimeMs: 250 },
      o: { count: 6, errors: 3, avgTimeMs: 420 },
    };

    const weak = getTopWeakBigrams(transitions, 2);
    expect(weak[0]).toBe("e"); // highest errors
    expect(weak.length).toBe(2);
  });

  it("should rank weak keys prioritizing consecutive miss drills and low mastery", () => {
    const keyMap: Record<string, KeyCalibrationData> = {
      e: {
        char: "e",
        samples: [],
        timeToType: 250,
        bestTimeToType: 250,
        speed: 48,
        bestSpeed: 48,
        confidence: 1.3,
        bestConfidence: 1.3,
        accuracy: 0.98,
        masteryScore: 1.2,
        totalHits: 50,
        totalMisses: 1,
        consecutiveMissDrills: 0,
        isIncluded: true,
        isFocused: false,
        isForced: false,
      },
      r: {
        char: "r",
        samples: [],
        timeToType: 350,
        bestTimeToType: 300,
        speed: 34,
        bestSpeed: 40,
        confidence: 0.97,
        bestConfidence: 1.1,
        accuracy: 0.75,
        masteryScore: 0.35,
        totalHits: 20,
        totalMisses: 7,
        consecutiveMissDrills: 3,
        isIncluded: true,
        isFocused: false,
        isForced: false,
      },
    };

    const ranked = getTopWeakKeys(keyMap, ["e", "r"]);
    expect(ranked[0]).toBe("r"); // 'r' should be first due to consecutive misses and low mastery
  });

  it("should smooth typing speed using ExponentialFilter", () => {
    const filter = new ExponentialFilter(0.1);
    expect(filter.add(500)).toBe(500);
    expect(filter.add(400)).toBe(490);
    expect(filter.current).toBe(490);
  });

  it("should compute learning rate slope via polynomial/linear regression", () => {
    const samples = [
      {
        index: 0,
        timeStamp: 1,
        hitCount: 10,
        missCount: 0,
        timeToType: 600,
        filteredTimeToType: 600,
      },
      {
        index: 1,
        timeStamp: 2,
        hitCount: 10,
        missCount: 0,
        timeToType: 500,
        filteredTimeToType: 500,
      },
      {
        index: 2,
        timeStamp: 3,
        hitCount: 10,
        missCount: 0,
        timeToType: 400,
        filteredTimeToType: 400,
      },
      {
        index: 3,
        timeStamp: 4,
        hitCount: 10,
        missCount: 0,
        timeToType: 300,
        filteredTimeToType: 300,
      },
    ];

    const result = calculateLearningRate(samples);
    expect(result.learningRate).toBeGreaterThan(0);
    expect(result.certainty).toBeGreaterThan(0.8);
  });

  it("should generate valid RGB colors for confidence levels", () => {
    const slowColor = getConfidenceColor(0.0);
    const fastColor = getConfidenceColor(1.0);
    expect(slowColor).toMatch(/^rgb\(/);
    expect(fastColor).toMatch(/^rgb\(/);
  });
});
