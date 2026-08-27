import {
  createEffect,
  For,
  JSXElement,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

import {
  activeDrillText,
  currentWordHasError,
  drillCursorIndex,
  handleKineticInput,
  isKineticActive,
} from "../../../../states/kinetic";
import { cn } from "../../../../utils/cn";
import { KineticDiagnostics } from "./KineticDiagnostics";

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

    window.addEventListener("keydown", onKeyDown, { capture: true });

    onCleanup(() => {
      window.removeEventListener("keydown", onKeyDown, { capture: true });
    });
  });

  const chars = () => activeDrillText().split("");

  return (
    <Show when={isKineticActive()}>
      <div class="animate-in fade-in relative z-20 mx-auto flex w-full max-w-5xl flex-col items-center gap-6 py-6 font-mono transition-all duration-200 select-none">
        {/* Top Diagnostics: Dual-Latency, Queue Plan, Bottlenecks */}
        <KineticDiagnostics />

        {/* Center Text Board */}
        <div class="relative flex w-full flex-wrap items-center justify-start gap-x-2 gap-y-3 rounded-2xl border border-sub-alt/40 bg-[#1e2023]/90 p-8 text-2xl font-semibold tracking-wide shadow-2xl backdrop-blur-md">
          {(() => {
            const cur = drillCursorIndex();
            const hasErr = currentWordHasError();

            return (
              <For each={chars()}>
                {(char, idx) => {
                  const isPast = () => idx() < cur;
                  const isCurrent = () => idx() === cur;
                  const isSpace = () => char === " ";

                  return (
                    <span
                      class={cn(
                        "relative transition-colors duration-75",
                        isPast() && "text-text",
                        !isPast() && !isCurrent() && "text-sub/40",
                        isCurrent() &&
                          hasErr &&
                          "bg-rose-500/30 text-rose-400 rounded px-0.5",
                        isCurrent() && !hasErr && "font-bold text-main",
                        isSpace() && "mx-1 text-sub/30",
                      )}
                    >
                      <Show when={isCurrent()}>
                        <span class="absolute right-0 -bottom-1 left-0 h-0.5 animate-pulse rounded-full bg-main"></span>
                      </Show>
                      {char}
                    </span>
                  );
                }}
              </For>
            );
          })()}
        </div>

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
