import { For, JSXElement, Show } from "solid-js";

import {
  getMistakeRemediationLetters,
  kineticDiagnostics,
  kineticSettings,
  launchMicroDrill,
  recentMistakesList,
  repeatedMistakes,
  sessionCurrentTestIndex,
  setRepeatedMistakes,
  startNewSession,
  streakCount,
} from "../../../../states/kinetic";
import { cn } from "../../../../utils/cn";
import { Fa } from "../../../common/Fa";

export function KineticSidebarStats(): JSXElement {
  const diag = () => kineticDiagnostics();
  const settings = () => kineticSettings();
  const mistakes = () => repeatedMistakes();
  const recentMistakes = () => recentMistakesList();
  const remediationLetters = () => getMistakeRemediationLetters();

  const motorWpm = () =>
    diag().meanIkiMs > 0 ? Math.round(12000 / diag().meanIkiMs) : 60;

  const sortedMistakes = () => {
    return Object.entries(mistakes())
      .filter(([char, count]) => char.length === 1 && count > 0 && char !== " ")
      .sort((a, b) => b[1] - a[1]);
  };

  const sessionTarget = () => settings().sessionLength;
  const currentTest = () => sessionCurrentTestIndex();

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

      {/* 2. Repeated Mistakes Radar */}
      <div class="flex flex-col gap-2.5 rounded-xl border border-sub-alt/40 bg-[#1e2023]/90 p-3.5 shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-rose-400 flex items-center gap-1.5 text-xs font-bold uppercase">
            <Fa icon="fa-exclamation-triangle" />
            Repeated Mistakes
          </span>
          <Show when={sortedMistakes().length > 0}>
            <button
              type="button"
              onClick={() => setRepeatedMistakes({})}
              class="hover:text-rose-400 text-[9px] text-sub transition-colors"
            >
              Reset Mistakes
            </button>
          </Show>
        </div>

        <Show
          when={sortedMistakes().length > 0}
          fallback={
            <div class="flex items-center justify-center py-4 text-center text-[11px] text-sub">
              No mistakes recorded yet! Keys typed with errors will appear here.
            </div>
          }
        >
          <div class="flex flex-wrap gap-1.5">
            <For each={sortedMistakes()}>
              {([char, count]) => {
                const isHigh = count >= 4;
                return (
                  <button
                    type="button"
                    title={`Click for 1-click drill on '${char.toUpperCase()}' (${count} misses)`}
                    onClick={() => void launchMicroDrill(char)}
                    class={cn(
                      "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition-all active:scale-95",
                      isHigh
                        ? "border-rose-500/60 bg-rose-500/30 text-rose-300 ring-rose-500/40 shadow-xs ring-1"
                        : "border-rose-500/30 bg-rose-500/15 text-rose-400 hover:bg-rose-500/30",
                    )}
                  >
                    <span class="text-sm font-black">{char.toUpperCase()}</span>
                    <span class="bg-black/40 py-0.2 rounded px-1 text-[9px] opacity-80">
                      {count}x
                    </span>
                  </button>
                );
              }}
            </For>
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
              Next test words will heavily focus on your mistake letters:
            </span>
            <div class="flex flex-wrap gap-1">
              <For each={remediationLetters()}>
                {(letter) => (
                  <span class="border-sky-400/40 bg-sky-400/20 text-sky-200 rounded border px-2 py-0.5 text-xs font-black">
                    {letter.toUpperCase()}
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
          <span class="text-xs font-bold text-text uppercase">
            Recent Error Stream
          </span>

          <div class="flex max-h-32 flex-col gap-1 overflow-y-auto">
            <For each={[...recentMistakes()].reverse().slice(0, 5)}>
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

      {/* 5. Dual-Latency Gauges (Cognitive vs Motor) */}
      <div class="flex flex-col gap-2.5 rounded-xl border border-sub-alt/40 bg-[#1e2023]/90 p-3.5 shadow-lg">
        <span class="text-xs font-bold text-text uppercase">
          Latency Decomposition
        </span>

        <div class="grid grid-cols-2 gap-2">
          {/* Cognitive */}
          <div class="flex flex-col gap-0.5 rounded-lg border border-sub-alt/40 bg-sub-alt/20 p-2">
            <span class="text-[9px] text-sub uppercase">Cognitive (IKL)</span>
            <span class="text-sm font-black text-text">
              {diag().meanIklMs}{" "}
              <span class="text-[9px] font-normal text-sub">ms</span>
            </span>
          </div>

          {/* Motor */}
          <div class="flex flex-col gap-0.5 rounded-lg border border-sub-alt/40 bg-sub-alt/20 p-2">
            <span class="text-[9px] text-sub uppercase">
              Motor ({motorWpm()}w)
            </span>
            <span class="text-emerald-400 text-sm font-black">
              {diag().meanIkiMs}{" "}
              <span class="text-[9px] font-normal text-sub">ms</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
