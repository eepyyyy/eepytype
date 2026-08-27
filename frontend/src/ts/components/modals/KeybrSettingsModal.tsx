import { createSignal, For, JSXElement, Show } from "solid-js";

import {
  changeKeybrCorpus,
  computeUserAverageWpm,
  KeybrFontSize,
  keybrSettings,
  KeybrTextAlign,
  KeybrTraceMode,
  KeybrWidthMode,
  resetAllKeybrProgress,
  setKeybrTargetSpeedMode,
  updateKeybrSettings,
} from "../../states/keybr";
import { AnimatedModal } from "../common/AnimatedModal";
import { Button } from "../common/Button";

export function KeybrSettingsModal(): JSXElement {
  const [showConfirmReset, setShowConfirmReset] = createSignal(false);

  const settings = () => keybrSettings();

  const handleDailyGoalChange = (minutes: number) => {
    const clamped = Math.max(5, Math.min(180, minutes));
    updateKeybrSettings({ dailyGoalMinutes: clamped });
  };

  const widthOptions: { id: KeybrWidthMode; label: string; desc: string }[] = [
    { id: "full", label: "Full (100%)", desc: "Stretched edge-to-edge" },
    { id: "wide", label: "Wide", desc: "Max 1400px" },
    { id: "normal", label: "Normal", desc: "Max 1100px" },
    { id: "compact", label: "Compact", desc: "Max 850px" },
  ];

  const fontSizeOptions: { id: KeybrFontSize; label: string }[] = [
    { id: "small", label: "Small" },
    { id: "medium", label: "Medium" },
    { id: "large", label: "Large" },
    { id: "xlarge", label: "Extra Large" },
  ];

  const textAlignOptions: { id: KeybrTextAlign; label: string }[] = [
    { id: "left", label: "Left Aligned" },
    { id: "center", label: "Center Aligned" },
  ];

  const traceOptions: { id: KeybrTraceMode; label: string; desc: string }[] = [
    { id: "all", label: "All Traces", desc: "Show every transition" },
    { id: "errors", label: "Errors Only", desc: "Highlight miss transitions" },
    { id: "focus", label: "Focus Key", desc: "Targeted key paths only" },
    { id: "off", label: "Disabled", desc: "Hide all transition arcs" },
  ];

  return (
    <AnimatedModal
      id="KeybrSettingsModal"
      title="Keybr Practice Settings"
      modalClass="max-w-2xl"
    >
      <div class="flex flex-col gap-6 font-mono text-sm text-text">
        <p class="text-xs text-sub">
          Customize screen layout, width, keyboard transition traces, and
          adaptive learning algorithms.
        </p>

        {/* Section: Layout & Appearance */}
        <div class="flex flex-col gap-4 rounded-xl border border-sub-alt/60 bg-sub-alt/20 p-4">
          <span class="text-xs font-bold tracking-wider text-main uppercase">
            Layout & Appearance
          </span>

          {/* 1. Container Width */}
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-text">Board Width</span>
              <span class="text-xs font-bold text-main uppercase">
                {settings().widthMode} ({settings().customWidthPercent ?? 100}%)
              </span>
            </div>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <For each={widthOptions}>
                {(opt) => (
                  <button
                    type="button"
                    onClick={() => updateKeybrSettings({ widthMode: opt.id })}
                    class={`flex flex-col items-center justify-center rounded-lg border p-2 text-xs transition-all ${
                      settings().widthMode === opt.id
                        ? "border-main bg-main/15 font-bold text-main shadow-xs"
                        : "border-sub-alt/40 bg-sub-alt/10 text-sub hover:border-sub hover:text-text"
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span class="text-[10px] opacity-70">{opt.desc}</span>
                  </button>
                )}
              </For>
            </div>

            {/* Custom Width Percentage Slider when on Full */}
            <div class="mt-2 flex flex-col gap-1">
              <div class="flex items-center justify-between text-xs text-sub">
                <span>Custom Width Stretch</span>
                <span>{settings().customWidthPercent ?? 100}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="2"
                value={settings().customWidthPercent ?? 100}
                onInput={(e) =>
                  updateKeybrSettings({
                    customWidthPercent: Number(e.currentTarget.value),
                  })
                }
                class="w-full accent-main"
              />
            </div>
          </div>

          {/* 2. Keyboard Transition Traces */}
          <div class="flex flex-col gap-2 border-t border-sub-alt/30 pt-3">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-text">
                Keyboard Motion Traces
              </span>
              <span class="text-xs font-bold text-main uppercase">
                {settings().traceMode ?? "all"}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <For each={traceOptions}>
                {(opt) => (
                  <button
                    type="button"
                    onClick={() => updateKeybrSettings({ traceMode: opt.id })}
                    class={`flex flex-col items-center justify-center rounded-lg border p-2 text-xs transition-all ${
                      (settings().traceMode ?? "all") === opt.id
                        ? "border-main bg-main/15 font-bold text-main shadow-xs"
                        : "border-sub-alt/40 bg-sub-alt/10 text-sub hover:border-sub hover:text-text"
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span class="text-[10px] opacity-70">{opt.desc}</span>
                  </button>
                )}
              </For>
            </div>
          </div>

          {/* 3. Font Size & Alignment */}
          <div class="grid grid-cols-1 gap-4 border-t border-sub-alt/30 pt-3 sm:grid-cols-2">
            <div class="flex flex-col gap-2">
              <span class="text-xs font-semibold text-text">Text Size</span>
              <div class="grid grid-cols-2 gap-1.5">
                <For each={fontSizeOptions}>
                  {(opt) => (
                    <button
                      type="button"
                      onClick={() => updateKeybrSettings({ fontSize: opt.id })}
                      class={`rounded-lg border px-2 py-1.5 text-xs transition-all ${
                        settings().fontSize === opt.id
                          ? "border-main bg-main/15 font-bold text-main"
                          : "border-sub-alt/40 bg-sub-alt/10 text-sub hover:border-sub hover:text-text"
                      }`}
                    >
                      {opt.label}
                    </button>
                  )}
                </For>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-xs font-semibold text-text">
                Text Alignment
              </span>
              <div class="grid grid-cols-2 gap-1.5">
                <For each={textAlignOptions}>
                  {(opt) => (
                    <button
                      type="button"
                      onClick={() => updateKeybrSettings({ textAlign: opt.id })}
                      class={`rounded-lg border px-2 py-1.5 text-xs transition-all ${
                        settings().textAlign === opt.id
                          ? "border-main bg-main/15 font-bold text-main"
                          : "border-sub-alt/40 bg-sub-alt/10 text-sub hover:border-sub hover:text-text"
                      }`}
                    >
                      {opt.label}
                    </button>
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Phonetic Calibration & Algorithm */}
        <div class="flex flex-col gap-4 rounded-xl border border-sub-alt/60 bg-sub-alt/20 p-4">
          <span class="text-xs font-bold tracking-wider text-main uppercase">
            Adaptive Learning & Vocabulary
          </span>

          {/* Vocabulary Corpus */}
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-text">Vocabulary Corpus</span>
              <span class="text-xs font-bold text-main uppercase">
                {settings().corpus}
              </span>
            </div>
            <p class="text-xs text-sub">
              Choose between Keybr phonetic pseudo-words or real English
              dictionary wordlists filtered to your unlocked letters.
            </p>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <For
                each={
                  [
                    { id: "phonetic", label: "Keybr Phonetic" },
                    { id: "english", label: "English Standard" },
                    { id: "english_1k", label: "English 1k" },
                    { id: "english_5k", label: "English 5k" },
                    { id: "english_10k", label: "English 10k" },
                    { id: "english_25k", label: "English 25k" },
                  ] as const
                }
              >
                {(c) => (
                  <button
                    type="button"
                    onClick={() => changeKeybrCorpus(c.id)}
                    class={`flex items-center justify-center rounded-lg border p-2 text-xs transition-all ${
                      settings().corpus === c.id
                        ? "border-main bg-main/15 font-bold text-main shadow-xs"
                        : "border-sub-alt/40 bg-sub-alt/10 text-sub hover:border-sub hover:text-text"
                    }`}
                  >
                    {c.label}
                  </button>
                )}
              </For>
            </div>
          </div>

          {/* Target Speed */}
          <div class="flex flex-col gap-3 border-t border-sub-alt/30 pt-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-text">Target Typing Speed</span>
              <span class="font-bold text-main">
                {settings().targetWpm} WPM
                {settings().targetSpeedMode === "auto"
                  ? " (Auto)"
                  : " (Custom)"}
              </span>
            </div>
            <p class="text-xs text-sub">
              {settings().targetSpeedMode === "auto"
                ? "Auto mode dynamically anchors the target speed to your typing speed so key colors accurately highlight your strong and weak letters."
                : "The fixed minimum speed required on all active keys to reach 100% confidence and unlock new letters."}
            </p>

            {/* Auto vs Custom Mode Switcher */}
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setKeybrTargetSpeedMode("auto")}
                class={`flex flex-col items-center justify-center rounded-lg border p-2 text-xs transition-all ${
                  settings().targetSpeedMode === "auto"
                    ? "border-main bg-main/15 font-bold text-main shadow-xs"
                    : "border-sub-alt/40 bg-sub-alt/10 text-sub hover:border-sub hover:text-text"
                }`}
              >
                <span>Auto (Match My Speed)</span>
                <span class="text-[10px] opacity-70">
                  {computeUserAverageWpm()} WPM rolling average
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setKeybrTargetSpeedMode(
                    "custom",
                    settings().customTargetWpm || 35,
                  )
                }
                class={`flex flex-col items-center justify-center rounded-lg border p-2 text-xs transition-all ${
                  settings().targetSpeedMode === "custom"
                    ? "border-main bg-main/15 font-bold text-main shadow-xs"
                    : "border-sub-alt/40 bg-sub-alt/10 text-sub hover:border-sub hover:text-text"
                }`}
              >
                <span>Custom Target</span>
                <span class="text-[10px] opacity-70">
                  Fixed target threshold
                </span>
              </button>
            </div>

            {/* Custom Speed Slider and Presets when in Custom Mode */}
            <Show when={settings().targetSpeedMode === "custom"}>
              <div class="flex flex-col gap-2 rounded-lg border border-sub-alt/30 bg-sub-alt/10 p-3">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-semibold text-text">Select Target WPM</span>
                  <span class="font-bold text-main">
                    {settings().customTargetWpm || settings().targetWpm} WPM
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="140"
                  step="5"
                  value={settings().customTargetWpm || settings().targetWpm}
                  onInput={(e) =>
                    setKeybrTargetSpeedMode(
                      "custom",
                      Number(e.currentTarget.value),
                    )
                  }
                  class="w-full accent-main"
                />
                <div class="flex flex-wrap gap-1.5 pt-1">
                  <For each={[25, 35, 50, 70, 90, 100, 120]}>
                    {(spd) => (
                      <button
                        type="button"
                        onClick={() => setKeybrTargetSpeedMode("custom", spd)}
                        class={`rounded px-2 py-0.5 text-[11px] transition-all ${
                          (settings().customTargetWpm ||
                            settings().targetWpm) === spd
                            ? "bg-main font-bold text-bg shadow-xs"
                            : "bg-sub-alt/30 text-sub hover:bg-sub-alt/60 hover:text-text"
                        }`}
                      >
                        {spd}
                      </button>
                    )}
                  </For>
                </div>
              </div>
            </Show>
          </div>

          {/* Auto-Unlock & Progression */}
          <div class="flex items-center justify-between border-t border-sub-alt/30 pt-2">
            <div class="flex flex-col gap-1 pr-4">
              <span class="font-bold text-text">
                Automatic Letter Unlocking
              </span>
              <span class="text-xs text-sub">
                Automatically introduce the next letter when all current keys
                reach 100% confidence with $\ge 92\%$ accuracy.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings().autoUnlock}
              onChange={(e) =>
                updateKeybrSettings({ autoUnlock: e.currentTarget.checked })
              }
              class="h-5 w-5 cursor-pointer rounded-md accent-main"
            />
          </div>

          {/* Capital Letters & Punctuation */}
          <div class="grid grid-cols-1 gap-3 border-t border-sub-alt/30 pt-2 sm:grid-cols-2">
            <div class="flex items-center justify-between rounded-lg border border-sub-alt/40 bg-sub-alt/10 p-3">
              <div class="flex flex-col">
                <span class="font-bold text-text">Capital Letters</span>
                <span class="text-xs text-sub">Include uppercase words</span>
              </div>
              <input
                type="checkbox"
                checked={settings().withCapitals}
                onChange={(e) =>
                  updateKeybrSettings({ withCapitals: e.currentTarget.checked })
                }
                class="h-5 w-5 cursor-pointer rounded-md accent-main"
              />
            </div>

            <div class="flex items-center justify-between rounded-lg border border-sub-alt/40 bg-sub-alt/10 p-3">
              <div class="flex flex-col">
                <span class="font-bold text-text">Punctuation</span>
                <span class="text-xs text-sub">Include marks (.,!?-)</span>
              </div>
              <input
                type="checkbox"
                checked={settings().withPunctuation}
                onChange={(e) =>
                  updateKeybrSettings({
                    withPunctuation: e.currentTarget.checked,
                  })
                }
                class="h-5 w-5 cursor-pointer rounded-md accent-main"
              />
            </div>
          </div>

          {/* Daily Practice Goal */}
          <div class="flex flex-col gap-2 border-t border-sub-alt/30 pt-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-text">Daily Practice Goal</span>
              <span class="font-bold text-main">
                {settings().dailyGoalMinutes} Minutes
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={settings().dailyGoalMinutes}
              onInput={(e) =>
                handleDailyGoalChange(Number(e.currentTarget.value))
              }
              class="w-full accent-main"
            />
          </div>
        </div>

        {/* Reset All Progress */}
        <div class="border-rose-500/30 bg-rose-500/10 flex flex-col gap-3 rounded-xl border p-4">
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-rose-400 font-bold">
                Reset Calibration Data
              </span>
              <span class="text-xs text-sub">
                Wipe all character calibration, transitions, and return to
                initial keys.
              </span>
            </div>

            <Button
              variant="button"
              class="border-rose-500/50 bg-rose-500/20 text-rose-400 hover:bg-rose-500/40"
              text={showConfirmReset() ? "Confirm Reset?" : "Reset"}
              fa={{ icon: "fa-trash-alt" }}
              onClick={() => {
                if (showConfirmReset()) {
                  resetAllKeybrProgress();
                  setShowConfirmReset(false);
                } else {
                  setShowConfirmReset(true);
                }
              }}
            />
          </div>
        </div>
      </div>
    </AnimatedModal>
  );
}
