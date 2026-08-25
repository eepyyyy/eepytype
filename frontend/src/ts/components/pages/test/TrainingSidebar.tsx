import { createMemo, For, JSXElement, Show } from "solid-js";

import {
  activeStage,
  activeUnit,
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
        aria-label="Lesson Mode Sidebar"
        class={cn(
          "pointer-events-auto fixed top-1/2 right-6 z-20 -translate-y-1/2 select-none md:right-12 xl:right-16",
          "hidden w-64 flex-col gap-6 md:flex",
          "animate-in fade-in transition-all duration-300",
        )}
      >
        {/* Top: Lesson Description */}
        <div class="flex flex-col gap-1">
          <span class="font-mono text-[11px] font-bold tracking-widest text-main uppercase opacity-70">
            Lesson Description
          </span>
          <div class="flex items-center gap-2 text-[18px] font-bold text-text">
            <Fa icon="fa-book-open" class="shrink-0 text-[16px] text-main" />
            <span class="leading-tight">{currentUnit().title}</span>
          </div>
        </div>

        {/* Middle: Lesson Progression */}
        <div class="flex flex-col gap-1">
          <span class="font-mono text-[11px] font-bold tracking-widest text-sub uppercase opacity-70">
            Lesson Progression
          </span>

          <div class="relative ml-2 flex flex-col gap-4 border-l border-sub-alt py-2">
            <For each={currentUnit().stages}>
              {(stage) => {
                const isActive = () => stage.id === currentStage().id;

                return (
                  <button
                    type="button"
                    onClick={() => selectTrainingStage(currentUnit(), stage)}
                    class={cn(
                      "-ml-[5px] flex items-center gap-3 text-left transition-all",
                      isActive()
                        ? "opacity-100"
                        : "opacity-40 hover:opacity-100",
                    )}
                  >
                    <div
                      class={cn(
                        "h-2 w-2 shrink-0 rounded-full ring-4 ring-bg transition-all",
                        isActive() ? "scale-110 bg-main" : "bg-sub-alt",
                      )}
                    ></div>
                    <span
                      class={cn(
                        "text-sm transition-colors",
                        isActive()
                          ? "font-bold text-text"
                          : "font-normal text-sub",
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

        {/* Bottom: Language + Progress Counter + Progress Bar */}
        <div class="mt-auto flex flex-col gap-3 border-t border-sub-alt pt-4">
          <div class="flex items-center justify-between font-mono text-[12px] text-sub">
            <span class="flex items-center gap-1.5">
              <Fa icon="fa-globe" class="text-[14px]" /> english
            </span>
            <span class="font-bold text-text">
              {currentIndex()} / {totalStages()}
            </span>
          </div>

          {/* Yellow Progress bar */}
          <div class="h-1 w-full overflow-hidden rounded-full bg-sub-alt">
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
