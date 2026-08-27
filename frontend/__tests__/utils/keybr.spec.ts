import { describe, expect, it } from "vitest";
import {
  generateKeybrWord,
  generateKeybrLessonWords,
  KEYBR_ENGLISH_ORDER,
  INITIAL_UNLOCKED_COUNT,
} from "../../src/ts/utils/keybr/phonetic-model";
import {
  computeConfidence,
  ExponentialFilter,
  calculateLearningRate,
  getConfidenceColor,
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
});

describe("Keybr Calibration & Learning Rate Engine", () => {
  it("should convert time to speed and speed to time accurately", () => {
    // 300ms per char -> 1000/300 * 60 / 5 = 40 WPM
    expect(timeToSpeed(300)).toBe(40);
    expect(speedToTime(40)).toBe(300);
  });

  it("should compute confidence relative to target WPM", () => {
    // 35 WPM target, 35 WPM speed (342.8ms) -> 1.0 confidence
    const timeFor35Wpm = speedToTime(35);
    expect(computeConfidence(timeFor35Wpm, 35)).toBe(1.0);
    expect(computeConfidence(speedToTime(70), 35)).toBe(2.0);
    expect(computeConfidence(null, 35)).toBe(null);
  });

  it("should smooth typing speed using ExponentialFilter", () => {
    const filter = new ExponentialFilter(0.1);
    expect(filter.add(500)).toBe(500);
    // (1 - 0.1) * 500 + 0.1 * 400 = 450 + 40 = 490
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
