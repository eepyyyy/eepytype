import { For, JSXElement, Show } from "solid-js";

import {
  activeKineticDrill,
  drillWordIndex,
  isAntiTiltEngaged,
  kineticDiagnostics,
  kineticSettings,
  startKineticDrill,
} from "../../../../states/kinetic";
import { showModal } from "../../../../states/modals";
import { cn } from "../../../../utils/cn";
import { Fa } from "../../../common/Fa";

export function KineticDiagnostics(): JSXElement {
  const diag = () => kineticDiagnostics();
  const settings = () => kineticSettings();

  const motorSpeedWpm = () =>
    diag().meanIkiMs > 0 ? Math.round(12000 / diag().meanIkiMs) : 0;

  return (
    <div class="mx-auto flex w-full flex-col gap-3 font-mono text-xs select-none">
      {/* Row 1: Dual-Latency Telemetry & Action Toolbar */}
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-sub-alt/30 pb-2.5">
        <div class="flex flex-wrap items-center gap-4 text-sub sm:gap-6">
          {/* Cognitive Hesitation (IKL) */}
          <div class="flex items-center gap-1.5">
            <span class="text-sub/70">Cognitive (IKL):</span>
            <span class="font-bold text-text">{diag().meanIklMs}ms</span>
            <Show when={diag().lastIklMs > diag().meanIklMs * 1.5}>
              <span class="text-amber-400 text-[10px] font-bold">
                (Hesitation)
              </span>
            </Show>
          </div>

          {/* Motor Execution (IKI) */}
          <div class="flex items-center gap-1.5">
            <span class="text-sub/70">Motor (IKI):</span>
            <span class="font-bold text-text">{diag().meanIkiMs}ms</span>
            <span class="text-emerald-400 text-[11px] font-bold">
              ({motorSpeedWpm()} WPM)
            </span>
          </div>

          {/* Active Corpus */}
          <div class="flex items-center gap-1.5">
            <span class="text-sub/70">Corpus:</span>
            <span class="font-bold text-main uppercase">
              {settings().corpus}
            </span>
          </div>

          {/* Anti-Tilt Status */}
          <Show when={isAntiTiltEngaged()}>
            <span class="bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse rounded border px-2 py-0.5 text-[10px] font-extrabold">
              ANTI-TILT (80% FLOW)
            </span>
          </Show>
        </div>

        {/* Top Right Action Toolbar */}
        <div class="flex items-center gap-1 text-sub">
          <button
            type="button"
            title="Restart Drill (Esc)"
            onClick={() => void startKineticDrill()}
            class="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-sub-alt/40 hover:text-text"
          >
            <Fa icon="fa-undo" />
          </button>

          <button
            type="button"
            title="Kinetic Chunking Settings"
            onClick={() => showModal("KineticSettingsModal")}
            class="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-sub-alt/40 hover:text-text"
          >
            <Fa icon="fa-cog" />
          </button>
        </div>
      </div>

      {/* Row 2: Multi-Queue Word Stream Tags */}
      <div class="flex flex-wrap items-center gap-1.5 pt-1">
        <span class="mr-1 text-[11px] font-bold text-sub/70 uppercase">
          Queue Plan:
        </span>
        <For each={activeKineticDrill()}>
          {(item, idx) => {
            const isCurrent = () => idx() === drillWordIndex();
            const isPast = () => idx() < drillWordIndex();

            const queueColor = () => {
              if (item.queueType === "stress") {
                return isCurrent()
                  ? "bg-rose-500 text-white font-black ring-2 ring-rose-400"
                  : isPast()
                    ? "bg-rose-500/20 text-rose-300 opacity-60"
                    : "bg-rose-500/25 text-rose-300 border border-rose-500/30";
              }
              if (item.queueType === "decay") {
                return isCurrent()
                  ? "bg-amber-500 text-white font-black ring-2 ring-amber-400"
                  : isPast()
                    ? "bg-amber-500/20 text-amber-300 opacity-60"
                    : "bg-amber-500/25 text-amber-300 border border-amber-500/30";
              }
              return isCurrent()
                ? "bg-sky-500 text-white font-black ring-2 ring-sky-400"
                : isPast()
                  ? "bg-sky-500/20 text-sky-300 opacity-60"
                  : "bg-sky-500/25 text-sky-300 border border-sky-500/30";
            };

            return (
              <span
                class={cn(
                  "rounded px-2 py-0.5 text-[11px] font-medium transition-all duration-150",
                  queueColor(),
                )}
              >
                {item.word}
              </span>
            );
          }}
        </For>
      </div>

      {/* Row 3: Active Bottlenecks List */}
      <Show when={diag().motorBottlenecks.length > 0}>
        <div class="flex flex-wrap items-center gap-2 pt-1">
          <span class="text-rose-400 text-[10px] font-bold uppercase">
            Active Bottlenecks:
          </span>
          <div class="flex flex-wrap gap-1">
            <For each={diag().motorBottlenecks}>
              {(trans) => (
                <span class="bg-rose-500/20 text-rose-300 rounded px-1.5 py-0.5 text-[10px] font-extrabold">
                  {trans.toUpperCase()}
                </span>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}
