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

  // Display clean focused window around current stage if more than 5 stages
  const visibleStages = createMemo(() => {
    const all = currentUnit().stages;
    if (all.length <= 5) return all;
    const currIdx = all.findIndex((s) => s.id === currentStage().id);
    const safeIdx = currIdx >= 0 ? currIdx : 0;
    const start = Math.max(0, Math.min(safeIdx - 1, all.length - 4));
    return all.slice(start, start + 4);
  });

  return (
    <Show when={isTrainingActive()}>
      <aside
        aria-label="Training Lesson Progression"
        class="pointer-events-auto fixed top-1/2 right-6 z-10 flex w-56 -translate-y-1/2 flex-col justify-between bg-transparent select-none md:right-12 xl:right-20"
      >
        {/* Top: Lesson Description */}
        <div>
          <div class="font-mono text-[10px] font-bold tracking-widest text-main uppercase">
            LESSON DESCRIPTION
          </div>

          <div class="mt-2.5 flex items-start gap-2.5">
            <Fa icon="fa-book-open" class="mt-0.5 shrink-0 text-sm text-main" />
            <h3 class="text-[15px] leading-tight font-bold text-text">
              {currentUnit().title}
            </h3>
          </div>

          {/* Middle: Lesson Progression */}
          <div class="mt-8">
            <div class="font-mono text-[10px] font-bold tracking-widest text-sub/60 uppercase">
              LESSON PROGRESSION
            </div>

            {/* Vertical timeline */}
            <div class="relative mt-3.5 pl-3">
              {/* Connected vertical line */}
              <div class="pointer-events-none absolute top-1.5 bottom-1.5 left-[3.5px] w-[1px] bg-sub/20"></div>

              <div class="flex flex-col gap-3.5 overflow-hidden">
                <For each={visibleStages()}>
                  {(stage) => {
                    const isActive = () => stage.id === currentStage().id;

                    return (
                      <button
                        type="button"
                        onClick={() =>
                          selectTrainingStage(currentUnit(), stage)
                        }
                        class={cn(
                          "group relative flex items-center gap-2.5 text-left transition-all",
                          isActive()
                            ? "font-bold text-text"
                            : "text-sub/70 hover:text-text",
                        )}
                      >
                        {/* Milestone dot on line */}
                        <div
                          class={cn(
                            "relative z-10 h-[7px] w-[7px] shrink-0 rounded-full transition-all",
                            isActive()
                              ? "scale-125 bg-main ring-2 ring-main/30"
                              : "bg-sub/30 group-hover:bg-sub/60",
                          )}
                        ></div>

                        {/* Stage text: e.g. 2.1 Positioning */}
                        <span
                          class={cn(
                            "font-mono text-[12px] transition-colors",
                            isActive()
                              ? "font-bold text-text"
                              : "text-sub/70 group-hover:text-text",
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
          </div>
        </div>

        {/* Bottom Status: Divider + Language + Progress Counter + Progress Bar */}
        <div class="mt-10 border-t border-sub/20 pt-3">
          <div class="flex items-center justify-between text-xs text-sub/70">
            <span class="flex items-center gap-1.5 font-mono text-[11px]">
              <Fa icon="fa-globe" class="text-[11px] text-sub/60" />
              english
            </span>
            <span class="font-mono text-[11px] font-bold text-text">
              {currentIndex()} / {totalStages()}
            </span>
          </div>

          {/* Yellow Progress bar */}
          <div class="mt-2 h-[2.5px] w-full overflow-hidden rounded-full bg-sub/20">
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
