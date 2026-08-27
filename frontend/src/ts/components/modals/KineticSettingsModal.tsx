import { createSignal, For, JSXElement, Show } from "solid-js";

import {
  KineticCorpus,
  kineticSettings,
  setTransitionRatings,
  startKineticDrill,
  transitionRatings,
  updateKineticSettings,
} from "../../states/kinetic";
import { transitionSpeedWpm } from "../../utils/kinetic/glicko2";
import { SpeedTier } from "../../utils/kinetic/inverted-index";
import { AnimatedModal } from "../common/AnimatedModal";
import { Button } from "../common/Button";

export function KineticSettingsModal(): JSXElement {
  const [showConfirmReset, setShowConfirmReset] = createSignal(false);

  const settings = () => kineticSettings();
  const ratings = () => transitionRatings();

  const corpusOptions: { id: KineticCorpus; label: string; desc: string }[] = [
    {
      id: "english_10k",
      label: "English 10k",
      desc: "Optimal broad vocabulary (Recommended)",
    },
    { id: "english_5k", label: "English 5k", desc: "Common 5,000 words" },
    { id: "english_1k", label: "English 1k", desc: "Core 1,000 words" },
    { id: "english_25k", label: "English 25k", desc: "Extended vocabulary" },
    {
      id: "english",
      label: "English 200",
      desc: "Top 200 high-frequency words",
    },
  ];

  const tierOptions: { id: SpeedTier | "auto"; label: string; desc: string }[] =
    [
      {
        id: "auto",
        label: "Adaptive (Auto)",
        desc: "Auto-adjusts to live speed",
      },
      {
        id: "beginner",
        label: "40–70 WPM",
        desc: "Short words (L ≤ 6), simple keys",
      },
      {
        id: "intermediate",
        label: "70–120 WPM",
        desc: "Bigram rolls & fluid combos",
      },
      {
        id: "advanced",
        label: "120–160 WPM",
        desc: "Syllable & cluster chunking",
      },
      {
        id: "elite",
        label: "160–200+ WPM",
        desc: "Expanded vocabulary & cadence",
      },
    ];

  // Top weak transitions
  const weakTransitions = () => {
    return Object.values(ratings())
      .filter((r) => r.sampleCount > 0)
      .sort((a, b) => a.mu - b.mu)
      .slice(0, 6);
  };

  // Top unpracticed transitions (Memory Decay)
  const decayTransitions = () => {
    return Object.values(ratings())
      .sort((a, b) => b.phi - a.phi)
      .slice(0, 6);
  };

  return (
    <AnimatedModal
      id="KineticSettingsModal"
      title="Predictive Kinetic Chunking Settings"
      modalClass="max-w-3xl"
    >
      <div class="flex flex-col gap-6 font-mono text-sm text-text">
        <p class="text-xs text-sub">
          Configure real-word corpus indexing, Glicko-2 transition tracking, and
          multi-queue spaced repetition.
        </p>

        {/* Section: Corpus & Vocabulary */}
        <div class="flex flex-col gap-3 rounded-xl border border-sub-alt/60 bg-sub-alt/20 p-4">
          <span class="text-xs font-bold tracking-wider text-main uppercase">
            Word Corpus (Inverted Kinetic Index)
          </span>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <For each={corpusOptions}>
              {(opt) => (
                <button
                  type="button"
                  onClick={() => {
                    updateKineticSettings({ corpus: opt.id });
                    void startKineticDrill();
                  }}
                  class={`flex flex-col items-start rounded-lg border p-2.5 text-left text-xs transition-all ${
                    settings().corpus === opt.id
                      ? "border-main bg-main/15 font-bold text-main shadow-xs"
                      : "border-sub-alt/40 bg-sub-alt/10 text-sub hover:border-sub hover:text-text"
                  }`}
                >
                  <span class="font-bold">{opt.label}</span>
                  <span class="text-[10px] opacity-70">{opt.desc}</span>
                </button>
              )}
            </For>
          </div>
        </div>

        {/* Section: Speed Tier Roadmap */}
        <div class="flex flex-col gap-3 rounded-xl border border-sub-alt/60 bg-sub-alt/20 p-4">
          <span class="text-xs font-bold tracking-wider text-main uppercase">
            Progressive Speed Tier
          </span>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <For each={tierOptions}>
              {(opt) => (
                <button
                  type="button"
                  onClick={() => {
                    updateKineticSettings({ speedTier: opt.id });
                    void startKineticDrill();
                  }}
                  class={`flex flex-col items-start rounded-lg border p-2.5 text-left text-xs transition-all ${
                    settings().speedTier === opt.id
                      ? "border-main bg-main/15 font-bold text-main shadow-xs"
                      : "border-sub-alt/40 bg-sub-alt/10 text-sub hover:border-sub hover:text-text"
                  }`}
                >
                  <span class="font-bold">{opt.label}</span>
                  <span class="text-[10px] opacity-70">{opt.desc}</span>
                </button>
              )}
            </For>
          </div>
        </div>

        {/* Section: Multi-Queue Ratio & Anti-Tilt */}
        <div class="flex flex-col gap-4 rounded-xl border border-sub-alt/60 bg-sub-alt/20 p-4">
          <span class="text-xs font-bold tracking-wider text-main uppercase">
            Multi-Queue Drill Composition & Anti-Tilt
          </span>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Flow Anchor */}
            <div class="flex flex-col gap-1 rounded-lg border border-sub-alt/40 bg-sub-alt/10 p-3">
              <span class="text-sky-400 text-xs font-bold">
                Flow Anchor (60%)
              </span>
              <span class="text-[10px] text-sub">
                High-confidence mastered chunks for motor rhythm.
              </span>
            </div>

            {/* Stress Drill */}
            <div class="flex flex-col gap-1 rounded-lg border border-sub-alt/40 bg-sub-alt/10 p-3">
              <span class="text-rose-400 text-xs font-bold">
                Stress Drill (30%)
              </span>
              <span class="text-[10px] text-sub">
                Lowest-rating bottlenecks and high-error transitions.
              </span>
            </div>

            {/* Memory Decay */}
            <div class="flex flex-col gap-1 rounded-lg border border-sub-alt/40 bg-sub-alt/10 p-3">
              <span class="text-amber-400 text-xs font-bold">
                Memory Decay (10%)
              </span>
              <span class="text-[10px] text-sub">
                Spaced repetition review of decayed muscle memory.
              </span>
            </div>
          </div>

          {/* Anti-Tilt Protection Toggle */}
          <div class="flex items-center justify-between border-t border-sub-alt/30 pt-3">
            <div class="flex flex-col">
              <span class="font-bold text-text">
                Dynamic Anti-Tilt Protection
              </span>
              <span class="text-xs text-sub">
                Auto-switch to 80% Flow Anchor when drill accuracy dips below
                88% to rebuild rhythm and confidence.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings().antiTiltEnabled}
              onChange={(e) =>
                updateKineticSettings({
                  antiTiltEnabled: e.currentTarget.checked,
                })
              }
              class="h-5 w-5 cursor-pointer rounded-md accent-main"
            />
          </div>
        </div>

        {/* Section: Kinetic Skill Rating Inspector */}
        <Show when={Object.keys(ratings()).length > 0}>
          <div class="flex flex-col gap-3 rounded-xl border border-sub-alt/60 bg-sub-alt/20 p-4">
            <span class="text-xs font-bold tracking-wider text-main uppercase">
              Live Glicko-2 Transition Skills
            </span>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Weak Transitions */}
              <div class="flex flex-col gap-1.5">
                <span class="text-rose-400 text-xs font-semibold">
                  Top Motor Bottlenecks (Lowest Speed / Errors)
                </span>
                <div class="flex flex-wrap gap-1.5">
                  <For each={weakTransitions()}>
                    {(item) => (
                      <span class="bg-rose-500/20 text-rose-300 border-rose-500/30 rounded border px-2 py-1 text-xs font-bold">
                        {item.transition.toUpperCase()} (
                        {transitionSpeedWpm(item.mu)} WPM)
                      </span>
                    )}
                  </For>
                </div>
              </div>

              {/* Memory Decay */}
              <div class="flex flex-col gap-1.5">
                <span class="text-amber-400 text-xs font-semibold">
                  High Uncertainty (Memory Decay Queue)
                </span>
                <div class="flex flex-wrap gap-1.5">
                  <For each={decayTransitions()}>
                    {(item) => (
                      <span class="bg-amber-500/20 text-amber-300 border-amber-500/30 rounded border px-2 py-1 text-xs font-bold">
                        {item.transition.toUpperCase()} (Uncertainty:{" "}
                        {Math.round(item.phi * 100)}%)
                      </span>
                    )}
                  </For>
                </div>
              </div>
            </div>
          </div>
        </Show>

        {/* Reset Transition Ratings */}
        <div class="border-rose-500/30 bg-rose-500/10 flex flex-col gap-3 rounded-xl border p-4">
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-rose-400 font-bold">
                Reset Transition Ratings
              </span>
              <span class="text-xs text-sub">
                Wipe all Glicko-2 ratings and return to fresh baseline
                calibration.
              </span>
            </div>

            <Button
              variant="button"
              class="border-rose-500/50 bg-rose-500/20 text-rose-400 hover:bg-rose-500/40"
              text={showConfirmReset() ? "Confirm Reset?" : "Reset Ratings"}
              fa={{ icon: "fa-trash-alt" }}
              onClick={() => {
                if (showConfirmReset()) {
                  setTransitionRatings({});
                  localStorage.removeItem("eepytype_kinetic_state_v1");
                  setShowConfirmReset(false);
                  void startKineticDrill();
                } else {
                  setShowConfirmReset(true);
                }
              }}
            />
          </div>
        </div>
      </div>
    </AnimatedModal>
  );
}
