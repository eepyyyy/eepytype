import { createEffect, JSXElement, onCleanup, onMount, Show } from "solid-js";

import {
  depressedKeys,
  handleKeybrInput,
  isKeybrActive,
  keybrSettings,
  setDepressedKeys,
} from "../../../../states/keybr";
import { cn } from "../../../../utils/cn";
import { KeybrIndicators } from "./KeybrIndicators";
import { KeybrKeyboard } from "./KeybrKeyboard";
import { KeybrTextBoard } from "./KeybrTextBoard";

export function KeybrContainer(): JSXElement {
  const showKeyboard = () => keybrSettings().viewMode === "normal";

  // Hide standard Monkeytype elements and attach global typing listener when Keybr is active
  createEffect(() => {
    const active = isKeybrActive();
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
      typingTest?.classList.add("keybr-mode-active");
      wordsWrapper?.classList.add("hidden");
      testConfig?.classList.add("opacity-20", "pointer-events-none");
      restartBtn?.classList.add("hidden");
      keymapMount?.classList.add("hidden");
      keymap?.classList.add("hidden");
      liveStatsTop?.classList.add("hidden");
      liveStatsMini?.classList.add("hidden");
    } else {
      typingTest?.classList.remove("keybr-mode-active");
      wordsWrapper?.classList.remove("hidden");
      testConfig?.classList.remove("opacity-20", "pointer-events-none");
      restartBtn?.classList.remove("hidden");
      keymapMount?.classList.remove("hidden");
      keymap?.classList.remove("hidden");
      liveStatsTop?.classList.remove("hidden");
      liveStatsMini?.classList.remove("hidden");
    }
  });

  // Global keydown & keyup listeners for Keybr typing
  onMount(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isKeybrActive()) return;
      e.stopPropagation();

      // Track depressed key for keyboard illumination
      const k = e.key.toLowerCase();
      const code = e.code;
      const current = depressedKeys();
      if (!current.includes(k) && !current.includes(code)) {
        setDepressedKeys([...current, k, code]);
      }

      handleKeybrInput(e);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (!isKeybrActive()) return;
      e.stopPropagation();
      const k = e.key.toLowerCase();
      const code = e.code;
      setDepressedKeys(depressedKeys().filter((x) => x !== k && x !== code));
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    window.addEventListener("keyup", onKeyUp, { capture: true });

    onCleanup(() => {
      window.removeEventListener("keydown", onKeyDown, { capture: true });
      window.removeEventListener("keyup", onKeyUp, { capture: true });
    });
  });

  const widthClass = () => {
    const mode = keybrSettings().widthMode ?? "full";
    switch (mode) {
      case "full":
        return "w-full max-w-none px-2 sm:px-6";
      case "wide":
        return "w-full max-w-7xl px-2 sm:px-4";
      case "normal":
        return "w-full max-w-5xl px-2 sm:px-4";
      case "compact":
        return "w-full max-w-3xl px-2 sm:px-4";
      default:
        return "w-full max-w-none px-2 sm:px-6";
    }
  };

  return (
    <Show when={isKeybrActive()}>
      <div
        class={cn(
          "animate-in fade-in relative z-20 mx-auto flex flex-col items-center gap-6 py-6 transition-all duration-200 select-none",
          widthClass(),
        )}
        style={{
          "max-width":
            keybrSettings().widthMode === "full"
              ? `${keybrSettings().customWidthPercent ?? 100}%`
              : undefined,
        }}
      >
        {/* Top Indicators: Metrics, All keys, Current key, Accuracy, Daily goal, Top-right controls */}
        <KeybrIndicators />

        {/* Center Text Board: dots between words, intact word wrapping, underline cursor, stop-on-error */}
        <KeybrTextBoard />

        {/* Bottom Virtual Keyboard: Authentic ANSI finger zones, transition arcs, and live keystroke feedback */}
        <Show when={showKeyboard()}>
          <KeybrKeyboard />
        </Show>

        <style>{`
          .keybr-mode-active #keymap,
          .keybr-mode-active mount[data-component="keymap"],
          .keybr-mode-active #wordsWrapper,
          .keybr-mode-active #caret,
          .keybr-mode-active #paceCaret,
          .keybr-mode-active #liveStatsTextTop,
          .keybr-mode-active #liveStatsMini,
          .keybr-mode-active #restartTestButton,
          .keybr-mode-active #testModesNotice {
            display: none !important;
          }
        `}</style>
      </div>
    </Show>
  );
}
