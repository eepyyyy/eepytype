import { For, JSXElement, Show } from "solid-js";

import {
  getMistakeRemediationLetters,
  keyConfidences,
  kineticDiagnostics,
  kineticRecentTransitions,
  kineticSettings,
  launchMicroDrill,
  recentMistakesList,
  sessionCurrentTestIndex,
  setRepeatedMistakes,
  startNewSession,
  streakCount,
  updateKineticSettings,
} from "../../../../states/kinetic";
import { cn } from "../../../../utils/cn";
import { Fa } from "../../../common/Fa";

export function KineticSidebarStats(): JSXElement {
  const diag = () => kineticDiagnostics();
  const settings = () => kineticSettings();
  const recentMistakes = () => recentMistakesList();
  const remediationLetters = () => getMistakeRemediationLetters();
  const confidences = () => keyConfidences();
  const transitions = () => kineticRecentTransitions();

  const targetWpm = () => settings().targetWpm;
  const targetIki = () => Math.round(12000 / Math.max(20, targetWpm()));

  const sortedKeyConfidences = () => {
    return Object.values(confidences())
      .filter((k) => k.char.length === 1 && k.char !== " " && k.char !== "")
      .sort((a, b) => a.confidence - b.confidence);
  };

  const weakestKeys = () => sortedKeyConfidences().slice(0, 6);

  const lastBigram = () => {
    const list = transitions();
    if (list.length === 0) return null;
    return list[list.length - 1] ?? null;
  };

  const sessionTarget = () => settings().sessionLength;
  const currentTest = () => sessionCurrentTestIndex();

  const targetWpmPresets = [35, 45, 60, 80];

  return (
    <div class="flex w-full flex-col gap-3 font-mono text-xs select-none lg:w-80">
      {/* 1. Session Progress & Set Controller Card */}
      <div class="flex flex-col gap-2.5 rounded-xl border border-main/40 bg-main/10 p-3.5 shadow-lg backdrop-blur-md">
        <div class="flex items-center justify-between">
          <span class="flex items-center gap-1.5 font-bold text-main uppercase">
            <Fa icon="fa-layer-group" />
            Training Session
          </span>
          <span class="rounded bg-main/20 px-2 py-0.5 text-[10px] font-extrabold text-main">
            {sessionTarget() > 0
              ? `TEST ${currentTest()} OF ${sessionTarget()}`
              : "CONTINUOUS FLOW"}
          </span>
        </div>

        {/* Set Target Selector */}
        <div class="grid grid-cols-3 gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => startNewSession(5)}
            class={cn(
              "rounded-md border py-1 text-center text-[10px] font-bold transition-all",
              sessionTarget() === 5
                ? "border-main bg-main text-bg shadow-xs"
                : "border-sub-alt/40 bg-sub-alt/20 text-sub hover:text-text",
            )}
          >
            5 Tests
          </button>

          <button
            type="button"
            onClick={() => startNewSession(10)}
            class={cn(
              "rounded-md border py-1 text-center text-[10px] font-bold transition-all",
              sessionTarget() === 10
                ? "border-main bg-main text-bg shadow-xs"
                : "border-sub-alt/40 bg-sub-alt/20 text-sub hover:text-text",
            )}
          >
            10 Tests
          </button>

          <button
            type="button"
            onClick={() => startNewSession(0)}
            class={cn(
              "rounded-md border py-1 text-center text-[10px] font-bold transition-all",
              sessionTarget() === 0
                ? "border-main bg-main text-bg shadow-xs"
                : "border-sub-alt/40 bg-sub-alt/20 text-sub hover:text-text",
            )}
          >
            Infinite
          </button>
        </div>

        {/* Streak & Accuracy Stats */}
        <div class="mt-1 flex items-center justify-between rounded-lg bg-[#1e2023]/80 px-2.5 py-1.5 text-[11px]">
          <div class="flex items-center gap-1">
            <span class="text-sub">Streak:</span>
            <span class="text-sky-400 font-bold">{streakCount()} hits</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="text-sub">Accuracy:</span>
            <span class="text-emerald-400 font-bold">
              {Math.round(diag().rollingAccuracy * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. Keybr Rolling Confidence (0.0 to 1.0) & Bigram Interval Radar */}
      <div class="flex flex-col gap-2.5 rounded-xl border border-sub-alt/40 bg-[#1e2023]/90 p-3.5 shadow-lg">
        <div class="flex items-center justify-between">
          <span class="flex items-center gap-1.5 text-xs font-bold text-text uppercase">
            <Fa icon="fa-chart-line" />
            Keybr Confidence Radar
          </span>

          <div class="flex items-center gap-1">
            <span class="text-[9px] text-sub">Target:</span>
            <div class="flex gap-1">
              <For each={targetWpmPresets}>
                {(wpm) => (
                  <button
                    type="button"
                    onClick={() => updateKineticSettings({ targetWpm: wpm })}
                    class={cn(
                      "rounded px-1.5 py-0.5 text-[9px] font-bold transition-all",
                      targetWpm() === wpm
                        ? "bg-main font-black text-bg"
                        : "bg-sub-alt/20 text-sub hover:text-text",
                    )}
                  >
                    {wpm}w
                  </button>
                )}
              </For>
            </div>
          </div>
        </div>

        {/* Live Bigram Latency Tracker */}
        <Show when={lastBigram() !== null}>
          <div class="flex items-center justify-between rounded-lg border border-sub-alt/30 bg-sub-alt/20 px-2.5 py-1.5 text-[11px]">
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] text-sub uppercase">Last Bigram:</span>
              <span class="font-mono font-bold text-text">
                {lastBigram()?.from.toUpperCase()} →{" "}
                {lastBigram()?.to.toUpperCase()}
              </span>
            </div>

            <div class="flex items-center gap-1.5 font-mono font-bold">
              <span>{diag().lastIkiMs} ms</span>
              <span
                class={cn(
                  "rounded px-1 text-[9px]",
                  lastBigram()?.correct === false
                    ? "bg-rose-500/20 text-rose-400"
                    : diag().lastIkiMs > targetIki() * 1.3
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-emerald-500/20 text-emerald-400",
                )}
              >
                {lastBigram()?.correct === false
                  ? "ERROR"
                  : diag().lastIkiMs > targetIki() * 1.3
                    ? "HESITATION"
                    : "FLUID"}
              </span>
            </div>
          </div>
        </Show>

        {/* Keybr Confidence Meter List */}
        <Show
          when={weakestKeys().length > 0}
          fallback={
            <div class="flex items-center justify-center py-3 text-center text-[11px] text-sub">
              Start typing to calibrate per-key bigram intervals and confidence
              scores.
            </div>
          }
        >
          <div class="flex flex-col gap-2 pt-1">
            <span class="text-[10px] font-semibold tracking-wider text-sub uppercase">
              Target Key Mastery (Goal: ≥ 0.95)
            </span>

            <div class="flex flex-col gap-1.5">
              <For each={weakestKeys()}>
                {(keyData) => {
                  const conf = keyData.confidence;
                  const pct = Math.min(100, Math.round(conf * 100));
                  const isMastered = conf >= 0.95;
                  const isWeak = conf < 0.65;

                  return (
                    <div
                      class="flex cursor-pointer items-center justify-between rounded-lg border border-sub-alt/30 bg-sub-alt/10 px-2 py-1.5 transition-colors hover:bg-sub-alt/30"
                      onClick={() => void launchMicroDrill(keyData.char)}
                      title={`1-Click drill on '${keyData.char.toUpperCase()}' (Speed: ${keyData.speedWpm} WPM, Errors: ${Math.round(keyData.filteredErrorRate * 100)}%)`}
                    >
                      <div class="flex items-center gap-2">
                        <span
                          class={cn(
                            "flex h-5 w-5 items-center justify-center rounded font-mono text-xs font-black",
                            isMastered
                              ? "bg-emerald-500/20 text-emerald-400"
                              : isWeak
                                ? "bg-rose-500/20 text-rose-400"
                                : "bg-amber-500/20 text-amber-400",
                          )}
                        >
                          {keyData.char.toUpperCase()}
                        </span>
                        <div class="flex flex-col">
                          <span class="text-[10px] font-bold text-text">
                            {keyData.filteredTimeToType} ms ({keyData.speedWpm}{" "}
                            WPM)
                          </span>
                          <span class="text-[8px] text-sub">
                            {keyData.totalMisses > 0
                              ? `${keyData.totalMisses} misses (${Math.round(keyData.filteredErrorRate * 100)}% err)`
                              : "0 errors"}
                          </span>
                        </div>
                      </div>

                      <div class="flex items-center gap-2">
                        {/* Mini Progress Bar */}
                        <div class="h-2 w-16 overflow-hidden rounded-full bg-sub-alt/50">
                          <div
                            class={cn(
                              "h-full rounded-full transition-all duration-300",
                              isMastered
                                ? "bg-emerald-400"
                                : isWeak
                                  ? "bg-rose-500"
                                  : "bg-amber-400",
                            )}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>

                        <span
                          class={cn(
                            "w-8 text-right font-mono text-[10px] font-black",
                            isMastered
                              ? "text-emerald-400"
                              : isWeak
                                ? "text-rose-400"
                                : "text-amber-400",
                          )}
                        >
                          {conf.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>
          </div>
        </Show>
      </div>

      {/* 3. Next Training Target Auto-Injection */}
      <div class="border-sky-500/30 bg-sky-500/10 flex flex-col gap-2 rounded-xl border p-3.5 shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-sky-300 flex items-center gap-1.5 text-xs font-bold uppercase">
            <Fa icon="fa-bullseye" />
            Next Training Focus
          </span>
          <span class="bg-sky-500/20 text-sky-400 rounded px-1.5 py-0.5 text-[9px] font-bold">
            AUTO-INJECT
          </span>
        </div>

        <Show
          when={remediationLetters().length > 0}
          fallback={
            <span class="text-[11px] text-sub">
              Next test will pull balanced vocabulary from{" "}
              {settings().corpus.toUpperCase()}.
            </span>
          }
        >
          <div class="flex flex-col gap-1.5 pt-1">
            <span class="text-sky-200 text-[11px]">
              Targeting words with bigrams ending in:
            </span>
            <div class="flex flex-wrap gap-1">
              <For each={remediationLetters()}>
                {(letter) => (
                  <span class="border-sky-400/40 bg-sky-400/20 text-sky-200 rounded border px-2 py-0.5 text-xs font-black">
                    *{letter.toUpperCase()}
                  </span>
                )}
              </For>
            </div>
          </div>
        </Show>
      </div>

      {/* 4. Live Miss Log Stream */}
      <Show when={recentMistakes().length > 0}>
        <div class="flex flex-col gap-2 rounded-xl border border-sub-alt/40 bg-[#1e2023]/90 p-3.5 shadow-lg">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-text uppercase">
              Recent Error Stream
            </span>
            <button
              type="button"
              onClick={() => setRepeatedMistakes({})}
              class="hover:text-rose-400 text-[9px] text-sub transition-colors"
            >
              Clear Log
            </button>
          </div>

          <div class="flex max-h-28 flex-col gap-1 overflow-y-auto">
            <For each={[...recentMistakes()].reverse().slice(0, 4)}>
              {(item) => (
                <div class="flex items-center justify-between rounded bg-sub-alt/20 px-2 py-1 text-[10px]">
                  <span class="font-mono text-sub">[{item.word}]</span>
                  <div class="flex items-center gap-1">
                    <span class="text-emerald-400 font-bold">
                      {`'${item.expected}'`}
                    </span>
                    <span class="text-sub">→</span>
                    <span class="text-rose-400 font-bold">
                      {`'${item.typed}'`}
                    </span>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}
