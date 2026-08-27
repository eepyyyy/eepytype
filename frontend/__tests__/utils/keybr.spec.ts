import { describe, expect, it } from "vitest";
import {
  generateKeybrWord,
  generateKeybrLessonWords,
  KEYBR_ENGLISH_ORDER,
  INITIAL_UNLOCKED_COUNT,
} from "../../src/ts/utils/keybr/phonetic-model";
import {
  calculateLearningRate,
  calculateRecentAccuracy,
  computeConfidence,
  computeKeyMasteryScore,
  ExponentialFilter,
  getConfidenceColor,
  getKeybrIndicatorState,
  getTopWeakBigrams,
  getTopWeakKeys,
  KeyCalibrationData,
  speedToTime,
  timeToSpeed,
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
    const nullColor = getConfidenceColor(null);
    const slowColor = getConfidenceColor(0.0);
    const fastColor = getConfidenceColor(1.0);
    expect(nullColor).toBe("#383b40");
    expect(slowColor).toBe("rgb(197, 48, 48)");
    expect(fastColor).toBe("rgb(56, 161, 105)");
  });

  it("should classify all 6 authentic Keybr indicator states", () => {
    // 1. Not included
    expect(getKeybrIndicatorState(undefined, false)).toBe("not_included");
    expect(
      getKeybrIndicatorState(
        {
          char: "z",
          samples: [],
          timeToType: null,
          bestTimeToType: null,
          speed: null,
          bestSpeed: null,
          confidence: null,
          bestConfidence: null,
          accuracy: 1,
          masteryScore: 0,
          totalHits: 0,
          totalMisses: 0,
          consecutiveMissDrills: 0,
          isIncluded: false,
          isFocused: false,
          isForced: false,
        },
        false,
      ),
    ).toBe("not_included");

    // 2. Increased frequency (focused key)
    expect(
      getKeybrIndicatorState(
        {
          char: "e",
          samples: [],
          timeToType: null,
          bestTimeToType: null,
          speed: null,
          bestSpeed: null,
          confidence: null,
          bestConfidence: null,
          accuracy: 1,
          masteryScore: 0,
          totalHits: 0,
          totalMisses: 0,
          consecutiveMissDrills: 0,
          isIncluded: true,
          isFocused: true,
          isForced: false,
        },
        true,
      ),
    ).toBe("increased_frequency");

    // 3. Manually included
    expect(
      getKeybrIndicatorState(
        {
          char: "x",
          samples: [],
          timeToType: null,
          bestTimeToType: null,
          speed: null,
          bestSpeed: null,
          confidence: null,
          bestConfidence: null,
          accuracy: 1,
          masteryScore: 0,
          totalHits: 0,
          totalMisses: 0,
          consecutiveMissDrills: 0,
          isIncluded: true,
          isFocused: false,
          isForced: true,
        },
        false,
      ),
    ).toBe("manually_included");

    // 4. Non-calibrated (included but 0 samples)
    expect(
      getKeybrIndicatorState(
        {
          char: "n",
          samples: [],
          timeToType: null,
          bestTimeToType: null,
          speed: null,
          bestSpeed: null,
          confidence: null,
          bestConfidence: null,
          accuracy: 1,
          masteryScore: 0,
          totalHits: 0,
          totalMisses: 0,
          consecutiveMissDrills: 0,
          isIncluded: true,
          isFocused: false,
          isForced: false,
        },
        false,
      ),
    ).toBe("non_calibrated");

    // 5. Lowest confidence (< 0.50)
    expect(
      getKeybrIndicatorState(
        {
          char: "i",
          samples: [
            {
              index: 0,
              timeStamp: 1,
              hitCount: 5,
              missCount: 5,
              timeToType: 600,
              filteredTimeToType: 600,
            },
          ],
          timeToType: 600,
          bestTimeToType: 600,
          speed: 20,
          bestSpeed: 20,
          confidence: 0.35,
          bestConfidence: 0.35,
          accuracy: 0.5,
          masteryScore: 0.2,
          totalHits: 5,
          totalMisses: 5,
          consecutiveMissDrills: 1,
          isIncluded: true,
          isFocused: false,
          isForced: false,
        },
        false,
      ),
    ).toBe("lowest_confidence");

    // 6. Calibrated (>= 0.50)
    expect(
      getKeybrIndicatorState(
        {
          char: "t",
          samples: [
            {
              index: 0,
              timeStamp: 1,
              hitCount: 10,
              missCount: 0,
              timeToType: 300,
              filteredTimeToType: 300,
            },
          ],
          timeToType: 300,
          bestTimeToType: 300,
          speed: 40,
          bestSpeed: 40,
          confidence: 0.95,
          bestConfidence: 0.95,
          accuracy: 1.0,
          masteryScore: 1.0,
          totalHits: 10,
          totalMisses: 0,
          consecutiveMissDrills: 0,
          isIncluded: true,
          isFocused: false,
          isForced: false,
        },
        false,
      ),
    ).toBe("calibrated");
  });
});
