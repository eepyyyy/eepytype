import {
  createEffect,
  For,
  JSXElement,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

import {
  activeKineticDrill,
  drillCharStatuses,
  drillCursorIndex,
  drillWordIndex,
  ghostPacerProgress,
  handleKineticInput,
  handleKineticKeyUp,
  isKineticActive,
  isKineticPaused,
  kineticSettings,
  pauseKineticDrill,
} from "../../../../states/kinetic";
import { cn } from "../../../../utils/cn";
import { Fa } from "../../../common/Fa";
import { KineticDiagnostics } from "./KineticDiagnostics";
import { KineticKeyboard } from "./KineticKeyboard";
import { KineticSidebarStats } from "./KineticSidebarStats";

export function KineticContainer(): JSXElement {
  createEffect(() => {
    const active = isKineticActive();
    const typingTest = document.getElementById("typingTest");
    const wordsWrapper = document.getElementById("wordsWrapper");
    const testConfig = document.querySelector(".testConfig");
    const restartBtn = document.getElementById("restartTestButton");
    const keymapMount = document.querySelector(
      'mount[data-component="keymap"]',
    );
    const keymap = document.getElementById("keymap");
    const liveStatsTop = document.getElementById("liveStatsTextTop");
    const liveStatsMini = document.getElementById("liveStatsMini");

    if (active) {
      typingTest?.classList.add("kinetic-mode-active");
      wordsWrapper?.classList.add("hidden");
      testConfig?.classList.add("opacity-20", "pointer-events-none");
      restartBtn?.classList.add("hidden");
      keymapMount?.classList.add("hidden");
      keymap?.classList.add("hidden");
      liveStatsTop?.classList.add("hidden");
      liveStatsMini?.classList.add("hidden");
    } else {
      typingTest?.classList.remove("kinetic-mode-active");
      wordsWrapper?.classList.remove("hidden");
      testConfig?.classList.remove("opacity-20", "pointer-events-none");
      restartBtn?.classList.remove("hidden");
      keymapMount?.classList.remove("hidden");
      keymap?.classList.remove("hidden");
      liveStatsTop?.classList.remove("hidden");
      liveStatsMini?.classList.remove("hidden");
    }
  });

  onMount(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isKineticActive()) return;
      e.stopPropagation();
      handleKineticInput(e);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (!isKineticActive()) return;
      e.stopPropagation();
      handleKineticKeyUp(e);
    };

    const onBlur = () => {
      if (isKineticActive()) {
        pauseKineticDrill();
      }
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    window.addEventListener("keyup", onKeyUp, { capture: true });
    window.addEventListener("blur", onBlur);

    onCleanup(() => {
      window.removeEventListener("keydown", onKeyDown, { capture: true });
      window.removeEventListener("keyup", onKeyUp, { capture: true });
      window.removeEventListener("blur", onBlur);
    });
  });

  const words = () => activeKineticDrill().map((d) => d.word);

  return (
    <Show when={isKineticActive()}>
      <div class="animate-in fade-in relative z-20 mx-auto flex w-full max-w-7xl flex-col gap-6 py-4 font-mono transition-all duration-200 select-none lg:flex-row lg:items-start lg:gap-8">
        {/* Left Column: Diagnostics, Lookahead Text Board, Metronome & Visual Keyboard */}
        <div class="flex flex-1 flex-col items-center gap-6">
          {/* Top Diagnostics Toolbar */}
          <KineticDiagnostics />

          {/* Center Text Board with Lookahead Lighting & Ghost Pacer */}
          <div class="relative flex w-full flex-wrap items-center justify-start gap-x-2 gap-y-3 rounded-2xl border border-sub-alt/40 bg-[#1e2023]/90 p-7 text-2xl font-semibold tracking-wide shadow-2xl backdrop-blur-md">
            {/* AFK / Window Blur Pause Overlay */}
            <Show when={isKineticPaused()}>
              <div class="animate-in fade-in bg-black/50 absolute inset-0 z-30 flex items-center justify-center rounded-2xl backdrop-blur-xs transition-all duration-200">
                <div class="border-amber-400/40 flex items-center gap-2.5 rounded-xl border bg-[#1e2023]/95 px-5 py-2.5 text-sm font-bold text-text shadow-2xl">
                  <Fa icon="fa-pause" class="text-amber-400 text-xs" />
                  <span>Paused — Press any key to resume</span>
                </div>
              </div>
            </Show>

            {/* Optional Cadence Metronome Pulse Bar */}
            <Show when={kineticSettings().metronome}>
              <div class="absolute top-0 right-0 left-0 h-1 overflow-hidden rounded-t-2xl bg-main/20">
                <div
                  class="h-full w-full animate-ping bg-main opacity-60"
                  style={{
                    "animation-duration": `${Math.round(60000 / (kineticSettings().targetWpm * 5))}ms`,
                  }}
                ></div>
              </div>
            </Show>

            {/* Word-level Lookahead Lighting Container */}
            {(() => {
              const cur = drillCursorIndex();
              const curWIdx = drillWordIndex();
              const pacerPos = ghostPacerProgress();
              const lookahead = kineticSettings().lookaheadLighting;
              const statuses = () => drillCharStatuses();

              let charCounter = 0;

              return (
                <For each={words()}>
                  {(word, wIdx) => {
                    const isCurrentWord = () => wIdx() === curWIdx;
                    const isPastWord = () => wIdx() < curWIdx;
                    // Upcoming 2-3 words get soft lookahead lighting
                    const isLookaheadChunk = () =>
                      lookahead && wIdx() > curWIdx && wIdx() <= curWIdx + 3;

                    const wordChars = word.split("");
                    const startCharIdx = charCounter;
                    charCounter += word.length + 1; // +1 for space

                    return (
                      <span
                        class={cn(
                          "relative rounded-md px-1 py-0.5 transition-all duration-150",
                          isCurrentWord() && "bg-sub-alt/40 shadow-xs",
                          isLookaheadChunk() &&
                            "text-sky-300 font-bold drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]",
                        )}
                      >
                        <For each={wordChars}>
                          {(ch, cIdx) => {
                            const absIdx = () => startCharIdx + cIdx();
                            const isCurrentChar = () => absIdx() === cur;
                            const charStatus = () =>
                              statuses()[absIdx()] ?? "pending";
                            const isPacerHere = () =>
                              kineticSettings().ghostPacer &&
                              Math.floor(pacerPos) === absIdx();

                            const charColorClass = () => {
                              const s = charStatus();
                              if (isCurrentChar()) {
                                if (s === "error") {
                                  return "bg-rose-500/30 text-rose-400 ring-1 ring-rose-500 rounded px-0.5 font-bold animate-pulse";
                                }
                                return "font-bold text-main";
                              }
                              if (s === "corrected_error" || s === "error") {
                                return "text-rose-500 font-black drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]";
                              }
                              if (s === "correct") {
                                return isPastWord()
                                  ? "text-text/70"
                                  : "text-text";
                              }
                              return "text-sub/50";
                            };

                            return (
                              <span
                                class={cn(
                                  "relative transition-colors duration-75",
                                  charColorClass(),
                                )}
                              >
                                {/* Cursor pulse underline */}
                                <Show when={isCurrentChar()}>
                                  <span class="absolute right-0 -bottom-1 left-0 h-0.5 animate-pulse rounded-full bg-main"></span>
                                </Show>

                                {/* Ghost Pacer Shadow */}
                                <Show when={isPacerHere()}>
                                  <span class="bg-sky-400/50 ring-sky-400/40 pointer-events-none absolute right-0 -bottom-1 left-0 h-0.5 rounded-full ring-2"></span>
                                </Show>

                                {ch}
                              </span>
                            );
                          }}
                        </For>
                      </span>
                    );
                  }}
                </For>
              );
            })()}
          </div>

          {/* Unified Visual Keyboard with SVG Traces & Split-Circle Heatmaps */}
          <KineticKeyboard />
        </div>

        {/* Right Column: Predictive Speed Projection & Live Telemetry Sidebar */}
        <KineticSidebarStats />

        <style>{`
          .kinetic-mode-active #keymap,
          .kinetic-mode-active mount[data-component="keymap"],
          .kinetic-mode-active #wordsWrapper,
          .kinetic-mode-active #caret,
          .kinetic-mode-active #paceCaret,
          .kinetic-mode-active #liveStatsTextTop,
          .kinetic-mode-active #liveStatsMini,
          .kinetic-mode-active #restartTestButton,
          .kinetic-mode-active #testModesNotice {
            display: none !important;
          }
        `}</style>
      </div>
    </Show>
  );
}
