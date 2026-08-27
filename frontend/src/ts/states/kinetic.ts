import { createSignal } from "solid-js";

import { Language } from "@monkeytype/schemas/languages";
import { setConfig } from "../config/setters";
import * as SoundController from "../controllers/sound-controller";
import { restartTestEvent } from "../events/test";
import * as CustomText from "../test/custom-text";
import { getLanguage } from "../utils/json-data";
import {
  analyzeWordKeystrokes,
  DualLatencyAnalysis,
  WordKeystrokeLog,
} from "../utils/kinetic/dual-latency";
import {
  createDefaultTransition,
  glicko2Update,
  GlickoTransitionRating,
} from "../utils/kinetic/glicko2";
import {
  buildInvertedIndex,
  getDefaultCorpusIndex,
  indexCustomCorpus,
  InvertedCorpusIndex,
  queryInvertedIndex,
  SpeedTier,
} from "../utils/kinetic/inverted-index";
import { KineticDrillItem } from "../utils/kinetic/multi-queue";
import { setCustomTextIndicator } from "./core";
import { hideModal, showModal } from "./modals";

export type KineticCorpus =
  | "english_10k"
  | "english_5k"
  | "english_1k"
  | "english_25k"
  | "english"
  | "custom";

export type KineticTraceMode = "all" | "errors" | "focus" | "off";

export type KineticSettings = {
  corpus: KineticCorpus;
  speedTier: SpeedTier | "auto";
  targetWpm: number;
  wordCount: number;
  showDiagnostics: boolean;
  lookaheadLighting: boolean;
  ghostPacer: boolean;
  metronome: boolean;
  traceMode: KineticTraceMode;
  sessionLength: number; // 5, 10, or 0 (infinite)
};

const DEFAULT_SETTINGS: KineticSettings = {
  corpus: "english_10k",
  speedTier: "auto",
  targetWpm: 60,
  wordCount: 20,
  showDiagnostics: true,
  lookaheadLighting: true,
  ghostPacer: true,
  metronome: false,
  traceMode: "all",
  sessionLength: 5,
};

const STORAGE_KEY = "eepytype_kinetic_state_v3";
const CUSTOM_CORPUS_KEY = "eepytype_kinetic_custom_corpus_v1";

// In-memory cache of corpus indexes
const corpusCache = new Map<string, InvertedCorpusIndex>();

export type KineticTransitionTrace = {
  from: string;
  to: string;
  correct: boolean;
  timestamp: number;
};

export type CharStatus = "pending" | "correct" | "error" | "corrected_error";

export type MistakeLogEntry = {
  expected: string;
  typed: string;
  word: string;
  timestamp: number;
};

export type SessionTestResult = {
  testNumber: number;
  wpm: number;
  accuracy: number;
  totalHits: number;
  totalMisses: number;
  meanIklMs: number;
  meanIkiMs: number;
  mistakes: Record<string, number>;
  timestamp: number;
};

// Signals
export const [isKineticActive, setIsKineticActive] =
  createSignal<boolean>(false);
export const [kineticSettings, setKineticSettings] =
  createSignal<KineticSettings>(DEFAULT_SETTINGS);
export const [transitionRatings, setTransitionRatings] = createSignal<
  Record<string, GlickoTransitionRating>
>({});
export const [activeKineticDrill, setActiveKineticDrill] = createSignal<
  KineticDrillItem[]
>([]);
export const [activeDrillText, setActiveDrillText] = createSignal<string>("");
export const [drillCursorIndex, setDrillCursorIndex] = createSignal<number>(0);
export const [drillWordIndex, setDrillWordIndex] = createSignal<number>(0);
export const [drillCharStatuses, setDrillCharStatuses] = createSignal<
  CharStatus[]
>([]);
export const [currentWordHasError, setCurrentWordHasError] =
  createSignal<boolean>(false);
export const [streakCount, setStreakCount] = createSignal<number>(0);
export const [customCorpusText, setCustomCorpusText] = createSignal<string>("");
export const [kineticDepressedKeys, setKineticDepressedKeys] = createSignal<
  string[]
>([]);
export const [kineticRecentTransitions, setKineticRecentTransitions] =
  createSignal<KineticTransitionTrace[]>([]);
export const [ghostPacerProgress, setGhostPacerProgress] =
  createSignal<number>(0);
export const [isKineticPaused, setIsKineticPaused] =
  createSignal<boolean>(false);
export const [activeMicroDrillTransition, setActiveMicroDrillTransition] =
  createSignal<string | null>(null);

// Session Set Progress Signals (e.g. 5-test or 10-test session)
export const [sessionCurrentTestIndex, setSessionCurrentTestIndex] =
  createSignal<number>(1);
export const [sessionHistory, setSessionHistory] = createSignal<
  SessionTestResult[]
>([]);
export const [isSessionComplete, setIsSessionComplete] =
  createSignal<boolean>(false);
export const [repeatedMistakes, setRepeatedMistakes] = createSignal<
  Record<string, number>
>({});
export const [recentMistakesList, setRecentMistakesList] = createSignal<
  MistakeLogEntry[]
>([]);

export type KeyConfidenceData = {
  char: string;
  filteredTimeToType: number; // smoothed EMA interval ms for bigrams ending in this char
  filteredErrorRate: number; // smoothed EMA error rate (0.0 to 1.0)
  speedWpm: number;
  confidence: number; // 0.0 to 1.0 (Keybr Confidence Score)
  isUnlocked: boolean; // confidence >= 0.95
  totalHits: number;
  totalMisses: number;
  lastIntervalMs: number;
  lastPrecedingChar: string;
};

export const [keyConfidences, setKeyConfidences] = createSignal<
  Record<string, KeyConfidenceData>
>({});

export type LiveKineticDiagnostics = {
  lastIklMs: number;
  lastIkiMs: number;
  meanIklMs: number;
  meanIkiMs: number;
  cognitiveHesitationCount: number;
  motorBottlenecks: string[];
  rollingAccuracy: number;
  recentAnalyses: DualLatencyAnalysis[];
};

export const [kineticDiagnostics, setKineticDiagnostics] =
  createSignal<LiveKineticDiagnostics>({
    lastIklMs: 0,
    lastIkiMs: 0,
    meanIklMs: 240,
    meanIkiMs: 180,
    cognitiveHesitationCount: 0,
    motorBottlenecks: [],
    rollingAccuracy: 1.0,
    recentAnalyses: [],
  });

// Keystroke buffer for active word
let currentWordLog: WordKeystrokeLog = {
  word: "",
  wordDisplayedTimestamp: 0,
  keystrokes: [],
};
let drillStartTime = 0;
let drillTotalHits = 0;
let drillTotalMisses = 0;
let lastTypedChar = "";
let lastKeystrokeTimestamp = 0;
let ghostPacerTimer: ReturnType<typeof setInterval> | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let pausedAtTimestamp = 0;
const IDLE_TIMEOUT_MS = 2500;
const recentWordsHistory: string[] = [];

// Load persisted kinetic state
export function loadKineticState(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null && raw !== "") {
      const parsed = JSON.parse(raw) as Record<string, unknown>;

      const settingsVal = parsed["settings"];
      if (settingsVal !== null && typeof settingsVal === "object") {
        setKineticSettings({
          ...DEFAULT_SETTINGS,
          ...(settingsVal as Partial<KineticSettings>),
        });
      }

      const ratingsVal = parsed["ratings"];
      if (ratingsVal !== null && typeof ratingsVal === "object") {
        setTransitionRatings(
          ratingsVal as Record<string, GlickoTransitionRating>,
        );
      }

      const mistakesVal = parsed["repeatedMistakes"];
      if (mistakesVal !== null && typeof mistakesVal === "object") {
        setRepeatedMistakes(mistakesVal as Record<string, number>);
      }

      const confVal = parsed["keyConfidences"];
      if (confVal !== null && typeof confVal === "object") {
        setKeyConfidences(confVal as Record<string, KeyConfidenceData>);
      }
    }

    const savedCorpus = localStorage.getItem(CUSTOM_CORPUS_KEY);
    if (savedCorpus !== null && savedCorpus !== "") {
      setCustomCorpusText(savedCorpus);
    }
  } catch (e) {
    console.error("Failed to load kinetic state", e);
  }
}

// Save kinetic state to localStorage
export function saveKineticState(): void {
  try {
    const state = {
      settings: kineticSettings(),
      ratings: transitionRatings(),
      repeatedMistakes: repeatedMistakes(),
      keyConfidences: keyConfidences(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (customCorpusText() !== "") {
      localStorage.setItem(CUSTOM_CORPUS_KEY, customCorpusText());
    }
  } catch (e) {
    console.error("Failed to save kinetic state", e);
  }
}

// Fetch and index word corpus
export async function getOrLoadCorpusIndex(
  corpusName: KineticCorpus,
): Promise<InvertedCorpusIndex> {
  if (corpusName === "custom" && customCorpusText() !== "") {
    return indexCustomCorpus(customCorpusText());
  }

  const cached = corpusCache.get(corpusName);
  if (cached !== undefined) return cached;

  try {
    const langObj = await getLanguage(corpusName as Language);
    if (
      langObj !== undefined &&
      Array.isArray(langObj.words) &&
      langObj.words.length > 0
    ) {
      const index = buildInvertedIndex(langObj.words);
      corpusCache.set(corpusName, index);
      return index;
    }
  } catch (e) {
    console.warn(`Failed to fetch corpus ${corpusName}, using fallback`, e);
  }

  const fallback = getDefaultCorpusIndex();
  corpusCache.set(corpusName, fallback);
  return fallback;
}

// Determine active speed tier
export function resolveSpeedTier(
  settings: KineticSettings,
  meanIkiMs: number,
): SpeedTier {
  if (settings.speedTier !== "auto") return settings.speedTier;
  const wpm = meanIkiMs > 0 ? Math.round(12000 / meanIkiMs) : 60;
  if (wpm < 70) return "beginner";
  if (wpm < 120) return "intermediate";
  if (wpm < 160) return "advanced";
  return "elite";
}

export type ProjectedMilestone = {
  currentTier: SpeedTier;
  nextTier: SpeedTier;
  currentGrossWpm: number;
  targetWpm: number;
  estimatedPracticeHours: number;
  estimatedDaysAt15MinDaily: number;
};

export function calculateProjectedMilestones(
  currentWpm: number,
  ratings: Record<string, GlickoTransitionRating>,
): ProjectedMilestone {
  const wpm = Math.max(20, currentWpm);
  let currentTier: SpeedTier = "beginner";
  let nextTier: SpeedTier = "intermediate";
  let targetWpm = 70;

  if (wpm < 70) {
    currentTier = "beginner";
    nextTier = "intermediate";
    targetWpm = 70;
  } else if (wpm < 120) {
    currentTier = "intermediate";
    nextTier = "advanced";
    targetWpm = 120;
  } else if (wpm < 160) {
    currentTier = "advanced";
    nextTier = "elite";
    targetWpm = 160;
  } else {
    currentTier = "elite";
    nextTier = "elite";
    targetWpm = Math.ceil((wpm + 15) / 10) * 10;
  }

  const diffWpm = Math.max(5, targetWpm - wpm);
  const practiced = Object.values(ratings).filter((r) => r.sampleCount > 0);
  const avgSigma =
    practiced.length > 0
      ? practiced.reduce((acc, r) => acc + r.sigma, 0) / practiced.length
      : 0.06;

  const wpmPerHour = Math.max(2.0, 5.0 - avgSigma * 15);
  const estimatedPracticeHours = Number((diffWpm / wpmPerHour).toFixed(1));
  const estimatedDays = Math.max(
    1,
    Math.ceil((estimatedPracticeHours * 60) / 15),
  );

  return {
    currentTier,
    nextTier,
    currentGrossWpm: wpm,
    targetWpm,
    estimatedPracticeHours,
    estimatedDaysAt15MinDaily: estimatedDays,
  };
}

// Update Keybr-style Per-Key Bigram Confidence Score (0.0 to 1.0)
export function updateKeyConfidence(
  targetChar: string,
  intervalMs: number,
  isCorrect: boolean,
  precedingChar = " ",
  targetWpm: number = kineticSettings().targetWpm,
): KeyConfidenceData {
  const k = targetChar.toLowerCase();
  const current = keyConfidences()[k] ?? {
    char: k,
    filteredTimeToType: 320,
    filteredErrorRate: 0.0,
    speedWpm: 37,
    confidence: 0.5,
    isUnlocked: false,
    totalHits: 0,
    totalMisses: 0,
    lastIntervalMs: intervalMs,
    lastPrecedingChar: precedingChar,
  };

  const alpha = 0.15; // Keybr EMA exponential smoothing
  const clampedTime = Math.max(40, Math.min(1200, intervalMs));
  const newFilteredTime = Math.round(
    (1 - alpha) * current.filteredTimeToType + alpha * clampedTime,
  );
  const newFilteredErr = Number(
    (
      (1 - alpha) * current.filteredErrorRate +
      alpha * (isCorrect ? 0.0 : 1.0)
    ).toFixed(3),
  );

  const targetIki = 12000 / Math.max(20, targetWpm);
  // Hesitation = Penalty: if interval > targetIki, speedRatio plummets
  const speedRatio = Math.min(1.0, targetIki / newFilteredTime);
  // Error penalty: errors steeply drop accuracy factor
  const accFactor = Math.max(0.0, 1.0 - 2.5 * newFilteredErr);

  const confidence = Number(
    Math.max(0.0, Math.min(1.0, speedRatio * accFactor)).toFixed(2),
  );
  const isUnlocked = confidence >= 0.95;
  const speedWpm = Math.round(12000 / newFilteredTime);

  const updated: KeyConfidenceData = {
    char: k,
    filteredTimeToType: newFilteredTime,
    filteredErrorRate: newFilteredErr,
    speedWpm,
    confidence,
    isUnlocked,
    totalHits: current.totalHits + (isCorrect ? 1 : 0),
    totalMisses: current.totalMisses + (isCorrect ? 0 : 1),
    lastIntervalMs: Math.round(clampedTime),
    lastPrecedingChar: precedingChar,
  };

  setKeyConfidences((prev) => ({
    ...prev,
    [k]: updated,
  }));

  return updated;
}

// Record a mistake event
export function recordMistake(
  expected: string,
  typed: string,
  word: string,
): void {
  const charKey = expected.toLowerCase();
  setRepeatedMistakes((prev) => ({
    ...prev,
    [charKey]: (prev[charKey] ?? 0) + 1,
  }));

  setRecentMistakesList((prev) => [
    ...prev.slice(-20),
    {
      expected,
      typed,
      word,
      timestamp: Date.now(),
    },
  ]);
}

// Top letters with lowest confidence or most mistakes for automated remediation
export function getMistakeRemediationLetters(): string[] {
  const confMap = keyConfidences();
  const allKeys = Object.values(confMap).filter(
    (k) => k.char.length === 1 && k.char !== " " && k.char !== "",
  );

  // If confidence data exists, prioritize lowest confidence keys (< 0.90)
  const weakKeys = allKeys
    .filter((k) => k.confidence < 0.9)
    .sort((a, b) => a.confidence - b.confidence)
    .map((k) => k.char);

  if (weakKeys.length > 0) {
    return weakKeys.slice(0, 5);
  }

  const mistakes = repeatedMistakes();
  return Object.entries(mistakes)
    .filter(([k, count]) => k.length === 1 && count > 0 && k !== " ")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([char]) => char);
}

// Ghost Pacer animation
export function pauseGhostPacer(): void {
  if (ghostPacerTimer !== null) {
    clearInterval(ghostPacerTimer);
    ghostPacerTimer = null;
  }
}

export function resumeGhostPacer(): void {
  pauseGhostPacer();
  if (
    !isKineticActive() ||
    isKineticPaused() ||
    !kineticSettings().ghostPacer
  ) {
    return;
  }

  const targetWpm = Math.max(45, kineticSettings().targetWpm + 5);
  const textLength = activeDrillText().length;
  if (textLength === 0) return;

  const charsPerSec = (targetWpm * 5) / 60;
  const updateIntervalMs = 50;
  const charStep = (charsPerSec * updateIntervalMs) / 1000;

  ghostPacerTimer = setInterval(() => {
    if (!isKineticActive() || isKineticPaused()) {
      pauseGhostPacer();
      return;
    }
    setGhostPacerProgress((prev) => {
      const next = prev + charStep;
      if (next >= textLength) {
        pauseGhostPacer();
        return textLength;
      }
      return next;
    });
  }, updateIntervalMs);
}

export function pauseKineticDrill(): void {
  if (!isKineticActive() || isKineticPaused() || drillStartTime === 0) {
    return;
  }
  setIsKineticPaused(true);
  pausedAtTimestamp = performance.now();
  pauseGhostPacer();
  if (idleTimer !== null) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
}

export function resumeKineticDrill(): void {
  if (!isKineticPaused()) {
    return;
  }
  setIsKineticPaused(false);
  const now = performance.now();
  if (pausedAtTimestamp > 0) {
    const idleDuration = now - pausedAtTimestamp;
    if (currentWordLog.wordDisplayedTimestamp > 0) {
      currentWordLog.wordDisplayedTimestamp += idleDuration;
    }
    pausedAtTimestamp = 0;
  }
  resumeGhostPacer();
  resetIdleTimer();
}

function resetIdleTimer(): void {
  if (idleTimer !== null) {
    clearTimeout(idleTimer);
  }
  if (!isKineticActive() || drillStartTime === 0) {
    idleTimer = null;
    return;
  }
  idleTimer = setTimeout(() => {
    pauseKineticDrill();
  }, IDLE_TIMEOUT_MS);
}

// Start a new test (Automatically injects words containing user's mistakes)
export async function startKineticDrill(): Promise<void> {
  const settings = kineticSettings();
  const index = await getOrLoadCorpusIndex(settings.corpus);
  const diag = kineticDiagnostics();
  const tier = resolveSpeedTier(settings, diag.meanIkiMs);

  const mistakeLetters = getMistakeRemediationLetters();
  const targetWordCount = settings.wordCount;

  let selectedWords: string[] = [];

  if (mistakeLetters.length > 0) {
    // Automatically query words heavily containing user's mistakes (~65% of test words)
    const remediationCount = Math.min(
      targetWordCount,
      Math.max(6, Math.round(targetWordCount * 0.65)),
    );
    const remediationWords = queryInvertedIndex(
      index,
      mistakeLetters,
      [],
      tier,
      remediationCount,
      recentWordsHistory,
    );
    selectedWords = [...remediationWords];
  }

  // Fill remaining words with balanced non-recent vocabulary from corpus
  const remaining = targetWordCount - selectedWords.length;
  if (remaining > 0) {
    const allWords = index.words;
    const recentSet = new Set(recentWordsHistory);
    // Shuffle all words candidates
    const nonRecentPool = allWords.filter(
      (w) => w.length >= 2 && !recentSet.has(w) && !selectedWords.includes(w),
    );
    const poolToUse =
      nonRecentPool.length >= remaining ? nonRecentPool : allWords;

    for (
      let i = 0;
      i < remaining * 4 && selectedWords.length < targetWordCount;
      i++
    ) {
      const randWord = poolToUse[Math.floor(Math.random() * poolToUse.length)];
      if (
        randWord !== undefined &&
        randWord.length >= 2 &&
        !selectedWords.includes(randWord)
      ) {
        selectedWords.push(randWord);
      }
    }
  }

  // Update recent words history FIFO (keep max 100)
  recentWordsHistory.push(...selectedWords);
  if (recentWordsHistory.length > 100) {
    recentWordsHistory.splice(0, recentWordsHistory.length - 100);
  }

  // Shuffle selected words so remediation words are distributed naturally
  for (let i = selectedWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const wordI = selectedWords[i];
    const wordJ = selectedWords[j];
    if (wordI !== undefined && wordJ !== undefined) {
      selectedWords[i] = wordJ;
      selectedWords[j] = wordI;
    }
  }

  const drillItems: KineticDrillItem[] = selectedWords.map((w) => ({
    word: w,
    queueType: mistakeLetters.some((l) => w.includes(l)) ? "stress" : "flow",
  }));

  initDrillWithWords(
    drillItems,
    `Adaptive Training [${settings.corpus.toUpperCase()}]`,
  );
}

// Launch 1-click micro-drill on specific character / transition
export async function launchMicroDrill(targetLetter: string): Promise<void> {
  const settings = kineticSettings();
  const index = await getOrLoadCorpusIndex(settings.corpus);
  const tier = resolveSpeedTier(settings, kineticDiagnostics().meanIkiMs);

  const matchedWords = queryInvertedIndex(
    index,
    [targetLetter.toLowerCase()],
    [],
    tier,
    15,
  );

  const drillItems: KineticDrillItem[] = matchedWords.map((w) => ({
    word: w,
    queueType: "stress",
    primaryTransition: targetLetter,
  }));

  setActiveMicroDrillTransition(targetLetter.toUpperCase());
  initDrillWithWords(
    drillItems,
    `Micro-Drill: [${targetLetter.toUpperCase()}]`,
  );
}

function initDrillWithWords(
  drillItems: KineticDrillItem[],
  title: string,
): void {
  const words = drillItems.map((item) => item.word);
  const joinedText = words.join(" ");

  setActiveKineticDrill(drillItems);
  setActiveDrillText(joinedText);
  setDrillCursorIndex(0);
  setDrillWordIndex(0);
  setDrillCharStatuses(new Array(joinedText.length).fill("pending"));
  setCurrentWordHasError(false);
  setStreakCount(0);
  setKineticDepressedKeys([]);
  setKineticRecentTransitions([]);
  setIsKineticPaused(false);

  drillStartTime = 0;
  drillTotalHits = 0;
  drillTotalMisses = 0;
  lastTypedChar = "";
  lastKeystrokeTimestamp = 0;
  pausedAtTimestamp = 0;

  setGhostPacerProgress(0);
  pauseGhostPacer();
  if (idleTimer !== null) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }

  const firstWord = words[0] ?? "";
  currentWordLog = {
    word: firstWord,
    wordDisplayedTimestamp: 0,
    keystrokes: [],
  };

  CustomText.setCustomText(title, joinedText, false);
  CustomText.setMode("repeat");
  CustomText.setPipeDelimiter(false);
  CustomText.setText(words);
  CustomText.setLimitMode("word");
  CustomText.setLimitValue(words.length);
  setCustomTextIndicator({
    name: title,
    isLong: false,
  });

  setIsKineticActive(true);
  setConfig("mode", "custom");
  restartTestEvent.dispatch();
  hideModal("TrainingModal");
  hideModal("KineticSettingsModal");
}

// Handle real-time input: Strict Typewriter Error-Lock
export function handleKineticInput(event: KeyboardEvent): void {
  if (!isKineticActive()) return;

  if (event.key === "Escape") {
    event.preventDefault();
    void startKineticDrill();
    return;
  }

  // Prevent backspace/tab
  if (event.key === "Backspace" || event.key === "Tab") {
    event.preventDefault();
    return;
  }

  if (event.ctrlKey || event.altKey || event.metaKey) return;
  if (event.key.length !== 1) return;

  event.preventDefault();

  if (isKineticPaused()) {
    resumeKineticDrill();
  }

  const keyChar = event.key.toLowerCase();
  setKineticDepressedKeys((prev) =>
    prev.includes(keyChar) ? prev : [...prev, keyChar],
  );

  const text = activeDrillText();
  const cur = drillCursorIndex();
  if (cur >= text.length) return;

  const expected = text[cur];
  if (expected === undefined) return;
  const inputChar = event.key;
  const isMatch = inputChar === expected;

  const now = performance.now();
  if (drillStartTime === 0) {
    drillStartTime = now;
    currentWordLog.wordDisplayedTimestamp = now - 200;
    resumeGhostPacer();
  }
  resetIdleTimer();

  const intervalMs =
    lastKeystrokeTimestamp > 0 ? Math.round(now - lastKeystrokeTimestamp) : 220;
  lastKeystrokeTimestamp = now;
  const precedingChar = lastTypedChar !== "" ? lastTypedChar : " ";

  // Emit visual transition vector
  if (lastTypedChar !== "") {
    const trace: KineticTransitionTrace = {
      from: lastTypedChar,
      to: inputChar.toLowerCase(),
      correct: isMatch,
      timestamp: now,
    };
    setKineticRecentTransitions((prev) => [...prev.slice(-12), trace]);
  }
  lastTypedChar = inputChar.toLowerCase();

  const statuses = [...drillCharStatuses()];

  if (isMatch) {
    drillTotalHits++;
    setStreakCount((prev) => prev + 1);
    void SoundController.playClick();

    // Update rolling Keybr confidence for matched key
    updateKeyConfidence(expected, intervalMs, true, precedingChar);

    // If character was previously failed, leave it marked as "corrected_error" (red)
    if (statuses[cur] === "error" || statuses[cur] === "corrected_error") {
      statuses[cur] = "corrected_error";
    } else {
      statuses[cur] = "correct";
    }
    setDrillCharStatuses(statuses);

    currentWordLog.keystrokes.push({
      char: inputChar,
      timestamp: now,
      correct: statuses[cur] === "correct",
    });

    const next = cur + 1;
    setDrillCursorIndex(next);
    setCurrentWordHasError(false);

    // If word completed (space or end of text)
    if (expected === " " || next >= text.length) {
      processCompletedWord();

      const nextWIdx = drillWordIndex() + 1;
      setDrillWordIndex(nextWIdx);

      const allItems = activeKineticDrill();
      const nextWordItem = allItems[nextWIdx];
      if (nextWordItem !== undefined) {
        currentWordLog = {
          word: nextWordItem.word,
          wordDisplayedTimestamp: performance.now(),
          keystrokes: [],
        };
      }
    }

    if (next >= text.length) {
      finishKineticTest();
    }
  } else {
    // Mistake made: Turn key red, lock cursor, wait for correct key
    drillTotalMisses++;
    statuses[cur] = "error";
    setDrillCharStatuses(statuses);
    setCurrentWordHasError(true);
    setStreakCount(0);
    void SoundController.playError();

    // Update rolling Keybr confidence for failed key (penalty)
    updateKeyConfidence(expected, intervalMs, false, precedingChar);

    recordMistake(expected, inputChar, currentWordLog.word);

    currentWordLog.keystrokes.push({
      char: inputChar,
      timestamp: now,
      correct: false,
    });
  }
}

export function handleKineticKeyUp(event: KeyboardEvent): void {
  if (!isKineticActive()) return;
  const keyChar = event.key.toLowerCase();
  setKineticDepressedKeys((prev) => prev.filter((k) => k !== keyChar));
}

// Process word keystroke analysis and update Glicko-2 transition ratings
function processCompletedWord(): void {
  const currentRatings = { ...transitionRatings() };
  const expectedLookup = (trans: string): number => {
    const r = currentRatings[trans];
    return r !== undefined ? Math.round(r.meanIkiMs) : 250;
  };

  const analysis = analyzeWordKeystrokes(
    currentWordLog,
    expectedLookup,
    kineticDiagnostics().meanIklMs,
  );

  for (const t of analysis.transitions) {
    const key = t.transition;
    const existing = currentRatings[key] ?? createDefaultTransition(key);
    const updated = glicko2Update(existing, t.timeMs, t.correct);
    currentRatings[key] = updated;
  }
  setTransitionRatings(currentRatings);

  const prevDiag = kineticDiagnostics();
  const total = drillTotalHits + drillTotalMisses;
  const accuracy = total > 0 ? drillTotalHits / total : 1.0;

  const newMeanIkl =
    prevDiag.lastIklMs === 0
      ? analysis.iklMs
      : Math.round(0.85 * prevDiag.meanIklMs + 0.15 * analysis.iklMs);

  const newMeanIki =
    prevDiag.lastIkiMs === 0
      ? analysis.meanIkiMs
      : Math.round(0.85 * prevDiag.meanIkiMs + 0.15 * analysis.meanIkiMs);

  const bottlenecks = Array.from(
    new Set([
      ...prevDiag.motorBottlenecks.slice(-6),
      ...analysis.motorBottlenecks,
    ]),
  );

  setKineticDiagnostics({
    lastIklMs: analysis.iklMs,
    lastIkiMs: analysis.meanIkiMs,
    meanIklMs: newMeanIkl,
    meanIkiMs: newMeanIki,
    cognitiveHesitationCount:
      prevDiag.cognitiveHesitationCount +
      (analysis.isCognitiveHesitation ? 1 : 0),
    motorBottlenecks: bottlenecks,
    rollingAccuracy: Number(accuracy.toFixed(3)),
    recentAnalyses: [...prevDiag.recentAnalyses.slice(-15), analysis],
  });
}

// Finished a single test
function finishKineticTest(): void {
  pauseGhostPacer();
  if (idleTimer !== null) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }

  const durationSec = Math.max(1, (performance.now() - drillStartTime) / 1000);
  const totalChars = activeDrillText().length;
  const grossWpm = Math.round((totalChars / 5 / durationSec) * 60);
  const totalStrokes = drillTotalHits + drillTotalMisses;
  const acc =
    totalStrokes > 0 ? Math.round((drillTotalHits / totalStrokes) * 100) : 100;

  const testResult: SessionTestResult = {
    testNumber: sessionCurrentTestIndex(),
    wpm: grossWpm,
    accuracy: acc,
    totalHits: drillTotalHits,
    totalMisses: drillTotalMisses,
    meanIklMs: kineticDiagnostics().meanIklMs,
    meanIkiMs: kineticDiagnostics().meanIkiMs,
    mistakes: { ...repeatedMistakes() },
    timestamp: Date.now(),
  };

  setSessionHistory((prev) => [...prev, testResult]);
  saveKineticState();

  const target = kineticSettings().sessionLength;
  const currentIndex = sessionCurrentTestIndex();

  if (target > 0 && currentIndex >= target) {
    // Session set complete (e.g. 5-test or 10-test complete)
    setIsSessionComplete(true);
    showModal("KineticSessionReportModal");
  } else {
    // Move to next test in set
    setSessionCurrentTestIndex((prev) => prev + 1);
    void startKineticDrill();
  }
}

// Start a brand new session set (reset counter & history)
export function startNewSession(sessionLength?: number): void {
  if (sessionLength !== undefined) {
    updateKineticSettings({ sessionLength });
  }
  setSessionCurrentTestIndex(1);
  setSessionHistory([]);
  setIsSessionComplete(false);
  hideModal("KineticSessionReportModal");
  void startKineticDrill();
}

export function updateKineticSettings(partial: Partial<KineticSettings>): void {
  setKineticSettings({ ...kineticSettings(), ...partial });
  saveKineticState();
}

export function setKineticMode(active: boolean): void {
  setIsKineticActive(active);
  if (active) {
    loadKineticState();
    startNewSession();
  } else {
    pauseGhostPacer();
    if (idleTimer !== null) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
    setIsKineticPaused(false);
  }
}
