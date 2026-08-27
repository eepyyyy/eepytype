import { createSignal, For, JSXElement, Show } from "solid-js";

import {
  customCorpusText,
  KineticCorpus,
  kineticSettings,
  KineticTraceMode,
  setCustomCorpusText,
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
  const [customInput, setCustomInput] = createSignal(customCorpusText());

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
      id: "custom",
      label: "Custom Ingestion",
      desc: "Pasted code or custom text",
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

  const traceOptions: { id: KineticTraceMode; label: string }[] = [
    { id: "all", label: "All Strokes" },
    { id: "errors", label: "Errors Only" },
    { id: "focus", label: "Bottlenecks" },
    { id: "off", label: "Off" },
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

        {/* Section 1: Corpus & Custom Ingestion */}
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

          {/* Custom Corpus Textarea */}
          <Show when={settings().corpus === "custom"}>
            <div class="mt-2 flex flex-col gap-2 rounded-lg border border-sub-alt/40 bg-bg/60 p-3">
              <span class="text-xs font-semibold text-text">
                Paste Custom Code / Prose to Ingest into Kinetic Graph:
              </span>
              <textarea
                value={customInput()}
                onInput={(e) => setCustomInput(e.currentTarget.value)}
                placeholder="Paste JavaScript, Python, Legal briefs, Medical terms, or book chapters here..."
                rows={4}
                class="w-full rounded-md border border-sub-alt/60 bg-sub-alt/20 p-2 font-mono text-xs text-text placeholder-sub/40 focus:border-main focus:outline-hidden"
              ></textarea>
              <div class="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setCustomCorpusText(customInput());
                    localStorage.setItem(
                      "eepytype_kinetic_custom_corpus_v1",
                      customInput(),
                    );
                    void startKineticDrill();
                  }}
                  class="rounded-lg bg-main px-3 py-1.5 text-xs font-bold text-bg hover:brightness-110"
                >
                  Ingest & Index Custom Graph
                </button>
              </div>
            </div>
          </Show>
        </div>

        {/* Section 2: Visual & Motor Skill UX */}
        <div class="flex flex-col gap-3 rounded-xl border border-sub-alt/60 bg-sub-alt/20 p-4">
          <span class="text-xs font-bold tracking-wider text-main uppercase">
            Visual Lookahead & Motor Conditioning
          </span>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Dynamic Lookahead Lighting */}
            <label class="flex cursor-pointer items-center justify-between rounded-lg border border-sub-alt/40 bg-sub-alt/10 p-3">
              <div class="flex flex-col pr-2">
                <span class="font-bold text-text">Lookahead Lighting</span>
                <span class="text-[11px] text-sub">
                  Illuminates upcoming 2-3 word chunks to train visual
                  lookahead.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings().lookaheadLighting}
                onChange={(e) =>
                  updateKineticSettings({
                    lookaheadLighting: e.currentTarget.checked,
                  })
                }
                class="h-4 w-4 accent-main"
              />
            </label>

            {/* Ghost Pacer */}
            <label class="flex cursor-pointer items-center justify-between rounded-lg border border-sub-alt/40 bg-sub-alt/10 p-3">
              <div class="flex flex-col pr-2">
                <span class="font-bold text-text">Ghost Pacer</span>
                <span class="text-[11px] text-sub">
                  Target speed shadow caret (+5 WPM) pulling velocity forward.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings().ghostPacer}
                onChange={(e) =>
                  updateKineticSettings({
                    ghostPacer: e.currentTarget.checked,
                  })
                }
                class="h-4 w-4 accent-main"
              />
            </label>

            {/* Cadence Metronome */}
            <label class="flex cursor-pointer items-center justify-between rounded-lg border border-sub-alt/40 bg-sub-alt/10 p-3">
              <div class="flex flex-col pr-2">
                <span class="font-bold text-text">Cadence Metronome</span>
                <span class="text-[11px] text-sub">
                  Visual pulse bar synchronizing uniform Inter-Key Intervals
                  (IKI).
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings().metronome}
                onChange={(e) =>
                  updateKineticSettings({
                    metronome: e.currentTarget.checked,
                  })
                }
                class="h-4 w-4 accent-main"
              />
            </label>

            {/* Word-Reset Conditioning */}
            <label class="flex cursor-pointer items-center justify-between rounded-lg border border-sub-alt/40 bg-sub-alt/10 p-3">
              <div class="flex flex-col pr-2">
                <span class="font-bold text-text">Word-Reset Conditioning</span>
                <span class="text-[11px] text-sub">
                  Flushes whole word on typo to rewire motor programs cleanly.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings().wordResetConditioning}
                onChange={(e) =>
                  updateKineticSettings({
                    wordResetConditioning: e.currentTarget.checked,
                  })
                }
                class="h-4 w-4 accent-main"
              />
            </label>
          </div>

          {/* Trace Mode */}
          <div class="flex items-center justify-between border-t border-sub-alt/30 pt-3">
            <span class="text-xs font-bold text-text">
              Visual Keyboard Traces:
            </span>
            <div class="flex gap-1.5">
              <For each={traceOptions}>
                {(opt) => (
                  <button
                    type="button"
                    onClick={() => updateKineticSettings({ traceMode: opt.id })}
                    class={`rounded-md border px-2.5 py-1 text-xs transition-all ${
                      settings().traceMode === opt.id
                        ? "border-main bg-main/20 font-bold text-main"
                        : "border-sub-alt/50 bg-sub-alt/20 text-sub hover:text-text"
                    }`}
                  >
                    {opt.label}
                  </button>
                )}
              </For>
            </div>
          </div>
        </div>

        {/* Section 3: Speed Tier Roadmap */}
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

        {/* Section 4: Live Glicko-2 Skills & Reset */}
        <Show when={Object.keys(ratings()).length > 0}>
          <div class="flex flex-col gap-3 rounded-xl border border-sub-alt/60 bg-sub-alt/20 p-4">
            <span class="text-xs font-bold tracking-wider text-main uppercase">
              Live Glicko-2 Transition Skills
            </span>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="flex flex-col gap-1.5">
                <span class="text-rose-400 text-xs font-semibold">
                  Top Motor Bottlenecks
                </span>
                <div class="flex flex-wrap gap-1.5">
                  <For each={weakTransitions()}>
                    {(item) => (
                      <span class="border-rose-500/30 bg-rose-500/20 text-rose-300 rounded border px-2 py-1 text-xs font-bold">
                        {item.transition.toUpperCase()} (
                        {transitionSpeedWpm(item.mu)} WPM)
                      </span>
                    )}
                  </For>
                </div>
              </div>

              <div class="flex flex-col gap-1.5">
                <span class="text-amber-400 text-xs font-semibold">
                  High Uncertainty (Memory Decay)
                </span>
                <div class="flex flex-wrap gap-1.5">
                  <For each={decayTransitions()}>
                    {(item) => (
                      <span class="border-amber-500/30 bg-amber-500/20 text-amber-300 rounded border px-2 py-1 text-xs font-bold">
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
                  localStorage.removeItem("eepytype_kinetic_state_v2");
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
