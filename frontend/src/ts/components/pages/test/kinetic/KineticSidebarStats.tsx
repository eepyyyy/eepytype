import { For, JSXElement, Show } from "solid-js";

import {
  calculateProjectedMilestones,
  isAntiTiltEngaged,
  isWarmupActive,
  kineticDiagnostics,
  kineticSettings,
  launchMicroDrill,
  startDiagnosticWarmup,
  streakCount,
  transitionRatings,
} from "../../../../states/kinetic";
import { cn } from "../../../../utils/cn";
import { transitionSpeedWpm } from "../../../../utils/kinetic/glicko2";
import { Fa } from "../../../common/Fa";

export function KineticSidebarStats(): JSXElement {
  const diag = () => kineticDiagnostics();
  const settings = () => kineticSettings();
  const ratings = () => transitionRatings();

  const motorWpm = () =>
    diag().meanIkiMs > 0 ? Math.round(12000 / diag().meanIkiMs) : 60;

  const projection = () => calculateProjectedMilestones(motorWpm(), ratings());

  // Bigram Skill Map Categorization
  const skillMap = () => {
    const all = Object.values(ratings());
    const fallbackList = [
      "th",
      "he",
      "in",
      "er",
      "an",
      "re",
      "on",
      "at",
      "en",
      "nd",
      "ti",
      "es",
      "or",
      "te",
      "of",
      "ed",
      "is",
      "it",
      "al",
      "ar",
      "st",
      "to",
      "nt",
      "ng",
      "se",
      "ha",
      "as",
      "ou",
      "io",
      "le",
    ];

    const nodes: {
      transition: string;
      status: "mastered" | "decaying" | "bottleneck" | "learning";
      wpm: number;
      phi: number;
    }[] = [];

    const existingMap = new Map(all.map((r) => [r.transition, r]));

    for (const key of fallbackList) {
      const r = existingMap.get(key);
      if (!r || r.sampleCount === 0) {
        nodes.push({
          transition: key,
          status: "decaying",
          wpm: 45,
          phi: 1.15,
        });
      } else if (r.totalErrors > 2 || r.mu < -0.2) {
        nodes.push({
          transition: key,
          status: "bottleneck",
          wpm: transitionSpeedWpm(r.mu),
          phi: r.phi,
        });
      } else if (r.mu >= 0.8 && r.phi < 0.45) {
        nodes.push({
          transition: key,
          status: "mastered",
          wpm: transitionSpeedWpm(r.mu),
          phi: r.phi,
        });
      } else {
        nodes.push({
          transition: key,
          status: "learning",
          wpm: transitionSpeedWpm(r.mu),
          phi: r.phi,
        });
      }
    }

    return nodes;
  };

  return (
    <div class="flex w-full flex-col gap-4 font-mono text-xs select-none lg:w-80">
      {/* 1. Predictive Trajectory Card */}
      <div class="flex flex-col gap-2 rounded-xl border border-main/40 bg-main/10 p-3.5 shadow-lg backdrop-blur-md">
        <div class="flex items-center justify-between">
          <span class="flex items-center gap-1.5 font-bold text-main uppercase">
            <Fa icon="fa-chart-line" />
            Speed Trajectory
          </span>
          <span class="rounded bg-main/20 px-2 py-0.5 text-[10px] font-extrabold text-main">
            {projection().currentTier.toUpperCase()} →{" "}
            {projection().nextTier.toUpperCase()}
          </span>
        </div>

        <div class="flex items-baseline justify-between pt-1">
          <div class="flex flex-col">
            <span class="text-[10px] text-sub">Current Speed:</span>
            <span class="text-lg font-black text-text">
              {projection().currentGrossWpm}{" "}
              <span class="text-xs font-normal text-sub">WPM</span>
            </span>
          </div>
          <div class="flex flex-col items-end">
            <span class="text-[10px] text-sub">Target Milestone:</span>
            <span class="text-lg font-black text-main">
              {projection().targetWpm}{" "}
              <span class="text-xs font-normal text-sub">WPM</span>
            </span>
          </div>
        </div>

        {/* Milestone Estimate */}
        <div class="mt-1 flex items-center justify-between rounded-lg bg-bg/60 px-2.5 py-1.5 text-[11px]">
          <span class="text-sub">Estimated practice:</span>
          <span class="text-sky-400 font-bold">
            ~{projection().estimatedPracticeHours} hrs (
            {projection().estimatedDaysAt15MinDaily} days @ 15m/d)
          </span>
        </div>
      </div>

      {/* 2. Dual-Latency Gauges (Cognitive vs Motor) */}
      <div class="flex flex-col gap-2.5 rounded-xl border border-sub-alt/40 bg-[#1e2023]/90 p-3.5 shadow-lg">
        <span class="text-xs font-bold text-text uppercase">
          Dual-Latency Decomposition
        </span>

        <div class="grid grid-cols-2 gap-2">
          {/* IKL Cognitive Gauge */}
          <div class="flex flex-col gap-1 rounded-lg border border-sub-alt/40 bg-sub-alt/20 p-2.5">
            <span class="text-[10px] text-sub uppercase">Cognitive (IKL)</span>
            <span class="text-base font-black text-text">
              {diag().meanIklMs}{" "}
              <span class="text-[10px] font-normal text-sub">ms</span>
            </span>
            <span class="text-[9px] text-sub">
              Visual planning & cue recognition
            </span>
          </div>

          {/* IKI Motor Gauge */}
          <div class="flex flex-col gap-1 rounded-lg border border-sub-alt/40 bg-sub-alt/20 p-2.5">
            <span class="text-[10px] text-sub uppercase">Motor (IKI)</span>
            <span class="text-emerald-400 text-base font-black">
              {diag().meanIkiMs}{" "}
              <span class="text-[10px] font-normal text-sub">ms</span>
            </span>
            <span class="text-[9px] text-sub">
              Finger velocity ({motorWpm()} WPM)
            </span>
          </div>
        </div>

        {/* Clean Streak & Rolling Accuracy */}
        <div class="flex items-center justify-between border-t border-sub-alt/30 pt-2 text-[11px]">
          <div class="flex items-center gap-1">
            <span class="text-sub">Clean Streak:</span>
            <span class="text-sky-400 font-bold">{streakCount()} hits</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="text-sub">Accuracy:</span>
            <span class="font-bold text-text">
              {Math.round(diag().rollingAccuracy * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Bigram Skill Map & 1-Click Micro-Drills */}
      <div class="flex flex-col gap-2.5 rounded-xl border border-sub-alt/40 bg-[#1e2023]/90 p-3.5 shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-text uppercase">
            Bigram Skill Map
          </span>
          <span class="text-[9px] text-sub">Click node for micro-drill</span>
        </div>

        {/* Legend */}
        <div class="flex items-center gap-2 text-[9px] text-sub">
          <span class="flex items-center gap-1">
            <span class="bg-emerald-400 h-2 w-2 rounded-full"></span> Mastered
          </span>
          <span class="flex items-center gap-1">
            <span class="bg-amber-400 h-2 w-2 rounded-full"></span> Decaying
          </span>
          <span class="flex items-center gap-1">
            <span class="bg-rose-400 h-2 w-2 rounded-full"></span> Bottleneck
          </span>
        </div>

        {/* Skill Map Nodes Grid */}
        <div class="grid grid-cols-5 gap-1.5 pt-1">
          <For each={skillMap()}>
            {(node) => {
              const bgClass = () => {
                if (node.status === "mastered") {
                  return "border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40";
                }
                if (node.status === "bottleneck") {
                  return "border-rose-500/40 bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 animate-pulse";
                }
                if (node.status === "decaying") {
                  return "border-amber-500/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/40";
                }
                return "border-sub-alt/40 bg-sub-alt/20 text-sub hover:bg-sub-alt/40";
              };

              return (
                <button
                  type="button"
                  title={`Launch 30s micro-drill on [${node.transition.toUpperCase()}] (${node.wpm} WPM)`}
                  onClick={() => void launchMicroDrill(node.transition)}
                  class={cn(
                    "flex flex-col items-center justify-center rounded-lg border py-1.5 transition-all active:scale-90",
                    bgClass(),
                  )}
                >
                  <span class="text-[11px] font-extrabold">
                    {node.transition.toUpperCase()}
                  </span>
                  <span class="text-[8px] opacity-70">{node.wpm}w</span>
                </button>
              );
            }}
          </For>
        </div>
      </div>

      {/* 4. Queue Distribution & Diagnostic Warm-up */}
      <div class="flex flex-col gap-2.5 rounded-xl border border-sub-alt/40 bg-[#1e2023]/90 p-3.5 shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-text uppercase">
            Queue Allocation
          </span>
          <Show when={isAntiTiltEngaged()}>
            <span class="bg-rose-500/20 text-rose-400 rounded px-1.5 py-0.5 text-[9px] font-bold">
              ANTI-TILT
            </span>
          </Show>
        </div>

        {/* Visual Allocation Bar */}
        <div class="flex h-3 w-full overflow-hidden rounded-full border border-sub-alt/40">
          <div
            class="bg-sky-500 transition-all duration-300"
            style={{ width: `${settings().flowRatio * 100}%` }}
            title="Flow Anchor (60%)"
          ></div>
          <div
            class="bg-rose-500 transition-all duration-300"
            style={{ width: `${settings().stressRatio * 100}%` }}
            title="Stress Drill (30%)"
          ></div>
          <div
            class="bg-amber-500 transition-all duration-300"
            style={{ width: `${settings().decayRatio * 100}%` }}
            title="Memory Decay (10%)"
          ></div>
        </div>

        {/* Diagnostic Warm-Up Button */}
        <button
          type="button"
          onClick={() => void startDiagnosticWarmup()}
          class={cn(
            "mt-1 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-all active:scale-95",
            isWarmupActive()
              ? "border-amber-400 bg-amber-400/20 text-amber-300"
              : "border-sub-alt/60 bg-sub-alt/30 text-sub hover:border-main/50 hover:bg-sub-alt/60 hover:text-text",
          )}
        >
          <Fa icon="fa-fire" class="text-amber-400" />
          {isWarmupActive() ? "Warm-Up Active" : "Run 60s Diagnostic Warm-Up"}
        </button>
      </div>
    </div>
  );
}
