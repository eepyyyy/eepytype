import { createSignal } from "solid-js";
import { setConfig } from "../config/setters";
import { restartTestEvent } from "../events/test";
import { setCustomTextIndicator } from "./core";
import { hideModal } from "./modals";
import * as SoundController from "../controllers/sound-controller";
import * as CustomText from "../test/custom-text";
import {
  KEYBR_ENGLISH_ORDER,
  INITIAL_UNLOCKED_COUNT,
  generateKeybrLessonWords,
} from "../utils/keybr/phonetic-model";
import {
  calculateRecentAccuracy,
  computeConfidence,
  computeKeyMasteryScore,
  ExponentialFilter,
  getTopWeakBigrams,
  getTopWeakKeys,
  KeyCalibrationData,
  KeybrDailyGoal,
  KeybrStreak,
  KeybrSummaryMetrics,
  timeToSpeed,
} from "../utils/keybr/key-calibration";

export type KeybrViewMode = "normal" | "compact" | "bare";
export type KeybrWidthMode = "full" | "wide" | "normal" | "compact";
export type KeybrFontSize = "small" | "medium" | "large" | "xlarge";
export type KeybrTextAlign = "left" | "center";
export type KeybrSeparator = "dot" | "space";
export type KeybrTraceMode = "all" | "errors" | "focus" | "off";

export type KeybrTransitionRecord = {
  fromKey: string;
  toKey: string;
  error: boolean;
  timeMs: number;
  id: number;
};

export type KeybrSettings = {
  targetWpm: number;
  autoUnlock: boolean;
  withCapitals: boolean;
  withPunctuation: boolean;
  dailyGoalMinutes: number;
  viewMode: KeybrViewMode;
  widthMode: KeybrWidthMode;
  customWidthPercent: number;
  fontSize: KeybrFontSize;
  textAlign: KeybrTextAlign;
  separator: KeybrSeparator;
  traceMode: KeybrTraceMode;
};

const DEFAULT_SETTINGS: KeybrSettings = {
  targetWpm: 35,
  autoUnlock: true,
  withCapitals: false,
  withPunctuation: false,
  dailyGoalMinutes: 30,
  viewMode: "normal",
  widthMode: "full",
  customWidthPercent: 100,
  fontSize: "large",
  textAlign: "left",
  separator: "dot",
  traceMode: "all",
};

const STORAGE_KEY = "eepytype_keybr_state_v1";

// Create initial 26-letter map
function createDefaultKeyMap(
  _targetWpm: number,
): Record<string, KeyCalibrationData> {
  const map: Record<string, KeyCalibrationData> = {};
  KEYBR_ENGLISH_ORDER.forEach((char, index) => {
    const isIncluded = index < INITIAL_UNLOCKED_COUNT;
    map[char] = {
      char,
      samples: [],
      timeToType: null,
      bestTimeToType: null,
      speed: null,
      bestSpeed: null,
      confidence: null,
      bestConfidence: null,
      accuracy: 1.0,
      masteryScore: 0,
      totalHits: 0,
      totalMisses: 0,
      consecutiveMissDrills: 0,
      transitions: {},
      isIncluded,
      isFocused: index === 0, // start with 'e'
      isForced: false,
    };
  });
  return map;
}

// Signals
export const [isKeybrActive, setIsKeybrActive] = createSignal<boolean>(false);
export const [keybrSettings, setKeybrSettings] =
  createSignal<KeybrSettings>(DEFAULT_SETTINGS);
export const [keyCalibrationMap, setKeyCalibrationMap] = createSignal<
  Record<string, KeyCalibrationData>
>(createDefaultKeyMap(DEFAULT_SETTINGS.targetWpm));
export const [focusedKey, setFocusedKey] = createSignal<string>("e");
export const [focusedWeakBigrams, setFocusedWeakBigrams] = createSignal<
  string[]
>([]);
export const [isRemediationActive, setIsRemediationActive] =
  createSignal<boolean>(false);
export const [depressedKeys, setDepressedKeys] = createSignal<string[]>([]);
export const [recentTransitions, setRecentTransitions] = createSignal<
  KeybrTransitionRecord[]
>([]);
export const [summaryMetrics, setSummaryMetrics] =
  createSignal<KeybrSummaryMetrics>({
    speed: { last: 0, delta: 0 },
    accuracy: { last: 0, delta: 0 },
    score: { last: 0, delta: 0 },
  });
export const [streaks, setStreaks] = createSignal<KeybrStreak[]>([
  { level: 0.95, count: 0 },
  { level: 1.0, count: 0 },
]);
export const [dailyGoal, setDailyGoal] = createSignal<KeybrDailyGoal>({
  goalSeconds: 30 * 60,
  spentSeconds: 0,
  completedPercent: 0,
});
export const [lastLessonHeatmap, setLastLessonHeatmap] = createSignal<{
  hits: Record<string, number>;
  misses: Record<string, number>;
}>({ hits: {}, misses: {} });

// Interactive Drill / Typing State
export const [activeLessonWords, setActiveLessonWords] = createSignal<string[]>(
  [],
);
export const [activeLessonText, setActiveLessonText] = createSignal<string>("");
export const [cursorIndex, setCursorIndex] = createSignal<number>(0);
export const [hasError, setHasError] = createSignal<boolean>(false);
export const [lessonHits, setLessonHits] = createSignal<Record<string, number>>(
  {},
);
export const [lessonMisses, setLessonMisses] = createSignal<
  Record<string, number>
>({});
export const [lessonStartTime, setLessonStartTime] = createSignal<number>(0);
let lastKeystrokeTime = 0;
let lastTypedChar = "";
let transitionIdCounter = 0;
let afkPausedMs = 0;
const AFK_THRESHOLD_MS = 1500;

// In-memory filters for speed smoothing
const letterFilters = new Map<string, ExponentialFilter>();

function getFilter(char: string): ExponentialFilter {
  let f = letterFilters.get(char);
  if (!f) {
    f = new ExponentialFilter(0.1);
    letterFilters.set(char, f);
  }
  return f;
}

// Load state from localStorage
export function loadKeybrState(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null || raw === "") return;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const settingsVal = parsed["settings"];
    if (settingsVal !== null && typeof settingsVal === "object") {
      setKeybrSettings({
        ...DEFAULT_SETTINGS,
        ...(settingsVal as Partial<KeybrSettings>),
      });
    }
    const keyMapVal = parsed["keyMap"];
    if (keyMapVal !== null && typeof keyMapVal === "object") {
      const parsedSettings = settingsVal as Partial<KeybrSettings> | undefined;
      const targetWpm = parsedSettings?.targetWpm ?? DEFAULT_SETTINGS.targetWpm;
      const cleanMap = createDefaultKeyMap(targetWpm);
      const parsedKeyMap = keyMapVal as Record<
        string,
        Partial<KeyCalibrationData>
      >;
      for (const [k, v] of Object.entries(parsedKeyMap)) {
        if (cleanMap[k] !== undefined) {
          cleanMap[k] = { ...cleanMap[k], ...v };
          const time = cleanMap[k].timeToType;
          if (time !== null && time > 0) {
            getFilter(k).add(time);
          }
        }
      }
      setKeyCalibrationMap(cleanMap);
    }
    const focusedKeyVal = parsed["focusedKey"];
    if (typeof focusedKeyVal === "string" && focusedKeyVal !== "") {
      setFocusedKey(focusedKeyVal);
    }
    const summaryMetricsVal = parsed["summaryMetrics"];
    if (summaryMetricsVal !== null && typeof summaryMetricsVal === "object") {
      setSummaryMetrics(summaryMetricsVal as KeybrSummaryMetrics);
    }
    const streaksVal = parsed["streaks"];
    if (Array.isArray(streaksVal)) {
      setStreaks(streaksVal as KeybrStreak[]);
    }
    const dailyGoalVal = parsed["dailyGoal"];
    if (dailyGoalVal !== null && typeof dailyGoalVal === "object") {
      setDailyGoal(dailyGoalVal as KeybrDailyGoal);
    }
  } catch (e) {
    console.error("Failed to load Keybr state", e);
  }
}

// Save state to localStorage
export function saveKeybrState(): void {
  try {
    const state = {
      settings: keybrSettings(),
      keyMap: keyCalibrationMap(),
      focusedKey: focusedKey(),
      summaryMetrics: summaryMetrics(),
      streaks: streaks(),
      dailyGoal: dailyGoal(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save Keybr state", e);
  }
}

// Update calibration on letter typed
export function recordKeystroke(
  char: string,
  timeToTypeMs: number,
  correct: boolean,
  prevChar?: string | null,
): void {
  const lower = char.toLowerCase();
  const currentMap = { ...keyCalibrationMap() };
  const keyData = currentMap[lower];
  if (!keyData) return;

  const filter = getFilter(lower);
  const filteredTime = filter.add(timeToTypeMs);

  const newSample = {
    index: keyData.samples.length,
    timeStamp: Date.now(),
    hitCount: correct ? 1 : 0,
    missCount: correct ? 0 : 1,
    timeToType: timeToTypeMs,
    filteredTimeToType: filteredTime,
  };

  const targetWpm = keybrSettings().targetWpm;
  const speed = timeToSpeed(filteredTime);
  const bestTimeToType =
    keyData.bestTimeToType !== null
      ? Math.min(keyData.bestTimeToType, filteredTime)
      : filteredTime;
  const bestSpeed = timeToSpeed(bestTimeToType);
  const confidence = computeConfidence(filteredTime, targetWpm);
  const bestConfidence = computeConfidence(bestTimeToType, targetWpm);

  const allSamples = [...keyData.samples.slice(-40), newSample];
  const recentAcc = calculateRecentAccuracy(allSamples);
  const mastery = computeKeyMasteryScore(speed, recentAcc, targetWpm);

  // Update bigram transition tracking if previous char is a letter
  const transitions = { ...(keyData.transitions ?? {}) };
  if (prevChar?.length === 1 && prevChar !== "·") {
    const prevLower = prevChar.toLowerCase();
    const existing = transitions[prevLower] ?? {
      count: 0,
      errors: 0,
      avgTimeMs: timeToTypeMs,
    };
    transitions[prevLower] = {
      count: existing.count + 1,
      errors: existing.errors + (correct ? 0 : 1),
      avgTimeMs: Math.round((existing.avgTimeMs + timeToTypeMs) / 2),
    };
  }

  currentMap[lower] = {
    ...keyData,
    samples: allSamples,
    timeToType: filteredTime,
    bestTimeToType,
    speed,
    bestSpeed,
    confidence,
    bestConfidence,
    accuracy: recentAcc,
    masteryScore: mastery,
    totalHits: keyData.totalHits + (correct ? 1 : 0),
    totalMisses: keyData.totalMisses + (correct ? 0 : 1),
    transitions,
  };

  setKeyCalibrationMap(currentMap);
}

// Complete lesson: update key unlocks, metrics and generate next drill
export function completeKeybrLesson(
  lessonSpeedWpm: number,
  lessonAccuracy: number,
  durationSeconds: number,
  hits: Record<string, number>,
  misses: Record<string, number>,
): void {
  setLastLessonHeatmap({ hits, misses });

  // Update daily goal
  const currentDaily = { ...dailyGoal() };
  currentDaily.spentSeconds += durationSeconds;
  currentDaily.completedPercent = Math.min(
    100,
    Math.round((currentDaily.spentSeconds / currentDaily.goalSeconds) * 100),
  );
  setDailyGoal(currentDaily);

  // Update streaks
  const currentStreaks = streaks().map((s) => {
    if (lessonAccuracy >= s.level) {
      return { ...s, count: s.count + 1 };
    }
    return { ...s, count: 0 };
  });
  setStreaks(currentStreaks);

  // Update summary metrics
  const prevMetrics = summaryMetrics();
  const score = Math.round(
    lessonSpeedWpm * lessonAccuracy * (1 + lessonSpeedWpm / 100),
  );
  const speedDelta =
    prevMetrics.speed.last > 0 ? lessonSpeedWpm - prevMetrics.speed.last : 0;
  const accDelta =
    prevMetrics.accuracy.last > 0
      ? Number((lessonAccuracy - prevMetrics.accuracy.last).toFixed(2))
      : 0;
  const scoreDelta =
    prevMetrics.score.last > 0 ? score - prevMetrics.score.last : 0;

  setSummaryMetrics({
    speed: { last: Math.round(lessonSpeedWpm), delta: Math.round(speedDelta) },
    accuracy: { last: Number(lessonAccuracy.toFixed(2)), delta: accDelta },
    score: { last: score, delta: scoreDelta },
  });

  const settings = keybrSettings();
  const currentMap = { ...keyCalibrationMap() };
  const unlockedLetters = KEYBR_ENGLISH_ORDER.filter(
    (k) => currentMap[k]?.isIncluded,
  );

  // Update consecutive miss drills on each unlocked letter
  for (const k of unlockedLetters) {
    const kData = currentMap[k];
    if (!kData) continue;
    const kMisses = misses[k] ?? 0;
    const kHits = hits[k] ?? 0;

    let missStreak = kData.consecutiveMissDrills ?? 0;
    if (kMisses > 0) {
      missStreak += 1;
    } else if (kHits > 0 && kMisses === 0) {
      missStreak = Math.max(0, missStreak - 1);
    }
    currentMap[k] = { ...kData, consecutiveMissDrills: missStreak };
  }

  // Check progression & unlock logic
  // Unlocking requires high speed (confidence >= 1.0) AND solid accuracy (>= 0.92)
  if (settings.autoUnlock) {
    const allMastered = unlockedLetters.every((k) => {
      const data = currentMap[k];
      const speedConf = (data?.bestConfidence ?? 0) >= 1.0;
      const accGood = (data?.accuracy ?? 1.0) >= 0.92;
      return speedConf && accGood;
    });

    if (allMastered && unlockedLetters.length < KEYBR_ENGLISH_ORDER.length) {
      const nextKey = KEYBR_ENGLISH_ORDER[unlockedLetters.length];
      if (nextKey && currentMap[nextKey]) {
        currentMap[nextKey] = {
          ...currentMap[nextKey],
          isIncluded: true,
        };
      }
    }
  }

  // Find weakest key to focus on using composite weakness ranking
  const includedKeys = KEYBR_ENGLISH_ORDER.filter(
    (k) => currentMap[k]?.isIncluded,
  );
  const rankedWeakKeys = getTopWeakKeys(currentMap, includedKeys);
  const weakest = rankedWeakKeys[0] ?? "e";
  const weakestData = currentMap[weakest];

  // If weakest key has low accuracy or consecutive miss drills, activate remediation mode
  const needsRemediation =
    (weakestData?.accuracy ?? 1.0) < 0.92 ||
    (weakestData?.consecutiveMissDrills ?? 0) > 0 ||
    (weakestData?.masteryScore ?? 0) < 0.85;

  setIsRemediationActive(needsRemediation);

  // Extract weak bigram transitions for focused key
  const weakBigrams = getTopWeakBigrams(weakestData?.transitions, 5);
  setFocusedWeakBigrams(weakBigrams);

  // Mark focused key
  for (const k of KEYBR_ENGLISH_ORDER) {
    if (currentMap[k]) {
      currentMap[k] = {
        ...currentMap[k],
        isFocused: k === weakest,
      };
    }
  }

  setFocusedKey(weakest);
  setKeyCalibrationMap(currentMap);
  saveKeybrState();

  // Trigger next drill
  if (isKeybrActive()) {
    startKeybrDrill();
  }
}

// Generate words and start test
export function startKeybrDrill(): void {
  const map = keyCalibrationMap();
  const unlocked = KEYBR_ENGLISH_ORDER.filter((k) => map[k]?.isIncluded);
  const focused = focusedKey();
  const settings = keybrSettings();
  const remediation = isRemediationActive();
  const targetedBigrams = focusedWeakBigrams();

  // Secondary weak keys for blended practice
  const rankedWeak = getTopWeakKeys(map, unlocked);
  const secondaryChars = rankedWeak.slice(1, 3);

  const words = generateKeybrLessonWords({
    unlockedChars: unlocked,
    focusedChar: focused,
    targetedBigrams,
    secondaryChars,
    remediationMode: remediation,
    minLength: 3,
    maxLength: 8,
    withCapitals: settings.withCapitals,
    withPunctuation: settings.withPunctuation,
    wordCount: 35,
  });

  const dotJoinedText = words.join("·");
  setActiveLessonWords(words);
  setActiveLessonText(dotJoinedText);
  setCursorIndex(0);
  setHasError(false);
  setLessonHits({});
  setLessonMisses({});
  setRecentTransitions([]);
  setLessonStartTime(0);
  lastKeystrokeTime = 0;
  lastTypedChar = "";
  afkPausedMs = 0;

  const drillType = remediation ? "REMEDIATION" : "PRACTICE";
  const drillTitle = `Keybr ${drillType} [Key: ${focused.toUpperCase()} | ${unlocked.length}/26 Keys]`;

  CustomText.setCustomText(drillTitle, words.join(" "), false);
  CustomText.setMode("repeat");
  CustomText.setPipeDelimiter(false);
  CustomText.setText(words);
  CustomText.setLimitMode("word");
  CustomText.setLimitValue(words.length);
  setCustomTextIndicator({
    name: drillTitle,
    isLong: false,
  });

  setIsKeybrActive(true);
  setConfig("mode", "custom");
  restartTestEvent.dispatch();
  hideModal("TrainingModal");
  hideModal("KeybrSettingsModal");
}

export function resetKeybrLesson(): void {
  startKeybrDrill();
}

export function skipKeybrLesson(): void {
  startKeybrDrill();
}

export function handleKeybrInput(event: KeyboardEvent): void {
  if (!isKeybrActive()) return;

  // Shortcuts
  if (event.key === "Escape") {
    event.preventDefault();
    resetKeybrLesson();
    return;
  }
  if (event.ctrlKey && (event.key === "ArrowRight" || event.key === "Right")) {
    event.preventDefault();
    skipKeybrLesson();
    return;
  }
  if (event.ctrlKey && (event.key === "ArrowLeft" || event.key === "Left")) {
    event.preventDefault();
    resetKeybrLesson();
    return;
  }

  // Prevent backspace & tab default navigation
  if (event.key === "Backspace" || event.key === "Tab") {
    event.preventDefault();
    return;
  }

  // Ignore modifiers
  if (event.ctrlKey || event.altKey || event.metaKey) return;
  if (event.key.length !== 1) return;

  event.preventDefault();

  const text = activeLessonText();
  const cur = cursorIndex();
  if (cur >= text.length) return;

  const expected = text[cur];
  if (expected === undefined) return;
  const inputChar = event.key;

  // Keybr matching rule: space key matches middle dot '·'
  const isMatch =
    (expected === "·" &&
      (inputChar === " " || inputChar === "·" || inputChar === ".")) ||
    (expected !== "·" && inputChar === expected);

  const now = Date.now();
  if (lessonStartTime() === 0) {
    setLessonStartTime(now);
  }

  let delta = 250;
  if (lastKeystrokeTime > 0) {
    const rawGap = now - lastKeystrokeTime;
    if (rawGap > AFK_THRESHOLD_MS) {
      afkPausedMs += rawGap - AFK_THRESHOLD_MS;
      delta = AFK_THRESHOLD_MS;
    } else {
      delta = rawGap;
    }
  }
  lastKeystrokeTime = now;

  const prevChar = lastTypedChar;
  const currChar = expected === "·" ? "space" : expected.toLowerCase();

  // Push bigram transition for live keyboard SVG arc visualization
  if (
    prevChar !== "" &&
    prevChar !== "space" &&
    currChar !== "space" &&
    prevChar !== currChar
  ) {
    const newTrans: KeybrTransitionRecord = {
      fromKey: prevChar,
      toKey: currChar,
      error: !isMatch,
      timeMs: delta,
      id: ++transitionIdCounter,
    };
    setRecentTransitions((prev) => [...prev.slice(-25), newTrans]);
  }

  if (isMatch) {
    const isFirstAttempt = !hasError();
    const hits = { ...lessonHits() };
    const charKey = currChar;
    hits[charKey] = (hits[charKey] ?? 0) + (isFirstAttempt ? 1 : 0);
    setLessonHits(hits);

    if (expected !== "·") {
      recordKeystroke(expected, delta, isFirstAttempt, prevChar);
    }

    lastTypedChar = currChar;
    setHasError(false);
    void SoundController.playClick();

    const next = cur + 1;
    setCursorIndex(next);

    if (next >= text.length) {
      // Finished lesson
      const totalElapsed =
        Date.now() - (lessonStartTime() || Date.now() - 5000);
      const activeDurationMs = Math.max(1000, totalElapsed - afkPausedMs);
      const durationSec = activeDurationMs / 1000;

      let totalHits = 0;
      let totalMisses = 0;
      for (const h of Object.values(lessonHits())) totalHits += h;
      for (const m of Object.values(lessonMisses())) totalMisses += m;
      const total = totalHits + totalMisses;
      const acc = total > 0 ? totalHits / total : 1;
      const wpm = Number((totalHits / 5 / (durationSec / 60)).toFixed(1));

      completeKeybrLesson(wpm, acc, durationSec, lessonHits(), lessonMisses());
    }
  } else {
    // Error on key press: turn red, wait for correct key without advancing
    setHasError(true);
    const misses = { ...lessonMisses() };
    const charKey = currChar;
    misses[charKey] = (misses[charKey] ?? 0) + 1;
    setLessonMisses(misses);

    if (expected !== "·") {
      recordKeystroke(expected, delta, false, prevChar);
    }

    void SoundController.playError();
  }
}

export function resetAllKeybrProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
  letterFilters.clear();
  setKeyCalibrationMap(createDefaultKeyMap(DEFAULT_SETTINGS.targetWpm));
  setFocusedKey("e");
  setFocusedWeakBigrams([]);
  setIsRemediationActive(false);
  setRecentTransitions([]);
  setSummaryMetrics({
    speed: { last: 0, delta: 0 },
    accuracy: { last: 0, delta: 0 },
    score: { last: 0, delta: 0 },
  });
  setStreaks([
    { level: 0.95, count: 0 },
    { level: 1.0, count: 0 },
  ]);
  setDailyGoal({
    goalSeconds: 30 * 60,
    spentSeconds: 0,
    completedPercent: 0,
  });
  saveKeybrState();
  if (isKeybrActive()) {
    startKeybrDrill();
  }
}

export function updateKeybrSettings(partial: Partial<KeybrSettings>): void {
  const updated = { ...keybrSettings(), ...partial };
  setKeybrSettings(updated);
  saveKeybrState();
}

export function cycleKeybrWidthMode(): void {
  const modes: KeybrWidthMode[] = ["full", "wide", "normal", "compact"];
  const current = keybrSettings().widthMode ?? "full";
  const next = modes[(modes.indexOf(current) + 1) % modes.length] ?? "full";
  updateKeybrSettings({ widthMode: next });
}

export function cycleKeybrFontSize(): void {
  const sizes: KeybrFontSize[] = ["small", "medium", "large", "xlarge"];
  const current = keybrSettings().fontSize ?? "large";
  const next = sizes[(sizes.indexOf(current) + 1) % sizes.length] ?? "large";
  updateKeybrSettings({ fontSize: next });
}

// Set active state
export function setKeybrMode(active: boolean): void {
  setIsKeybrActive(active);
  if (active) {
    loadKeybrState();
    startKeybrDrill();
  }
}
