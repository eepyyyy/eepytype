import { For, JSXElement } from "solid-js";

import {
  activeLessonText,
  cursorIndex,
  hasError,
} from "../../../../states/keybr";
import { cn } from "../../../../utils/cn";

export function KeybrTextBoard(): JSXElement {
  const chars = () => activeLessonText().split("");

  return (
    <div class="my-6 flex w-full flex-col items-center justify-center select-none">
      <div
        class="flex max-w-3xl flex-wrap items-center justify-start gap-x-0 gap-y-2 rounded-xl px-4 py-6 text-left font-mono text-2xl leading-loose tracking-widest outline-none select-none sm:text-3xl"
        tabIndex={0}
      >
        <For each={chars()}>
          {(char, index) => {
            const isTyped = () => index() < cursorIndex();
            const isCurrent = () => index() === cursorIndex();
            const isRemaining = () => index() > cursorIndex();

            return (
              <span
                class={cn(
                  "relative inline-flex items-center justify-center px-[1px] transition-colors duration-75",
                  isTyped() && "font-medium text-text opacity-90",
                  isRemaining() && "font-normal text-sub/50",
                  isCurrent() &&
                    (hasError()
                      ? "font-bold text-[#e03131] underline decoration-[#e03131] decoration-3 underline-offset-8"
                      : "font-bold text-text underline decoration-main decoration-3 underline-offset-8"),
                )}
              >
                {char}
              </span>
            );
          }}
        </For>
      </div>
    </div>
  );
}
