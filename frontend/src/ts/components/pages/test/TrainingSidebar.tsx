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

  // Display 3 to 4 stages centered around current stage for horizontal timeline
  const visibleStages = createMemo(() => {
    const all = currentUnit().stages;
    if (all.length <= 3) return all;
    const currIdx = all.findIndex((s) => s.id === currentStage().id);
    const safeIdx = currIdx >= 0 ? currIdx : 0;
    const start = Math.max(0, Math.min(safeIdx - 1, all.length - 3));
    return all.slice(start, start + 3);
  });

  const unitShortTitle = createMemo(() => {
    const num = currentUnit().unitNumber;
    const rawTitle = currentUnit().title;
    // Format as "Unit X: Basics" or "Unit X: Home Row"
    const cleaned =
      rawTitle
        .split("&")[0]
        ?.split("—")[0]
        ?.replace(/Mastering the /i, "")
        ?.trim() ?? "Basics";
    return `Unit ${num}: ${cleaned}`;
  });

  return (
    <Show when={isTrainingActive()}>
      <div
        aria-label="Training Lesson Progression HUD"
        class="animate-in fade-in mx-auto my-3 w-full max-w-4xl duration-200 select-none"
      >
        <div class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-sub-alt/40 bg-sub-alt/15 px-5 py-3 shadow-sm backdrop-blur-sm">
          {/* Left: Current Unit */}
          <div class="flex shrink-0 flex-col gap-1 border-r border-sub-alt/30 pr-5">
            <span class="font-mono text-[10px] font-bold tracking-wider text-main uppercase">
              CURRENT UNIT
            </span>
            <div class="flex items-center gap-2">
              <Fa icon="fa-book-open" class="text-sm text-main" />
              <span class="text-sm font-bold whitespace-nowrap text-text">
                {unitShortTitle()}
              </span>
            </div>
          </div>

          {/* Middle: Lesson Progression Horizontal Track */}
          <div class="flex min-w-0 flex-1 flex-col gap-1 px-3">
            <span class="font-mono text-[10px] font-bold tracking-wider text-sub/70 uppercase">
              LESSON PROGRESSION
            </span>

            {/* Horizontal Timeline Track */}
            <div class="flex items-center gap-3 overflow-hidden">
              <For each={visibleStages()}>
                {(stage, index) => {
                  const isActive = () => stage.id === currentStage().id;

                  return (
                    <div class="flex shrink-0 items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          selectTrainingStage(currentUnit(), stage)
                        }
                        class={cn(
                          "flex items-center gap-2 text-left transition-all",
                          isActive()
                            ? "font-bold text-text"
                            : "text-sub/70 hover:text-text",
                        )}
                      >
                        {/* Milestone dot */}
                        <div
                          class={cn(
                            "h-2 w-2 shrink-0 rounded-full transition-all",
                            isActive()
                              ? "scale-110 bg-main ring-2 ring-main/30"
                              : "bg-sub-alt",
                          )}
                        ></div>
                        <span
                          class={cn(
                            "font-mono text-xs whitespace-nowrap transition-colors",
                            isActive() ? "font-bold text-text" : "text-sub/70",
                          )}
                        >
                          {stage.stageNumber} {stage.shortTitle}
                        </span>
                      </button>

                      {/* Connecting line between stages */}
                      <Show when={index() < visibleStages().length - 1}>
                        <div class="h-[1px] w-8 shrink-0 bg-sub-alt/60 sm:w-12"></div>
                      </Show>
                    </div>
                  );
                }}
              </For>
            </div>
          </div>

          {/* Right: Language + Counter + Progress Bar */}
          <div class="flex w-32 shrink-0 flex-col gap-1.5 border-l border-sub-alt/30 pl-5 sm:w-36">
            <div class="flex items-center justify-between font-mono text-xs">
              <span class="flex items-center gap-1.5 text-sub/70">
                <Fa icon="fa-globe" class="text-[10px]" /> english
              </span>
              <span class="font-bold text-text">
                {currentIndex()} / {totalStages()}
              </span>
            </div>

            {/* Yellow Progress bar */}
            <div class="h-[3px] w-full overflow-hidden rounded-full bg-sub-alt/40">
              <div
                class="h-full rounded-full bg-main transition-all duration-300"
                style={{ width: `${progressPercent()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
