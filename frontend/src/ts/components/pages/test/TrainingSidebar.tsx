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
      <div class="mx-auto mb-8 w-full max-w-5xl select-none">
        <div class="flex w-full flex-col items-start justify-between gap-6 rounded-xl border border-sub-alt bg-sub-alt/20 p-4 shadow-sm backdrop-blur-sm lg:flex-row lg:items-center">
          {/* Left: Current Unit */}
          <div class="flex shrink-0 flex-col gap-1">
            <span class="font-mono text-[11px] font-bold tracking-widest text-main uppercase opacity-80">
              Current Unit
            </span>
            <div class="flex items-center gap-2 text-lg font-bold text-text">
              <Fa icon="fa-book-open" class="text-main" />
              <span>{unitShortTitle()}</span>
            </div>
          </div>

          {/* Middle: Lesson Progression Horizontal Track */}
          <div class="flex w-full max-w-2xl flex-1 flex-col gap-1">
            <span class="font-mono text-[11px] font-bold tracking-widest text-sub uppercase opacity-80">
              Lesson Progression
            </span>
            <div class="mt-1 flex items-center gap-3">
              <For each={visibleStages()}>
                {(stage, index) => {
                  const isActive = () => stage.id === currentStage().id;

                  return (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          selectTrainingStage(currentUnit(), stage)
                        }
                        class={cn(
                          "flex items-center gap-2 whitespace-nowrap transition-all",
                          isActive()
                            ? "font-bold text-text"
                            : "text-sub opacity-50 hover:text-text hover:opacity-100",
                        )}
                      >
                        <div
                          class={cn(
                            "h-3 w-3 shrink-0 rounded-full transition-all",
                            isActive() ? "bg-main" : "bg-sub-alt",
                          )}
                        ></div>
                        <span class="text-sm font-medium">
                          {stage.stageNumber} {stage.shortTitle}
                        </span>
                      </button>

                      <Show when={index() < visibleStages().length - 1}>
                        <div class="h-[1px] min-w-[20px] flex-1 bg-sub-alt"></div>
                      </Show>
                    </>
                  );
                }}
              </For>
            </div>
          </div>

          {/* Right: Language + Progress Counter + Progress Bar */}
          <div class="flex w-full min-w-[150px] shrink-0 flex-col gap-2 lg:w-auto">
            <div class="flex items-center justify-between font-mono text-xs text-sub">
              <span class="flex items-center gap-1">
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
        </div>
      </div>
    </Show>
  );
}
