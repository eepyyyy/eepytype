import { createSignal, For, JSXElement, Show } from "solid-js";

import {
  changeKeybrCorpus,
  computeUserAverageWpm,
  dailyGoal,
  focusedKey,
  isRemediationActive,
  keyCalibrationMap,
  keybrSettings,
  KeybrCorpus,
  resetKeybrLesson,
  setKeybrTargetSpeedMode,
  skipKeybrLesson,
  streaks,
  summaryMetrics,
  toggleManualKeyInclusion,
} from "../../../../states/keybr";
import { showModal } from "../../../../states/modals";
import { cn } from "../../../../utils/cn";
import {
  calculateLearningRate,
  getConfidenceColor,
  getKeybrIndicatorState,
  KeyCalibrationData,
  timeToSpeed,
} from "../../../../utils/keybr/key-calibration";
import { KEYBR_ENGLISH_ORDER } from "../../../../utils/keybr/phonetic-model";
import { Fa } from "../../../common/Fa";
import { KeybrDetailsChart } from "./KeybrDetailsChart";

const CORPUS_OPTIONS: { id: KeybrCorpus; label: string }[] = [
  { id: "phonetic", label: "English (Keybr Phonetic)" },
  { id: "english", label: "English (Standard)" },
  { id: "english_1k", label: "English 1k" },
  { id: "english_5k", label: "English 5k" },
  { id: "english_10k", label: "English 10k" },
  { id: "english_25k", label: "English 25k" },
];

export function KeybrIndicators(): JSXElement {
  const [hoveredKey, setHoveredKey] = createSignal<KeyCalibrationData | null>(
    null,
  );
  const [tooltipPos, setTooltipPos] = createSignal<{
    x: number;
    y: number;
  } | null>(null);
  const [showColorCodingLegend, setShowColorCodingLegend] =
    createSignal<boolean>(false);

  const handleMouseEnter = (keyData: KeyCalibrationData, e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
    setHoveredKey(keyData);
  };

  const handleMouseLeave = () => {
    setHoveredKey(null);
    setTooltipPos(null);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  };

  const speedDelta = () => summaryMetrics().speed.delta;
  const accDelta = () => summaryMetrics().accuracy.delta;
  const scoreDelta = () => summaryMetrics().score.delta;

  const currentKeyData = () => keyCalibrationMap()[focusedKey().toLowerCase()];
  const currentLr = () =>
    calculateLearningRate(currentKeyData()?.samples ?? []);

  const currentConfPercent = () => {
    const conf = currentKeyData()?.confidence;
    return conf !== null && conf !== undefined ? Math.round(conf * 100) : 0;
  };

  return (
    <div class="mx-auto flex w-full max-w-4xl flex-col gap-2 font-mono text-xs select-none">
      {/* Row 1: Metrics + Action Toolbar */}
      <div class="flex flex-wrap items-center justify-between gap-3">
        {/* Left Metrics */}
        <div class="flex flex-wrap items-center gap-4 text-xs">
          <span class="font-bold text-sub/70 uppercase">Metrics:</span>

          {/* Speed Metric */}
          <div class="flex items-center gap-1">
            <span class="text-sub/80">Speed:</span>
            <span class="font-bold text-text">
              {summaryMetrics().speed.last > 0
                ? `${summaryMetrics().speed.last.toFixed(1)}wpm`
                : "0.0wpm"}
            </span>
            <Show when={speedDelta() !== 0}>
              <span
                class={cn(
                  "text-[11px] font-semibold",
                  speedDelta() > 0 ? "text-emerald-400" : "text-rose-400",
                )}
              >
                (
                {speedDelta() > 0
                  ? `↑+${speedDelta().toFixed(1)}wpm`
                  : `↓${speedDelta().toFixed(1)}wpm`}
                )
              </span>
            </Show>
          </div>

          {/* Accuracy Metric */}
          <div class="flex items-center gap-1">
            <span class="text-sub/80">Accuracy:</span>
            <span class="font-bold text-text">
              {Math.round(summaryMetrics().accuracy.last * 100)}%
            </span>
            <Show when={accDelta() !== 0}>
              <span
                class={cn(
                  "text-[11px] font-semibold",
                  accDelta() > 0 ? "text-emerald-400" : "text-rose-400",
                )}
              >
                (
                {accDelta() > 0
                  ? `↑+${(accDelta() * 100).toFixed(2)}%`
                  : `↓${(accDelta() * 100).toFixed(2)}%`}
                )
              </span>
            </Show>
          </div>

          {/* Score Metric */}
          <div class="flex items-center gap-1">
            <span class="text-sub/80">Score:</span>
            <span class="font-bold text-text">
              {summaryMetrics().score.last}
            </span>
            <Show when={scoreDelta() !== 0}>
              <span
                class={cn(
                  "text-[11px] font-semibold",
                  scoreDelta() > 0 ? "text-emerald-400" : "text-rose-400",
                )}
              >
                ({scoreDelta() > 0 ? `↑+${scoreDelta()}` : `↓${scoreDelta()}`})
              </span>
            </Show>
          </div>
        </div>

        {/* Top Right Action Toolbar & Language Dropdown */}
        <div class="flex items-center gap-2 text-sub">
          {/* Target Speed On-Page Selector */}
          <div class="flex items-center gap-1 rounded border border-sub-alt/60 bg-[#1e2023] p-0.5 font-mono text-[11px]">
            <span class="px-1 font-bold text-sub/70">Target:</span>
            <button
              type="button"
              onClick={() => setKeybrTargetSpeedMode("auto")}
              class={cn(
                "rounded px-1.5 py-0.5 font-semibold transition-all",
                keybrSettings().targetSpeedMode === "auto"
                  ? "border border-main/50 bg-main/20 font-bold text-main shadow-xs"
                  : "text-sub hover:text-text",
              )}
              title="Automatically match target speed to your typing speed so key colors accurately highlight your strong and weak keys"
            >
              Auto ({computeUserAverageWpm()}wpm)
            </button>
            <button
              type="button"
              onClick={() => {
                if (keybrSettings().targetSpeedMode === "auto") {
                  setKeybrTargetSpeedMode(
                    "custom",
                    keybrSettings().customTargetWpm || 35,
                  );
                }
              }}
              class={cn(
                "rounded px-1.5 py-0.5 font-semibold transition-all",
                keybrSettings().targetSpeedMode === "custom"
                  ? "border border-main/50 bg-main/20 font-bold text-main shadow-xs"
                  : "text-sub hover:text-text",
              )}
              title="Custom target speed"
            >
              Custom
            </button>
            <Show when={keybrSettings().targetSpeedMode === "custom"}>
              <select
                value={keybrSettings().targetWpm}
                onChange={(e) =>
                  setKeybrTargetSpeedMode(
                    "custom",
                    Number(e.currentTarget.value),
                  )
                }
                class="ml-0.5 h-5 rounded border border-sub-alt/40 bg-sub-alt/20 px-1 text-[11px] font-bold text-text outline-hidden"
              >
                <option value="20">20 wpm</option>
                <option value="25">25 wpm</option>
                <option value="30">30 wpm</option>
                <option value="35">35 wpm</option>
                <option value="40">40 wpm</option>
                <option value="50">50 wpm</option>
                <option value="60">60 wpm</option>
                <option value="70">70 wpm</option>
                <option value="80">80 wpm</option>
                <option value="90">90 wpm</option>
                <option value="100">100 wpm</option>
                <option value="120">120 wpm</option>
              </select>
            </Show>
          </div>

          {/* Corpus Selector */}
          <select
            value={keybrSettings().corpus}
            onChange={(e) =>
              changeKeybrCorpus(e.currentTarget.value as KeybrCorpus)
            }
            class="h-6 rounded border border-sub-alt/60 bg-[#1e2023] px-1.5 font-mono text-[11px] text-text/90 outline-hidden transition-all hover:border-main/50 focus:border-main"
            title="Select vocabulary corpus (English 10k, 5k, etc.)"
          >
            <For each={CORPUS_OPTIONS}>
              {(opt) => <option value={opt.id}>{opt.label}</option>}
            </For>
          </select>

          {/* Indicator Color Coding Help Button */}
          <button
            type="button"
            title="Indicator color coding guide"
            onClick={() => setShowColorCodingLegend((prev) => !prev)}
            class={cn(
              "flex h-6 w-6 items-center justify-center rounded text-xs font-bold transition-all",
              showColorCodingLegend()
                ? "bg-main text-bg"
                : "bg-sub-alt/30 text-sub hover:bg-sub-alt/70 hover:text-text",
            )}
          >
            <Fa icon="fa-question" />
          </button>

          {/* Reset Lesson */}
          <button
            type="button"
            title="Reset current lesson (Ctrl + Left Arrow)"
            onClick={() => resetKeybrLesson()}
            class="flex h-6 w-6 items-center justify-center rounded bg-sub-alt/30 text-sub transition-all hover:bg-sub-alt/70 hover:text-text"
          >
            <Fa icon="fa-undo" />
          </button>

          {/* Skip Lesson */}
          <button
            type="button"
            title="Skip current lesson (Ctrl + Right Arrow)"
            onClick={() => skipKeybrLesson()}
            class="flex h-6 w-6 items-center justify-center rounded bg-sub-alt/30 text-sub transition-all hover:bg-sub-alt/70 hover:text-text"
          >
            <Fa icon="fa-redo" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            title="Toggle fullscreen"
            onClick={toggleFullscreen}
            class="flex h-6 w-6 items-center justify-center rounded bg-sub-alt/30 text-sub transition-all hover:bg-sub-alt/70 hover:text-text"
          >
            <Fa icon="fa-expand" />
          </button>

          {/* Settings Modal Toggle */}
          <button
            type="button"
            title="Keybr Settings"
            onClick={() => showModal("KeybrSettingsModal")}
            class="flex h-6 w-6 items-center justify-center rounded bg-sub-alt/30 text-sub transition-all hover:bg-sub-alt/70 hover:text-text"
          >
            <Fa icon="fa-cog" />
          </button>
        </div>
      </div>

      {/* Row 2: All keys */}
      <div class="relative flex flex-wrap items-center gap-2">
        <span class="font-bold text-sub/70 uppercase">All keys:</span>

        <div class="flex flex-wrap items-center gap-1">
          <For each={KEYBR_ENGLISH_ORDER}>
            {(char) => {
              const keyData = () => keyCalibrationMap()[char];
              const isIncluded = () => keyData()?.isIncluded ?? false;
              const isFocused = () =>
                char.toLowerCase() === focusedKey().toLowerCase();
              const confidence = () => keyData()?.confidence ?? null;
              const indicatorState = () =>
                getKeybrIndicatorState(keyData(), isFocused());

              const bgStyle = () => {
                const st = indicatorState();
                if (st === "increased_frequency") return "#c05621";
                if (st === "non_calibrated") return "#383b40";
                if (
                  st === "calibrated" ||
                  st === "lowest_confidence" ||
                  st === "manually_included"
                ) {
                  return getConfidenceColor(confidence());
                }
                return undefined;
              };

              return (
                <div
                  onClick={() => toggleManualKeyInclusion(char)}
                  onMouseEnter={(e) => {
                    const d = keyData();
                    if (isIncluded() && d !== undefined) {
                      handleMouseEnter(d, e);
                    }
                  }}
                  onMouseLeave={handleMouseLeave}
                  title={`Key: ${char.toUpperCase()} (${indicatorState().replace("_", " ")}). Click to toggle inclusion.`}
                  class={cn(
                    "relative flex h-5 w-5 cursor-pointer items-center justify-center rounded-xs text-[11px] font-bold transition-all duration-100 select-none",
                    indicatorState() === "not_included" &&
                      "border-white/5 border bg-[#2b2e33]/90 text-sub/40 after:absolute after:inset-0 after:rotate-45 after:border-t-[1.5px] after:border-sub/50",
                    indicatorState() === "manually_included" &&
                      "text-white decoration-white font-black underline decoration-2 shadow-xs hover:scale-110",
                    indicatorState() === "increased_frequency" &&
                      "text-white shadow-amber-500/30 ring-amber-400 z-20 font-black shadow-md ring-2 ring-offset-1 ring-offset-[#1e2023] hover:scale-110",
                    indicatorState() === "non_calibrated" &&
                      "border-white/5 border font-bold text-sub/90 hover:scale-110",
                    (indicatorState() === "calibrated" ||
                      indicatorState() === "lowest_confidence") &&
                      "text-white font-bold shadow-xs hover:scale-110",
                  )}
                  style={{
                    "background-color": bgStyle(),
                  }}
                >
                  <span class="uppercase">{char}</span>
                </div>
              );
            }}
          </For>
        </div>

        {/* Expandable Indicator Color Coding Legend Drawer */}
        <Show when={showColorCodingLegend()}>
          <div class="animate-in fade-in zoom-in-95 absolute top-full left-0 z-50 mt-2 flex w-full max-w-xl flex-col gap-2.5 rounded-xl border border-sub-alt/60 bg-[#1e2023]/98 p-4 shadow-2xl backdrop-blur-md">
            <div class="flex items-center justify-between border-b border-sub-alt/40 pb-2">
              <span class="text-center text-sm font-bold text-text sm:text-base">
                Indicator color coding.
              </span>
              <button
                type="button"
                onClick={() => setShowColorCodingLegend(false)}
                class="flex h-5 w-5 items-center justify-center rounded text-sub hover:bg-sub-alt/40 hover:text-text"
              >
                ✕
              </button>
            </div>

            <ul class="flex flex-col gap-2.5 text-left text-xs leading-relaxed text-sub/90">
              {/* 1. Non-calibrated key */}
              <li class="flex items-start gap-2.5">
                <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-xs bg-[#383b40] text-xs font-bold text-sub/90 shadow-xs">
                  ?
                </span>
                <span>
                  <strong class="font-semibold text-text">
                    A non-calibrated key
                  </strong>{" "}
                  with an unknown confidence level. You still have not pressed
                  this key yet.
                </span>
              </li>

              {/* 2. Calibrated key with lowest confidence */}
              <li class="flex items-start gap-2.5">
                <span class="text-white flex h-5 w-5 shrink-0 items-center justify-center rounded-xs bg-[#c53030] text-xs font-bold shadow-xs">
                  ?
                </span>
                <span>
                  <strong class="font-semibold text-text">
                    A calibrated key with the lowest confidence level.
                  </strong>{" "}
                  The more times you press this key, the more accurate this
                  metric becomes.
                </span>
              </li>

              {/* 3. Calibrated key with highest confidence */}
              <li class="flex items-start gap-2.5">
                <span class="text-white flex h-5 w-5 shrink-0 items-center justify-center rounded-xs bg-[#38a169] text-xs font-bold shadow-xs">
                  ?
                </span>
                <span>
                  <strong class="font-semibold text-text">
                    A calibrated key with the highest confidence level.
                  </strong>{" "}
                  The more times you press this key, the more accurate this
                  metric becomes.
                </span>
              </li>

              {/* 4. Increased frequency key */}
              <li class="flex items-start gap-2.5">
                <span class="text-white ring-amber-400/80 flex h-5 w-5 shrink-0 items-center justify-center rounded-xs bg-[#c05621] text-xs font-black shadow-xs ring-1">
                  ?
                </span>
                <span>
                  <strong class="font-semibold text-text">
                    A key with increased frequency.
                  </strong>{" "}
                  It takes you the most time to find this key so the algorithm
                  chose it to be included in every generated word.
                </span>
              </li>

              {/* 5. Manually included key */}
              <li class="flex items-start gap-2.5">
                <span class="text-white decoration-white flex h-5 w-5 shrink-0 items-center justify-center rounded-xs bg-[#4a5568] text-xs font-bold underline decoration-2 shadow-xs">
                  ?
                </span>
                <span>
                  <strong class="font-semibold text-text">
                    A key which was manually included
                  </strong>{" "}
                  in the lessons. Click any key badge to toggle manual
                  inclusion.
                </span>
              </li>

              {/* 6. Not yet included key */}
              <li class="flex items-start gap-2.5">
                <span class="border-white/5 relative flex h-5 w-5 shrink-0 items-center justify-center rounded-xs border bg-[#2b2e33] text-xs font-normal text-sub/40 after:absolute after:inset-0 after:rotate-45 after:border-t-[1.5px] after:border-sub/60">
                  ?
                </span>
                <span>
                  <strong class="font-semibold text-text">
                    A key which was not yet included
                  </strong>{" "}
                  in the lessons. Unlocks sequentially as confidence reaches
                  95%+.
                </span>
              </li>
            </ul>
          </div>
        </Show>
      </div>

      {/* Row 3: Current key info */}
      <div class="flex flex-wrap items-center gap-2">
        <span class="font-bold text-sub/70 uppercase">Current key:</span>
        <div class="text-white ring-amber-400/60 flex h-5 w-5 items-center justify-center rounded-xs bg-[#c05621] text-[11px] font-black shadow-sm ring-1">
          <span class="uppercase">{focusedKey()}</span>
        </div>

        <Show
          when={
            currentKeyData() !== undefined &&
            (currentKeyData()?.samples.length ?? 0) > 0 &&
            currentKeyData()?.confidence !== null
          }
          fallback={
            <span class="font-medium text-sub/80">
              Not calibrated, need more samples.
            </span>
          }
        >
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-bold text-text">
              {currentKeyData()?.speed !== null
                ? `${currentKeyData()?.speed?.toFixed(1)}wpm`
                : "0wpm"}
              <span class="ml-1 font-normal text-sub/70">
                ({currentConfPercent()}%)
              </span>
            </span>

            <Show when={currentKeyData()?.bestSpeed !== null}>
              <span class="text-sub/70">
                Top speed:{" "}
                <strong class="font-bold text-text">
                  {currentKeyData()?.bestSpeed?.toFixed(1)}wpm
                </strong>
                <span class="ml-1 text-sub/60">
                  (
                  {Math.round(
                    ((currentKeyData()?.bestSpeed ?? 0) /
                      keybrSettings().targetWpm) *
                      100,
                  )}
                  %)
                </span>
              </span>
            </Show>

            <span class="text-emerald-400 text-[11px] font-bold">
              Learning rate:{" "}
              {currentLr().learningRate !== null
                ? `+${currentLr().learningRate?.toFixed(1)}wpm/lesson`
                : "+0.2wpm/lesson"}
            </span>
          </div>
        </Show>

        {/* Remediation Status Tag */}
        <Show when={isRemediationActive()}>
          <span class="border-rose-500/30 bg-rose-500/20 text-rose-400 rounded border px-1.5 py-0.5 text-[9px] font-extrabold">
            REMEDIATION
          </span>
        </Show>
      </div>

      {/* Row 4: Accuracy Streak */}
      <div class="flex flex-wrap items-center gap-2">
        <span class="font-bold text-sub/70 uppercase">Accuracy:</span>
        <span class="font-medium text-text/90">
          {(() => {
            const firstStreak = streaks()[0];
            return firstStreak !== undefined && firstStreak.count > 0
              ? `${firstStreak.count} lessons with 95% accuracy.`
              : "Target 95% accuracy.";
          })()}
        </span>
      </div>

      {/* Row 5: Daily Goal with clean Full-Width Progress Track */}
      <div class="flex flex-wrap items-center gap-3">
        <span class="shrink-0 font-bold text-sub/70 uppercase">
          Daily goal:
        </span>
        <span class="shrink-0 font-medium text-text/90">
          {dailyGoal().completedPercent}%/{keybrSettings().dailyGoalMinutes}{" "}
          minutes
        </span>
        <div class="border-white/5 h-2 min-w-[160px] flex-1 overflow-hidden rounded-full border bg-[#25282c]">
          <div
            class="h-full rounded-full bg-[#38a169] shadow-sm transition-all duration-300"
            style={{
              width: `${Math.min(100, dailyGoal().completedPercent)}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Hover Popup Tooltip with KeybrDetailsChart */}
      <Show when={hoveredKey()}>
        {(stats) => {
          const lr = () => calculateLearningRate(stats().samples);
          const conf = () => stats().confidence ?? 0;
          const confPercent = () => Math.round(conf() * 100);
          const isUnlocked = () => stats().isIncluded;
          const targetWpm = () => keybrSettings().targetWpm;

          const speedDisplay = () => {
            const t = stats().timeToType;
            if (t !== null && t !== undefined) {
              return timeToSpeed(t);
            }
            return stats().speed ?? 0;
          };

          const topSpeedDisplay = () => {
            const t = stats().bestTimeToType;
            if (t !== null && t !== undefined) {
              return timeToSpeed(t);
            }
            return stats().bestSpeed ?? speedDisplay();
          };

          const topConfPercent = () => {
            const topSpd = topSpeedDisplay();
            return Math.round((topSpd / targetWpm()) * 100);
          };

          const remainingLessons = () => {
            const rate = lr().learningRate;
            if (rate !== null && rate > 0) {
              const curSpd = speedDisplay();
              return Math.max(1, Math.ceil((targetWpm() - curSpd) / rate));
            }
            return null;
          };

          const tooltipLeft = () => {
            const pos = tooltipPos();
            const defaultX = window.innerWidth / 2;
            const rawX = pos ? pos.x : defaultX;
            const maxBound = window.innerWidth - 300;
            return Math.max(300, Math.min(maxBound, rawX));
          };

          const tooltipTop = () => {
            const pos = tooltipPos();
            return pos ? pos.y : 200;
          };

          return (
            <div
              class="animate-in fade-in zoom-in-95 pointer-events-none fixed z-50 flex w-[580px] max-w-[95vw] -translate-x-1/2 -translate-y-full flex-col gap-3 rounded-xl border border-[#3a3d42] bg-[#26292d]/98 p-4 font-mono text-xs text-text shadow-2xl backdrop-blur-md duration-150"
              style={{
                left: `${tooltipLeft()}px`,
                top: `${tooltipTop()}px`,
              }}
            >
              {/* Top Header Row */}
              <div class="flex items-center gap-3">
                <div
                  class="text-white flex h-7 w-7 shrink-0 items-center justify-center rounded-xs text-sm font-black shadow-sm"
                  style={{
                    "background-color": getConfidenceColor(stats().confidence),
                  }}
                >
                  <span class="uppercase">{stats().char}</span>
                </div>

                <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <div class="flex items-center gap-1">
                    <span class="text-sub/80">Last speed:</span>
                    <span class="font-bold text-text">
                      {speedDisplay() > 0
                        ? `${speedDisplay().toFixed(1)}wpm`
                        : "0.0wpm"}
                    </span>
                    <span class="text-sub/60">({confPercent()}%)</span>
                  </div>

                  <div class="flex items-center gap-1">
                    <span class="text-sub/80">Top speed:</span>
                    <span class="font-bold text-text">
                      {topSpeedDisplay() > 0
                        ? `${topSpeedDisplay().toFixed(1)}wpm`
                        : "0.0wpm"}
                    </span>
                    <span class="text-sub/60">({topConfPercent()}%)</span>
                  </div>

                  <div class="flex items-center gap-1">
                    <span class="text-sub/80">Learning rate:</span>
                    <span class="text-emerald-400 font-bold">
                      {lr().learningRate !== null
                        ? `+${lr().learningRate?.toFixed(1)}wpm/lesson`
                        : "+0.2wpm/lesson"}
                    </span>
                    <span class="text-emerald-400 text-sm">☺</span>
                  </div>
                </div>
              </div>

              {/* Subtitle Status Description */}
              <div class="border-y border-[#3a3d42]/60 py-1.5 text-center text-xs text-sub/90">
                <Show
                  when={isUnlocked()}
                  fallback={
                    <span class="text-amber-400/90">
                      {remainingLessons() !== null
                        ? `Approximately ${remainingLessons()} lessons remaining to unlock the next letter (${Math.round((lr().certainty ?? 0.8) * 100)}% certainty).`
                        : "Need more data to compute the remaining lessons to unlock this letter."}
                    </span>
                  }
                >
                  <span class="font-medium text-text">
                    This letter is already unlocked.
                  </span>
                </Show>
              </div>

              {/* SVG Regression & Scatter Chart */}
              <KeybrDetailsChart
                samples={stats().samples}
                targetWpm={targetWpm()}
                isUnlocked={isUnlocked()}
              />
            </div>
          );
        }}
      </Show>
    </div>
  );
}
