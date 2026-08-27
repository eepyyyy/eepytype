import { createSignal, For, JSXElement, Show } from "solid-js";

import {
  cycleKeybrFontSize,
  cycleKeybrWidthMode,
  dailyGoal,
  focusedKey,
  focusedWeakBigrams,
  isRemediationActive,
  keyCalibrationMap,
  keybrSettings,
  resetKeybrLesson,
  skipKeybrLesson,
  streaks,
  summaryMetrics,
  updateKeybrSettings,
} from "../../../../states/keybr";
import { showModal } from "../../../../states/modals";
import { cn } from "../../../../utils/cn";
import {
  calculateLearningRate,
  getConfidenceColor,
  getTopWeakBigrams,
  KeyCalibrationData,
} from "../../../../utils/keybr/key-calibration";
import { KEYBR_ENGLISH_ORDER } from "../../../../utils/keybr/phonetic-model";
import { Fa } from "../../../common/Fa";

export function KeybrIndicators(): JSXElement {
  const [hoveredKey, setHoveredKey] = createSignal<KeyCalibrationData | null>(
    null,
  );
  const [tooltipPos, setTooltipPos] = createSignal<{
    x: number;
    y: number;
  } | null>(null);

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

  const currentKeyData = () => keyCalibrationMap()[focusedKey().toLowerCase()];
  const currentLr = () =>
    calculateLearningRate(currentKeyData()?.samples ?? []);
  const speedDelta = () => summaryMetrics().speed.delta;
  const accDelta = () => summaryMetrics().accuracy.delta;
  const scoreDelta = () => summaryMetrics().score.delta;

  const currentConfPercent = () => {
    const conf = currentKeyData()?.confidence;
    return conf !== null && conf !== undefined ? Math.round(conf * 100) : 0;
  };

  const cycleViewMode = () => {
    const modes = ["normal", "compact", "bare"] as const;
    const current = keybrSettings().viewMode;
    const next = modes[(modes.indexOf(current) + 1) % modes.length] ?? "normal";
    updateKeybrSettings({ viewMode: next });
  };

  return (
    <div class="mx-auto flex w-full flex-col gap-3 font-mono text-xs select-none">
      {/* Row 1: Metrics + Action Toolbar */}
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-sub-alt/30 pb-2.5">
        <div class="flex items-center gap-3">
          <span class="text-[11px] font-bold tracking-wider text-sub/80 uppercase">
            Metrics:
          </span>
          <div class="flex flex-wrap items-center gap-4 text-sub sm:gap-6">
            {/* Speed */}
            <div class="flex items-center gap-1.5">
              <span class="text-sub/70">Speed:</span>
              <span class="font-bold text-text">
                {summaryMetrics().speed.last}wpm
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
                    ? `↑+${speedDelta()}wpm`
                    : `↓${speedDelta()}wpm`}
                  )
                </span>
              </Show>
            </div>

            {/* Accuracy */}
            <div class="flex items-center gap-1.5">
              <span class="text-sub/70">Accuracy:</span>
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
                    ? `↑+${Math.round(accDelta() * 100)}%`
                    : `↓${Math.round(accDelta() * 100)}%`}
                  )
                </span>
              </Show>
            </div>

            {/* Score */}
            <div class="flex items-center gap-1.5">
              <span class="text-sub/70">Score:</span>
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
                  ({scoreDelta() > 0 ? `↑+${scoreDelta()}` : `↓${scoreDelta()}`}
                  )
                </span>
              </Show>
            </div>
          </div>
        </div>

        {/* Top Right Action Toolbar */}
        <div class="flex items-center gap-1 text-sub">
          {/* Width Mode Toggle */}
          <button
            type="button"
            title={`Adjust Width (Current: ${keybrSettings().widthMode})`}
            onClick={() => cycleKeybrWidthMode()}
            class="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-all hover:bg-sub-alt/40 hover:text-text"
          >
            <Fa icon="fa-arrows-alt-h" />
            <span class="hidden text-[10px] uppercase sm:inline">
              {keybrSettings().widthMode}
            </span>
          </button>

          {/* Font Size Toggle */}
          <button
            type="button"
            title={`Adjust Font Size (Current: ${keybrSettings().fontSize})`}
            onClick={() => cycleKeybrFontSize()}
            class="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-all hover:bg-sub-alt/40 hover:text-text"
          >
            <Fa icon="fa-font" />
            <span class="hidden text-[10px] uppercase sm:inline">
              {keybrSettings().fontSize}
            </span>
          </button>

          {/* View Mode Toggle (Normal/Compact/Bare) */}
          <button
            type="button"
            title={`View Mode (Current: ${keybrSettings().viewMode})`}
            onClick={cycleViewMode}
            class="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-sub-alt/40 hover:text-text"
          >
            <Fa icon="fa-keyboard" />
          </button>

          <button
            type="button"
            title="Restart Lesson (Esc)"
            onClick={() => resetKeybrLesson()}
            class="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-sub-alt/40 hover:text-text"
          >
            <Fa icon="fa-undo" />
          </button>

          <button
            type="button"
            title="Skip Lesson (Ctrl+Right)"
            onClick={() => skipKeybrLesson()}
            class="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-sub-alt/40 hover:text-text"
          >
            <Fa icon="fa-redo" />
          </button>

          <button
            type="button"
            title="Toggle Fullscreen"
            onClick={toggleFullscreen}
            class="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-sub-alt/40 hover:text-text"
          >
            <Fa icon="fa-expand" />
          </button>

          <button
            type="button"
            title="Settings & Layout Options"
            onClick={() => showModal("KeybrSettingsModal")}
            class="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-sub-alt/40 hover:text-text"
          >
            <Fa icon="fa-cog" />
          </button>
        </div>
      </div>

      {/* Row 2: All keys confidence visualizer */}
      <div class="flex flex-wrap items-center gap-2">
        <span class="w-24 text-left text-[11px] font-bold tracking-wider text-sub/70 uppercase sm:text-right">
          All keys:
        </span>
        <div class="flex flex-wrap items-center gap-1">
          <For each={KEYBR_ENGLISH_ORDER}>
            {(char) => {
              const keyData = () => keyCalibrationMap()[char];
              const isIncluded = () => keyData()?.isIncluded ?? false;
              const isFocused = () =>
                char.toLowerCase() === focusedKey().toLowerCase();
              const confidence = () => keyData()?.confidence ?? null;

              return (
                <div
                  onMouseEnter={(e) => {
                    const d = keyData();
                    if (isIncluded() && d !== undefined) {
                      handleMouseEnter(d, e);
                    }
                  }}
                  onMouseLeave={handleMouseLeave}
                  class={cn(
                    "relative flex h-5 w-5 cursor-pointer items-center justify-center rounded-xs text-[11px] font-bold transition-all duration-100 select-none",
                    isIncluded()
                      ? "text-bg shadow-xs hover:scale-110"
                      : "bg-sub-alt/25 text-sub/40 after:absolute after:inset-0 after:rotate-45 after:border-t after:border-sub/40",
                    isFocused() &&
                      "z-10 ring-2 ring-main ring-offset-1 ring-offset-bg",
                  )}
                  style={{
                    "background-color": isIncluded()
                      ? getConfidenceColor(confidence())
                      : undefined,
                  }}
                >
                  <span class="uppercase">{char}</span>
                </div>
              );
            }}
          </For>
        </div>
      </div>

      {/* Row 3: Current key info + Accuracy + Daily goal */}
      <div class="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-3 sm:gap-4">
        {/* Current Focus Key */}
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[11px] font-bold tracking-wider text-sub/70 uppercase">
            Current key:
          </span>
          <div
            class="flex h-5 w-5 items-center justify-center rounded-xs text-[11px] font-black text-bg shadow-sm"
            style={{
              "background-color": getConfidenceColor(
                currentKeyData()?.confidence ?? null,
              ),
            }}
          >
            <span class="uppercase">{focusedKey()}</span>
          </div>
          <span class="font-bold text-text">
            {currentKeyData()?.speed !== null &&
            currentKeyData()?.speed !== undefined
              ? `${currentKeyData()?.speed}wpm`
              : "0wpm"}{" "}
            <span class="font-normal text-sub/70">
              ({currentConfPercent()}%)
            </span>
          </span>
          <span class="text-emerald-400 text-[11px] font-bold">
            {currentLr().learningRate !== null
              ? `+${currentLr().learningRate}wpm`
              : "+0.3wpm"}
          </span>

          {/* Remediation Status Tag */}
          <Show when={isRemediationActive()}>
            <span class="bg-rose-500/20 text-rose-400 border-rose-500/30 rounded border px-1.5 py-0.5 text-[9px] font-extrabold">
              REMEDIATION
            </span>
          </Show>
        </div>

        {/* Accuracy Streak & Weak Bigrams */}
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[11px] font-bold tracking-wider text-sub/70 uppercase">
            Accuracy:
          </span>
          <span class="font-medium text-text/90">
            {(() => {
              const firstStreak = streaks()[0];
              return firstStreak !== undefined && firstStreak.count > 0
                ? `${firstStreak.count} consecutive with 95% acc.`
                : "Target 95% accuracy";
            })()}
          </span>
          <Show when={focusedWeakBigrams().length > 0}>
            <span class="text-amber-400/90 text-[10px] font-semibold">
              [Focus: {focusedWeakBigrams().join(", ")}]
            </span>
          </Show>
        </div>

        {/* Daily Goal */}
        <div class="flex items-center gap-2">
          <span class="text-[11px] font-bold tracking-wider text-sub/70 uppercase">
            Daily goal:
          </span>
          <span class="font-medium text-text/90">
            {dailyGoal().completedPercent}%/{keybrSettings().dailyGoalMinutes}m
          </span>
          <div class="h-2 max-w-[120px] flex-1 overflow-hidden rounded-full bg-sub-alt/40">
            <div
              class="h-full rounded-full bg-main transition-all duration-300"
              style={{
                width: `${Math.min(100, dailyGoal().completedPercent)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <Show when={hoveredKey()}>
        {(stats) => {
          const lr = () => calculateLearningRate(stats().samples);
          const weakBigrams = () => getTopWeakBigrams(stats().transitions, 3);
          const totalHits = () => stats().totalHits ?? 0;
          const totalMisses = () => stats().totalMisses ?? 0;
          const totalKeystrokes = () => totalHits() + totalMisses();
          const accPercent = () =>
            totalKeystrokes() > 0
              ? Math.round((totalHits() / totalKeystrokes()) * 100)
              : 100;

          return (
            <div
              class="animate-in fade-in zoom-in-95 pointer-events-none fixed z-50 flex min-w-[200px] -translate-x-1/2 -translate-y-full flex-col gap-1 rounded-xl border border-sub-alt bg-bg/95 p-3 font-mono text-xs text-text shadow-xl backdrop-blur-md duration-150"
              style={{
                left: `${tooltipPos()?.x ?? 0}px`,
                top: `${tooltipPos()?.y ?? 0}px`,
              }}
            >
              <div class="flex items-center justify-between gap-4 border-b border-sub-alt/50 pb-1.5">
                <span class="text-sm font-bold text-main">
                  Key: {stats().char.toUpperCase()}
                </span>
                <span
                  class="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                  style={{
                    "background-color": getConfidenceColor(stats().confidence),
                    color: "#18181b",
                  }}
                >
                  {stats().confidence !== null
                    ? `${Math.round((stats().confidence ?? 0) * 100)}%`
                    : "N/A"}
                </span>
              </div>

              <div class="flex flex-col gap-1 pt-1 text-[11px]">
                <div class="flex justify-between gap-4 text-sub">
                  <span>Current Speed:</span>
                  <span class="font-bold text-text">
                    {stats().speed !== null ? `${stats().speed} wpm` : "N/A"}
                  </span>
                </div>
                <div class="flex justify-between gap-4 text-sub">
                  <span>Top Speed:</span>
                  <span class="font-bold text-text">
                    {stats().bestSpeed !== null
                      ? `${stats().bestSpeed} wpm`
                      : "N/A"}
                  </span>
                </div>
                <div class="flex justify-between gap-4 text-sub">
                  <span>Accuracy:</span>
                  <span
                    class={cn(
                      "font-bold",
                      accPercent() >= 95
                        ? "text-emerald-400"
                        : "text-amber-400",
                    )}
                  >
                    {accPercent()}% ({totalHits()}h / {totalMisses()}m)
                  </span>
                </div>
                <div class="flex justify-between gap-4 text-sub">
                  <span>Learning Rate:</span>
                  <span class="text-emerald-400 font-bold">
                    {lr().learningRate !== null
                      ? `+${lr().learningRate} wpm/drill`
                      : "Calibrating"}
                  </span>
                </div>
                <div class="flex justify-between gap-4 text-sub">
                  <span>Samples Collected:</span>
                  <span class="font-bold text-text">
                    {stats().samples.length}
                  </span>
                </div>

                <Show when={weakBigrams().length > 0}>
                  <div class="mt-1 flex justify-between gap-2 border-t border-sub-alt/30 pt-1 text-[10px]">
                    <span class="text-rose-400 font-semibold">
                      Weak Transitions:
                    </span>
                    <span class="font-bold text-text uppercase">
                      {weakBigrams().join(", ")}
                    </span>
                  </div>
                </Show>
              </div>
            </div>
          );
        }}
      </Show>
    </div>
  );
}
