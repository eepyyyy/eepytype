import { createMemo, For, JSXElement, Show } from "solid-js";

import {
  activeStage,
  activeUnit,
  exitTraining,
  isTrainingActive,
  selectTrainingStage,
} from "../../../states/training";
import { cn } from "../../../utils/cn";
import { Fa } from "../../common/Fa";

export function TrainingSidebar(): JSXElement {
  const currentUnit = createMemo(() => activeUnit());
  const currentStage = createMemo(() => activeStage());

  const currentIndex = createMemo(() => {
    const stages = currentUnit().stages;
    const idx = stages.findIndex((s) => s.id === currentStage().id);
    return idx >= 0 ? idx + 1 : 1;
  });

  const totalStages = createMemo(() => currentUnit().stages.length);

  const progressPercent = createMemo(() => {
    if (totalStages() === 0) return 0;
    return Math.round((currentIndex() / totalStages()) * 100);
  });

  return (
    <Show when={isTrainingActive()}>
      <aside
        aria-label="Training Lesson Progression"
        class={cn(
          "fixed top-1/2 right-4 z-20 -translate-y-1/2 md:right-8",
          "w-64 rounded-2xl border border-sub-alt/60 bg-bg/95 p-5 shadow-2xl backdrop-blur-md sm:w-72",
          "animate-in fade-in slide-in-from-right-4 transition-all duration-300",
        )}
      >
        {/* Header / Exit button */}
        <div class="flex items-center justify-between border-b border-sub-alt/40 pb-3">
          <span class="text-[10px] font-extrabold tracking-widest text-main uppercase">
            Lesson Description
          </span>
          <button
            type="button"
            onClick={exitTraining}
            aria-label="Close Training Mode"
            class="rounded p-1 text-xs text-sub transition-colors hover:text-text"
          >
            <Fa icon="fa-times" />
          </button>
        </div>

        {/* Lesson Title with Icon */}
        <div class="mt-3 flex items-start gap-3">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-main/15 text-base text-main shadow-sm">
            <Fa icon="fa-book-open" />
          </div>
          <div>
            <h4 class="text-sm leading-snug font-bold text-text">
              {currentUnit().title}
            </h4>
            <p class="mt-0.5 text-[11px] leading-tight text-sub">
              {currentStage().description}
            </p>
          </div>
        </div>

        {/* Lesson Progression Subheader */}
        <div class="mt-6 mb-2 flex items-center justify-between">
          <span class="text-[10px] font-extrabold tracking-widest text-sub uppercase">
            Lesson Progression
          </span>
          <span class="text-[10px] font-semibold text-main/90">
            Unit {currentUnit().unitNumber}
          </span>
        </div>

        {/* Vertical Timeline Track */}
        <div class="relative mt-3 pl-3">
          {/* Vertical connecting line */}
          <div class="pointer-events-none absolute top-2 bottom-2 left-[17px] w-0.5 bg-sub-alt/50"></div>

          <div class="custom-scroll flex max-h-[45vh] flex-col gap-3.5 overflow-y-auto pr-1">
            <For each={currentUnit().stages}>
              {(stage) => {
                const isActive = () => stage.id === currentStage().id;
                const isPassed = () => {
                  const currIdx = currentUnit().stages.findIndex(
                    (s) => s.id === currentStage().id,
                  );
                  const thisIdx = currentUnit().stages.findIndex(
                    (s) => s.id === stage.id,
                  );
                  return thisIdx < currIdx;
                };

                return (
                  <button
                    type="button"
                    onClick={() => selectTrainingStage(currentUnit(), stage)}
                    class={cn(
                      "group relative flex items-center gap-3 text-left transition-all",
                      isActive()
                        ? "font-bold text-text"
                        : "text-sub hover:text-text",
                    )}
                  >
                    {/* Milestone node / dot */}
                    <div
                      class={cn(
                        "relative z-10 flex h-3 w-3 shrink-0 items-center justify-center rounded-full transition-all",
                        isActive()
                          ? "scale-110 bg-main shadow-sm ring-4 ring-main/25"
                          : isPassed()
                            ? "bg-main/60"
                            : "bg-sub-alt group-hover:bg-sub",
                      )}
                    ></div>

                    {/* Stage Label */}
                    <span
                      class={cn(
                        "text-xs transition-colors",
                        isActive()
                          ? "font-bold text-text"
                          : isPassed()
                            ? "font-medium text-sub"
                            : "text-sub/80 group-hover:text-text",
                      )}
                    >
                      {stage.stageNumber} {stage.shortTitle}
                    </span>
                  </button>
                );
              }}
            </For>
          </div>
        </div>

        {/* Bottom Status: Language & Progress count + Bar */}
        <div class="mt-7 border-t border-sub-alt/40 pt-3.5">
          <div class="flex items-center justify-between text-xs text-sub">
            <span class="flex items-center gap-1.5 font-medium">
              <Fa icon="fa-globe" class="text-[11px]" /> english
            </span>
            <span class="font-bold text-text">
              {currentIndex()} / {totalStages()}
            </span>
          </div>

          {/* Yellow Progress bar */}
          <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sub-alt/40">
            <div
              class="h-full rounded-full bg-main transition-all duration-300"
              style={{ width: `${progressPercent()}%` }}
            ></div>
          </div>
        </div>
      </aside>
    </Show>
  );
}
