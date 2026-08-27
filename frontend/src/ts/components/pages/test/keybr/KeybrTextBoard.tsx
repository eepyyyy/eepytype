import { createMemo, For, JSXElement, Show } from "solid-js";

import {
  activeLessonText,
  cursorIndex,
  hasError,
  keybrSettings,
} from "../../../../states/keybr";
import { cn } from "../../../../utils/cn";

type KeybrWordDef = {
  letters: { char: string; globalIndex: number }[];
  hasSeparator: boolean;
  separatorIndex: number;
};

export function KeybrTextBoard(): JSXElement {
  const wordsList = createMemo(() => {
    const text = activeLessonText();
    const result: KeybrWordDef[] = [];
    if (!text) return result;

    let currentLetters: { char: string; globalIndex: number }[] = [];
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === "·" || ch === " ") {
        result.push({
          letters: currentLetters,
          hasSeparator: true,
          separatorIndex: i,
        });
        currentLetters = [];
      } else if (ch !== undefined) {
        currentLetters.push({ char: ch, globalIndex: i });
      }
    }
    if (currentLetters.length > 0) {
      result.push({
        letters: currentLetters,
        hasSeparator: false,
        separatorIndex: -1,
      });
    }
    return result;
  });

  const fontSizeClass = () => {
    const size = keybrSettings().fontSize ?? "large";
    switch (size) {
      case "small":
        return "text-lg sm:text-xl leading-relaxed";
      case "medium":
        return "text-xl sm:text-2xl leading-relaxed";
      case "large":
        return "text-2xl sm:text-3xl lg:text-4xl leading-loose";
      case "xlarge":
        return "text-3xl sm:text-4xl lg:text-5xl leading-loose";
      default:
        return "text-2xl sm:text-3xl lg:text-4xl leading-loose";
    }
  };

  const textAlignClass = () => {
    const align = keybrSettings().textAlign ?? "left";
    return align === "center"
      ? "justify-center text-center"
      : "justify-start text-left";
  };

  const separatorChar = () => {
    const sep = keybrSettings().separator ?? "dot";
    return sep === "space" ? " " : "·";
  };

  return (
    <div class="my-3 flex w-full flex-col items-center justify-center select-none">
      <div
        class={cn(
          "relative flex w-full flex-wrap items-center gap-y-3 rounded-2xl border border-sub-alt/30 bg-sub-alt/10 px-6 py-8 font-mono tracking-wider backdrop-blur-sm transition-all duration-150 outline-none select-none sm:px-10 sm:py-10",
          textAlignClass(),
          fontSizeClass(),
        )}
        tabIndex={0}
      >
        <For each={wordsList()}>
          {(wordDef) => (
            <span class="inline-flex items-center py-1 whitespace-nowrap">
              <For each={wordDef.letters}>
                {(letterDef) => {
                  const isTyped = () => letterDef.globalIndex < cursorIndex();
                  const isCurrent = () =>
                    letterDef.globalIndex === cursorIndex();
                  const isRemaining = () =>
                    letterDef.globalIndex > cursorIndex();

                  return (
                    <span
                      class={cn(
                        "relative inline-flex items-center justify-center px-[1px] transition-all duration-75",
                        isTyped() && "font-medium text-text",
                        isRemaining() && "font-normal text-sub/50",
                        isCurrent() &&
                          (hasError()
                            ? "text-rose-400 bg-rose-500/20 shadow-rose-500/20 after:bg-rose-500 rounded px-0.5 font-bold shadow-sm after:absolute after:right-0 after:-bottom-1.5 after:left-0 after:h-[3.5px] after:rounded-full"
                            : "animate-pulse font-bold text-text after:absolute after:right-0 after:-bottom-1.5 after:left-0 after:h-[3.5px] after:rounded-full after:bg-main after:shadow-sm after:shadow-main/50"),
                      )}
                    >
                      {letterDef.char}
                    </span>
                  );
                }}
              </For>
              <Show when={wordDef.hasSeparator}>
                <span
                  class={cn(
                    "relative inline-flex items-center justify-center px-1.5 transition-all duration-75 select-none",
                    wordDef.separatorIndex < cursorIndex() &&
                      "font-medium text-text/60",
                    wordDef.separatorIndex > cursorIndex() &&
                      "font-normal text-sub/30",
                    wordDef.separatorIndex === cursorIndex() &&
                      (hasError()
                        ? "text-rose-400 bg-rose-500/20 after:bg-rose-500 rounded px-1 font-bold after:absolute after:right-0 after:-bottom-1.5 after:left-0 after:h-[3.5px] after:rounded-full"
                        : "animate-pulse font-bold text-main after:absolute after:right-0 after:-bottom-1.5 after:left-0 after:h-[3.5px] after:rounded-full after:bg-main after:shadow-sm after:shadow-main/50"),
                  )}
                >
                  {separatorChar()}
                </span>
              </Show>
            </span>
          )}
        </For>
      </div>
    </div>
  );
}
