import { createSignal, For, JSXElement, Show } from "solid-js";

import {
  dailyGoal,
  focusedKey,
  keyCalibrationMap,
  keybrSettings,
  resetKeybrLesson,
  skipKeybrLesson,
  streaks,
  summaryMetrics,
} from "../../../../states/keybr";
import { showModal } from "../../../../states/modals";
import { cn } from "../../../../utils/cn";
import {
  calculateLearningRate,
  getConfidenceColor,
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

  const currentBestConfPercent = () => {
    const conf = currentKeyData()?.bestConfidence;
    return conf !== null && conf !== undefined ? Math.round(conf * 100) : 0;
  };

  return (
    <div class="mx-auto flex w-full max-w-4xl flex-col gap-2.5 font-mono text-xs select-none">
      {/* Row 1: Metrics + Top-Right Action Controls */}
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="w-24 text-right font-semibold text-sub/70">
            Metrics:
          </span>
          <div class="flex flex-wrap items-center gap-5 text-sub">
            {/* Speed */}
            <div class="flex items-center gap-1">
              <span class="text-sub/80">Speed:</span>
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
                    ? `↑+${Math.round(accDelta() * 100)}%`
                    : `↓${Math.round(accDelta() * 100)}%`}
                  )
                </span>
              </Show>
            </div>

            {/* Score */}
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
                  ({scoreDelta() > 0 ? `↑+${scoreDelta()}` : `↓${scoreDelta()}`}
                  )
                </span>
              </Show>
            </div>
          </div>
        </div>

        {/* Top Right Action Icons */}
        <div class="flex items-center gap-2 text-sub/70">
          <button
            type="button"
            title="Help / Tour"
            onClick={() => showModal("KeybrSettingsModal")}
            class="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-sub-alt/40 hover:text-text"
          >
            <Fa icon="fa-question-circle" />
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
            title="Settings"
            onClick={() => showModal("KeybrSettingsModal")}
            class="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-sub-alt/40 hover:text-text"
          >
            <Fa icon="fa-cog" />
          </button>
        </div>
      </div>

      {/* Row 2: All keys */}
      <div class="flex items-center gap-3">
        <span class="w-24 text-right font-semibold text-sub/70">All keys:</span>
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
                    "relative flex h-5 w-5 items-center justify-center rounded-xs text-[11px] font-bold transition-all duration-100 select-none",
                    isIncluded()
                      ? "text-bg shadow-xs"
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

      {/* Row 3: Current key */}
      <div class="flex items-center gap-3">
        <span class="w-24 text-right font-semibold text-sub/70">
          Current key:
        </span>
        <div class="flex items-center gap-3 text-sub">
          {/* Key badge */}
          <div
            class="flex h-6 w-6 items-center justify-center rounded-xs text-xs font-black text-bg shadow-sm"
            style={{
              "background-color": getConfidenceColor(
                currentKeyData()?.confidence ?? null,
              ),
            }}
          >
            <span class="uppercase">{focusedKey()}</span>
          </div>

          <div class="flex flex-wrap items-center gap-4 text-xs">
            <div>
              <span class="text-sub/80">Last speed: </span>
              <span class="font-bold text-text">
                {currentKeyData()?.speed !== null &&
                currentKeyData()?.speed !== undefined
                  ? `${currentKeyData()?.speed}wpm`
                  : "0wpm"}{" "}
                <span class="font-normal text-sub/70">
                  ({currentConfPercent()}%)
                </span>
              </span>
            </div>

            <div>
              <span class="text-sub/80">Top speed: </span>
              <span class="font-bold text-text">
                {currentKeyData()?.bestSpeed !== null &&
                currentKeyData()?.bestSpeed !== undefined
                  ? `${currentKeyData()?.bestSpeed}wpm`
                  : "0wpm"}{" "}
                <span class="font-normal text-sub/70">
                  ({currentBestConfPercent()}%)
                </span>
              </span>
            </div>

            <div class="flex items-center gap-1">
              <span class="text-sub/80">Learning rate: </span>
              <span class="text-emerald-400 font-bold">
                {currentLr().learningRate !== null
                  ? `+${currentLr().learningRate}wpm/lesson`
                  : "+0.3wpm/lesson"}
              </span>
              <span class="text-emerald-400">☺</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Accuracy Streak */}
      <div class="flex items-center gap-3">
        <span class="w-24 text-right font-semibold text-sub/70">Accuracy:</span>
        <span class="text-xs font-medium text-sub/90">
          {(() => {
            const firstStreak = streaks()[0];
            return firstStreak !== undefined && firstStreak.count > 0
              ? `${firstStreak.count} consecutive lessons with 95% accuracy.`
              : "One lesson with 95% accuracy.";
          })()}
        </span>
      </div>

      {/* Row 5: Daily Goal */}
      <div class="flex items-center gap-3">
        <span class="w-24 text-right font-semibold text-sub/70">
          Daily goal:
        </span>
        <div class="flex items-center gap-3 text-sub">
          <span class="text-xs text-sub/90">
            {dailyGoal().completedPercent}%/{keybrSettings().dailyGoalMinutes}{" "}
            minutes
          </span>
          <div class="h-2 w-64 overflow-hidden rounded-full bg-sub-alt/40">
            <div
              class="h-full rounded-full bg-sub/80 transition-all duration-300"
              style={{ width: `${dailyGoal().completedPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <Show when={hoveredKey()}>
        {(stats) => {
          const lr = () => calculateLearningRate(stats().samples);

          return (
            <div
              class="animate-in fade-in zoom-in-95 pointer-events-none fixed z-50 flex -translate-x-1/2 -translate-y-full flex-col gap-1 rounded-xl border border-sub-alt bg-bg/95 p-3 font-mono text-xs text-text shadow-xl backdrop-blur-md duration-150"
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
              </div>
            </div>
          );
        }}
      </Show>
    </div>
  );
}
