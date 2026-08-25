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
        aria-label="Training Lesson Progression"
        class={cn(
          "pointer-events-auto fixed top-1/2 right-8 z-20 -translate-y-1/2 select-none lg:right-16",
          "flex w-60 flex-col justify-between",
          "animate-in fade-in transition-all duration-300",
        )}
      >
        {/* Top: Lesson Description */}
        <div>
          <div class="font-mono text-[11px] font-bold tracking-wider text-main uppercase">
            LESSON DESCRIPTION
          </div>

          <div class="mt-2 flex items-start gap-2.5">
            <Fa icon="fa-book-open" class="mt-1 shrink-0 text-base text-main" />
            <h3 class="text-base leading-snug font-bold text-text">
              {currentUnit().title}
            </h3>
          </div>

          {/* Middle: Lesson Progression */}
          <div class="mt-7">
            <div class="font-mono text-[11px] font-bold tracking-wider text-sub/70 uppercase">
              LESSON PROGRESSION
            </div>

            {/* Vertical timeline */}
            <div class="relative mt-3 pl-2.5">
              {/* Connected vertical line */}
              <div class="pointer-events-none absolute top-1.5 bottom-1.5 left-[4.5px] w-[1.5px] bg-sub-alt/60"></div>

              <div class="custom-scroll flex max-h-[40vh] flex-col gap-3.5 overflow-y-auto pr-1">
                <For each={currentUnit().stages}>
                  {(stage) => {
                    const isActive = () => stage.id === currentStage().id;

                    return (
                      <button
                        type="button"
                        onClick={() =>
                          selectTrainingStage(currentUnit(), stage)
                        }
                        class={cn(
                          "group relative flex items-center gap-3 text-left transition-all",
                          isActive()
                            ? "font-bold text-text"
                            : "text-sub/80 hover:text-text",
                        )}
                      >
                        {/* Milestone dot on line */}
                        <div
                          class={cn(
                            "relative z-10 h-2 w-2 shrink-0 rounded-full transition-all",
                            isActive()
                              ? "scale-125 bg-main ring-2 ring-main/30"
                              : "bg-sub-alt group-hover:bg-sub",
                          )}
                        ></div>

                        {/* Stage text: e.g. 2.1 Positioning */}
                        <span
                          class={cn(
                            "text-xs transition-colors",
                            isActive()
                              ? "font-bold text-text"
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
          </div>
        </div>

        {/* Bottom Status: Divider + Language + Progress Counter + Progress Bar */}
        <div class="mt-10 border-t border-sub-alt/40 pt-3.5">
          <div class="flex items-center justify-between text-xs text-sub">
            <span class="flex items-center gap-1.5 font-mono">
              <Fa icon="fa-globe" class="text-xs text-sub/80" />
              english
            </span>
            <span class="font-mono font-bold text-text">
              {currentIndex()} / {totalStages()}
            </span>
          </div>

          {/* Yellow Progress bar */}
          <div class="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-sub-alt/50">
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
