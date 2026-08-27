import { createSignal } from "solid-js";

import { setConfig } from "../config/setters";
import * as SoundController from "../controllers/sound-controller";
import { restartTestEvent } from "../events/test";
import * as CustomText from "../test/custom-text";
import { Language } from "@monkeytype/schemas/languages";
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
import {
  ANTI_TILT_QUEUE_WEIGHTS,
  generateMultiQueueDrill,
  KineticDrillItem,
  MultiQueueWeights,
} from "../utils/kinetic/multi-queue";
import { setCustomTextIndicator } from "./core";
import { hideModal } from "./modals";

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
  flowRatio: number;
  stressRatio: number;
  decayRatio: number;
  antiTiltEnabled: boolean;
  targetWpm: number;
  wordCount: number;
  showDiagnostics: boolean;
  lookaheadLighting: boolean;
  ghostPacer: boolean;
  metronome: boolean;
  wordResetConditioning: boolean;
  traceMode: KineticTraceMode;
};

const DEFAULT_SETTINGS: KineticSettings = {
  corpus: "english_10k",
  speedTier: "auto",
  flowRatio: 0.6,
  stressRatio: 0.3,
  decayRatio: 0.1,
  antiTiltEnabled: true,
  targetWpm: 60,
  wordCount: 25,
  showDiagnostics: true,
  lookaheadLighting: true,
  ghostPacer: true,
  metronome: false,
  wordResetConditioning: false,
  traceMode: "all",
};

const STORAGE_KEY = "eepytype_kinetic_state_v2";
const CUSTOM_CORPUS_KEY = "eepytype_kinetic_custom_corpus_v1";

// In-memory cache of corpus indexes
const corpusCache = new Map<string, InvertedCorpusIndex>();

export type KineticTransitionTrace = {
  from: string;
  to: string;
  correct: boolean;
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
export const [currentWordHasError, setCurrentWordHasError] =
  createSignal<boolean>(false);
export const [isAntiTiltEngaged, setIsAntiTiltEngaged] =
  createSignal<boolean>(false);
export const [streakCount, setStreakCount] = createSignal<number>(0);
export const [isWarmupActive, setIsWarmupActive] = createSignal<boolean>(false);
export const [activeMicroDrillTransition, setActiveMicroDrillTransition] =
  createSignal<string | null>(null);
export const [customCorpusText, setCustomCorpusText] = createSignal<string>("");
export const [kineticDepressedKeys, setKineticDepressedKeys] = createSignal<
  string[]
>([]);
export const [kineticRecentTransitions, setKineticRecentTransitions] =
  createSignal<KineticTransitionTrace[]>([]);
export const [ghostPacerProgress, setGhostPacerProgress] =
  createSignal<number>(0);

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
let ghostPacerTimer: ReturnType<typeof setInterval> | null = null;

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

// Projection Forecast Engine
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
  const wpm = Math.max(30, currentWpm);
  let currentTier: SpeedTier = "beginner";
  let nextTier: SpeedTier = "intermediate";
  let targetWpm = 70;

  if (wpm >= 160) {
    currentTier = "elite";
    nextTier = "elite";
    targetWpm = 200;
  } else if (wpm >= 120) {
    currentTier = "advanced";
    nextTier = "elite";
    targetWpm = 160;
  } else if (wpm >= 70) {
    currentTier = "intermediate";
    nextTier = "advanced";
    targetWpm = 120;
  }

  const diffWpm = Math.max(5, targetWpm - wpm);

  // Measure volatility and rating momentum across practiced transitions
  const practiced = Object.values(ratings).filter((r) => r.sampleCount >= 2);
  const avgSigma =
    practiced.length > 0
      ? practiced.reduce((acc, r) => acc + r.sigma, 0) / practiced.length
      : 0.06;

  // Empirical learning rate: ~4.5 WPM gain per hour of focused chunk practice
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

// Start Ghost Pacer animation
function startGhostPacer(targetWpm: number, textLength: number): void {
  if (ghostPacerTimer !== null) {
    clearInterval(ghostPacerTimer);
    ghostPacerTimer = null;
  }
  setGhostPacerProgress(0);

  // Characters per second: WPM * 5 chars / 60s
  const charsPerSec = (targetWpm * 5) / 60;
  const updateIntervalMs = 50;
  const charStep = (charsPerSec * updateIntervalMs) / 1000;

  ghostPacerTimer = setInterval(() => {
    if (!isKineticActive()) {
      if (ghostPacerTimer !== null) clearInterval(ghostPacerTimer);
      return;
    }
    setGhostPacerProgress((prev) => {
      const next = prev + charStep;
      if (next >= textLength) {
        if (ghostPacerTimer !== null) clearInterval(ghostPacerTimer);
        return textLength;
      }
      return next;
    });
  }, updateIntervalMs);
}

// Start a new Predictive Kinetic Drill
export async function startKineticDrill(): Promise<void> {
  const settings = kineticSettings();
  const index = await getOrLoadCorpusIndex(settings.corpus);
  const ratings = transitionRatings();
  const diag = kineticDiagnostics();

  const tier = resolveSpeedTier(settings, diag.meanIkiMs);

  // Check Anti-Tilt rebalancing
  const isAntiTilt = settings.antiTiltEnabled && diag.rollingAccuracy < 0.88;
  setIsAntiTiltEngaged(isAntiTilt);
  setIsWarmupActive(false);
  setActiveMicroDrillTransition(null);

  const weights: MultiQueueWeights = isAntiTilt
    ? ANTI_TILT_QUEUE_WEIGHTS
    : {
        flowRatio: settings.flowRatio,
        stressRatio: settings.stressRatio,
        decayRatio: settings.decayRatio,
      };

  const drillItems = generateMultiQueueDrill(
    index,
    ratings,
    weights,
    settings.wordCount,
    tier,
  );

  initDrillWithWords(
    drillItems,
    `Kinetic Chunking [${settings.corpus.toUpperCase()} | ${tier.toUpperCase()}]`,
  );
}

// Launch a 1-click targeted micro-drill on a specific transition (e.g. from Skill Map)
export async function launchMicroDrill(
  targetTransition: string,
): Promise<void> {
  const settings = kineticSettings();
  const index = await getOrLoadCorpusIndex(settings.corpus);
  const tier = resolveSpeedTier(settings, kineticDiagnostics().meanIkiMs);

  const matchedWords = queryInvertedIndex(
    index,
    [targetTransition.toLowerCase()],
    [],
    tier,
    15,
  );

  const drillItems: KineticDrillItem[] = matchedWords.map((w) => ({
    word: w,
    queueType: "stress",
    primaryTransition: targetTransition,
  }));

  setActiveMicroDrillTransition(targetTransition.toUpperCase());
  initDrillWithWords(
    drillItems,
    `Micro-Drill: [${targetTransition.toUpperCase()}]`,
  );
}

// Diagnostic Warm-up routine targeting offline decayed transitions (high phi)
export async function startDiagnosticWarmup(): Promise<void> {
  const settings = kineticSettings();
  const index = await getOrLoadCorpusIndex(settings.corpus);
  const ratings = transitionRatings();
  const tier = resolveSpeedTier(settings, kineticDiagnostics().meanIkiMs);

  const decayed = Object.values(ratings)
    .sort((a, b) => b.phi - a.phi)
    .slice(0, 5)
    .map((r) => r.transition);

  const warmPool =
    decayed.length > 0 ? decayed : ["th", "er", "in", "an", "re"];

  const matchedWords = queryInvertedIndex(index, warmPool, [], tier, 15);
  const drillItems: KineticDrillItem[] = matchedWords.map((w) => ({
    word: w,
    queueType: "decay",
    primaryTransition: warmPool[0],
  }));

  setIsWarmupActive(true);
  initDrillWithWords(drillItems, `Diagnostic Warm-Up (Decay Retention)`);
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
  setCurrentWordHasError(false);
  setStreakCount(0);
  setKineticDepressedKeys([]);
  setKineticRecentTransitions([]);

  drillStartTime = 0;
  drillTotalHits = 0;
  drillTotalMisses = 0;
  lastTypedChar = "";

  const firstWord = words[0] ?? "";
  currentWordLog = {
    word: firstWord,
    wordDisplayedTimestamp: performance.now(),
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

  const pacerWpm = Math.max(45, kineticSettings().targetWpm + 5);
  startGhostPacer(pacerWpm, joinedText.length);
}

// Handle real-time input for Kinetic Drill
export function handleKineticInput(event: KeyboardEvent): void {
  if (!isKineticActive()) return;

  if (event.key === "Escape") {
    event.preventDefault();
    void startKineticDrill();
    return;
  }

  // Prevent backspace/tab navigation
  if (event.key === "Backspace" || event.key === "Tab") {
    event.preventDefault();
    return;
  }

  if (event.ctrlKey || event.altKey || event.metaKey) return;
  if (event.key.length !== 1) return;

  event.preventDefault();

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
  }

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

  if (isMatch) {
    drillTotalHits++;
    setStreakCount((prev) => prev + 1);
    void SoundController.playClick();

    // Log keystroke
    currentWordLog.keystrokes.push({
      char: inputChar,
      timestamp: now,
      correct: !currentWordHasError(),
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
      if (nextWordItem) {
        currentWordLog = {
          word: nextWordItem.word,
          wordDisplayedTimestamp: performance.now(),
          keystrokes: [],
        };
      }
    }

    if (next >= text.length) {
      // Completed drill
      finishKineticDrill();
    }
  } else {
    drillTotalMisses++;
    setCurrentWordHasError(true);
    setStreakCount(0);
    void SoundController.playError();

    currentWordLog.keystrokes.push({
      char: inputChar,
      timestamp: now,
      correct: false,
    });

    // Smart Word-Reset conditioning: if enabled, reset cursor to word start on typo
    if (kineticSettings().wordResetConditioning) {
      const allWords = activeKineticDrill().map((d) => d.word);
      const wIdx = drillWordIndex();
      let wordStartOffset = 0;
      for (let i = 0; i < wIdx; i++) {
        const w = allWords[i];
        if (w !== undefined) wordStartOffset += w.length + 1;
      }
      setDrillCursorIndex(wordStartOffset);
      const currItem = activeKineticDrill()[wIdx];
      if (currItem) {
        currentWordLog = {
          word: currItem.word,
          wordDisplayedTimestamp: performance.now(),
          keystrokes: [],
        };
      }
    }
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
    return r ? Math.round(r.meanIkiMs) : 250;
  };

  const analysis = analyzeWordKeystrokes(
    currentWordLog,
    expectedLookup,
    kineticDiagnostics().meanIklMs,
  );

  // Update Glicko-2 ratings for all transitions typed in the word
  for (const t of analysis.transitions) {
    const key = t.transition;
    const existing = currentRatings[key] ?? createDefaultTransition(key);
    const updated = glicko2Update(existing, t.timeMs, t.correct);
    currentRatings[key] = updated;
  }
  setTransitionRatings(currentRatings);

  // Update live diagnostics
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

function finishKineticDrill(): void {
  saveKineticState();
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
    void startKineticDrill();
  } else {
    if (ghostPacerTimer !== null) {
      clearInterval(ghostPacerTimer);
      ghostPacerTimer = null;
    }
  }
}
