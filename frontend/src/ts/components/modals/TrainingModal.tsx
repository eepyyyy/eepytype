import { createMemo, createSignal, For, JSXElement } from "solid-js";

import {
  selectTrainingStage,
  TRAINING_CURRICULUM,
  TrainingStage,
  TrainingUnit,
} from "../../states/training";
import { cn } from "../../utils/cn";
import { AnimatedModal } from "../common/AnimatedModal";
import { Fa } from "../common/Fa";

export function TrainingModal(): JSXElement {
  const firstUnit = TRAINING_CURRICULUM[0];
  const initialUnitId = firstUnit ? firstUnit.unitId : "unit-1";

  const [selectedUnitId, setSelectedUnitId] =
    createSignal<string>(initialUnitId);

  const selectedUnit = createMemo<TrainingUnit>(() => {
    const found = TRAINING_CURRICULUM.find(
      (u: TrainingUnit) => u.unitId === selectedUnitId(),
    );
    if (found) return found;
    const fallback = TRAINING_CURRICULUM[0];
    if (fallback) return fallback;
    return {
      unitId: "unit-1",
      unitNumber: 1,
      title: "Mastering the Home Row",
      subtitle: "Finger placement & anchor key reaches",
      icon: "fa-seedling",
      stages: [],
    };
  });

  const handleSelect = (stage: TrainingStage): void => {
    selectTrainingStage(selectedUnit(), stage);
  };

  return (
    <AnimatedModal
      id="TrainingModal"
      title="Touch Typing Training & Curriculum"
      modalClass="max-w-4xl"
    >
      <div class="flex flex-col gap-5">
        {/* Header Description */}
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-sub-alt pb-3">
          <p class="text-xs text-sub">
            Master touch typing with progressive drills inspired by Typing.com:
            Home Row, multi-row reaches, numbers, code syntax, and endurance.
          </p>
          <span class="rounded-full bg-sub-alt px-3 py-1 text-xs font-semibold text-main">
            {TRAINING_CURRICULUM.length} Units Available
          </span>
        </div>

        {/* Unit Selection Tabs */}
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <For each={TRAINING_CURRICULUM}>
            {(unit) => {
              const isSelected = () => unit.unitId === selectedUnitId();
              return (
                <button
                  type="button"
                  onClick={() => setSelectedUnitId(unit.unitId)}
                  class={cn(
                    "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all",
                    isSelected()
                      ? "border-main bg-main/10 text-text shadow-sm"
                      : "border-sub-alt/60 bg-sub-alt/20 text-sub hover:border-sub-alt hover:bg-sub-alt/40 hover:text-text",
                  )}
                >
                  <div class="flex items-center gap-1.5">
                    <span
                      class={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold",
                        isSelected()
                          ? "bg-main text-bg"
                          : "bg-sub-alt text-sub",
                      )}
                    >
                      {unit.unitNumber}
                    </span>
                    <span class="truncate text-xs font-bold text-text">
                      {unit.title}
                    </span>
                  </div>
                  <span class="line-clamp-1 text-[10px] text-sub">
                    {unit.subtitle}
                  </span>
                </button>
              );
            }}
          </For>
        </div>

        {/* Active Unit Stages List */}
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <h3 class="flex items-center gap-2 text-sm font-bold text-text">
              <Fa icon={selectedUnit().icon} class="text-main" />
              Unit {selectedUnit().unitNumber}: {selectedUnit().title}
            </h3>
            <span class="text-xs text-sub">
              {selectedUnit().stages.length} Drills
            </span>
          </div>

          <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <For each={selectedUnit().stages}>
              {(stage) => (
                <div class="flex flex-col justify-between rounded-xl border border-sub-alt/70 bg-sub-alt/30 p-4 transition-all hover:border-main/50 hover:bg-sub-alt/60">
                  <div>
                    <div class="flex items-center justify-between">
                      <span class="rounded bg-main/15 px-2 py-0.5 text-[10px] font-bold text-main">
                        Stage {stage.stageNumber}
                      </span>
                      <span class="font-mono text-[10px] text-sub">
                        {stage.drillText.split(" ").length} words
                      </span>
                    </div>

                    <h4 class="mt-2 text-sm font-bold text-text">
                      {stage.title}
                    </h4>
                    <p class="mt-1 text-xs leading-relaxed text-sub">
                      {stage.description}
                    </p>

                    {/* Drill preview */}
                    <p class="mt-2.5 line-clamp-2 rounded-lg bg-bg/60 p-2 font-mono text-[11px] text-sub/90">
                      {stage.drillText}
                    </p>
                  </div>

                  <div class="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSelect(stage)}
                      class="flex items-center gap-1.5 rounded-lg bg-main px-3.5 py-1.5 text-xs font-semibold text-bg shadow-sm transition-all hover:brightness-110 active:scale-95"
                    >
                      <Fa icon="fa-play" class="text-[10px]" />
                      Start Drill
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </AnimatedModal>
  );
}
