import { createSignal, For, JSXElement, Show } from "solid-js";

import {
  customCorpusText,
  KineticCorpus,
  kineticSettings,
  KineticTraceMode,
  setCustomCorpusText,
  setRepeatedMistakes,
  setTransitionRatings,
  startKineticDrill,
  updateKineticSettings,
} from "../../states/kinetic";
import { SpeedTier } from "../../utils/kinetic/inverted-index";
import { AnimatedModal } from "../common/AnimatedModal";
import { Button } from "../common/Button";

export function KineticSettingsModal(): JSXElement {
  const [showConfirmReset, setShowConfirmReset] = createSignal(false);
  const [customInput, setCustomInput] = createSignal(customCorpusText());

  const settings = () => kineticSettings();

  const corpusOptions: { id: KineticCorpus; label: string; desc: string }[] = [
    {
      id: "english",
      label: "English 200",
      desc: "Top 200 high-frequency words",
    },
    { id: "english_1k", label: "English 1k", desc: "Core 1,000 words" },
    { id: "english_5k", label: "English 5k", desc: "Common 5,000 words" },
    {
      id: "english_10k",
      label: "English 10k",
      desc: "Optimal broad vocabulary (Recommended)",
    },
    { id: "english_25k", label: "English 25k", desc: "Extended vocabulary" },
    {
      id: "custom",
      label: "Custom Ingestion",
      desc: "Pasted code or custom text",
    },
  ];

  const sessionOptions = [
    {
      length: 5,
      label: "5 Tests",
      desc: "Short focused set with diagnosis report",
    },
    { length: 10, label: "10 Tests", desc: "Standard deep practice session" },
    {
      length: 0,
      label: "Continuous",
      desc: "Infinite stream without set resets",
    },
  ];

  const wordCountOptions = [10, 15, 20, 25, 30];

  const tierOptions: { id: SpeedTier | "auto"; label: string; desc: string }[] =
    [
      {
        id: "auto",
        label: "Adaptive (Auto)",
        desc: "Auto-adjusts word complexity",
      },
      {
        id: "beginner",
        label: "Short Words",
        desc: "L ≤ 6, simple orthography",
      },
      {
        id: "intermediate",
        label: "Standard Words",
        desc: "Common bigram rolls & fluid combos",
      },
      {
        id: "advanced",
        label: "Complex Words",
        desc: "Syllable & cluster chunking",
      },
    ];

  const traceOptions: { id: KineticTraceMode; label: string }[] = [
    { id: "all", label: "All Strokes" },
    { id: "errors", label: "Errors Only" },
    { id: "focus", label: "Mistake Keys" },
    { id: "off", label: "Off" },
  ];

  return (
    <AnimatedModal
      id="KineticSettingsModal"
      title="Adaptive Training & Kinetic Settings"
      modalClass="max-w-3xl"
    >
      <div class="flex flex-col gap-6 font-mono text-sm text-text">
        <p class="text-xs text-sub">
          Automatic mistake tracking dynamically synthesizes words targeting
          your weak keys. Configure language corpus, session set length, and
          visual feedback.
        </p>

        {/* Section 1: Session Set Length */}
        <div class="flex flex-col gap-3 rounded-xl border border-sub-alt/60 bg-sub-alt/20 p-4">
          <span class="text-xs font-bold tracking-wider text-main uppercase">
            Session Set Target (With Report)
          </span>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <For each={sessionOptions}>
              {(opt) => (
                <button
                  type="button"
                  onClick={() =>
                    updateKineticSettings({ sessionLength: opt.length })
                  }
                  class={`flex flex-col items-start rounded-lg border p-2.5 text-left text-xs transition-all ${
                    settings().sessionLength === opt.length
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

        {/* Section 2: Corpus & Custom Ingestion */}
        <div class="flex flex-col gap-3 rounded-xl border border-sub-alt/60 bg-sub-alt/20 p-4">
          <span class="text-xs font-bold tracking-wider text-main uppercase">
            Vocabulary Language / Corpus
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
                Paste Custom Code / Text to Ingest:
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
                  Ingest & Index Custom Vocabulary
                </button>
              </div>
            </div>
          </Show>
        </div>

        {/* Section 3: Word Count & Complexity */}
        <div class="flex flex-col gap-3 rounded-xl border border-sub-alt/60 bg-sub-alt/20 p-4">
          <span class="text-xs font-bold tracking-wider text-main uppercase">
            Words Per Test & Complexity
          </span>

          <div class="flex items-center justify-between">
            <span class="text-xs text-sub">Word Count:</span>
            <div class="flex gap-1.5">
              <For each={wordCountOptions}>
                {(count) => (
                  <button
                    type="button"
                    onClick={() => {
                      updateKineticSettings({ wordCount: count });
                      void startKineticDrill();
                    }}
                    class={`rounded-md border px-2.5 py-1 text-xs font-bold transition-all ${
                      settings().wordCount === count
                        ? "border-main bg-main/20 text-main"
                        : "border-sub-alt/50 bg-sub-alt/20 text-sub hover:text-text"
                    }`}
                  >
                    {count}
                  </button>
                )}
              </For>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
            <For each={tierOptions}>
              {(opt) => (
                <button
                  type="button"
                  onClick={() => {
                    updateKineticSettings({ speedTier: opt.id });
                    void startKineticDrill();
                  }}
                  class={`flex flex-col items-start rounded-lg border p-2 text-left text-xs transition-all ${
                    settings().speedTier === opt.id
                      ? "border-main bg-main/15 font-bold text-main"
                      : "border-sub-alt/40 bg-sub-alt/10 text-sub hover:text-text"
                  }`}
                >
                  <span class="font-bold">{opt.label}</span>
                  <span class="text-[10px] opacity-70">{opt.desc}</span>
                </button>
              )}
            </For>
          </div>
        </div>

        {/* Section 4: Visual Feedback Toggles */}
        <div class="flex flex-col gap-3 rounded-xl border border-sub-alt/60 bg-sub-alt/20 p-4">
          <span class="text-xs font-bold tracking-wider text-main uppercase">
            Visual Feedback & Pacing
          </span>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Dynamic Lookahead Lighting */}
            <label class="flex cursor-pointer items-center justify-between rounded-lg border border-sub-alt/40 bg-sub-alt/10 p-3">
              <div class="flex flex-col pr-2">
                <span class="font-bold text-text">Lookahead Lighting</span>
                <span class="text-[11px] text-sub">
                  Illuminates upcoming 2-3 word chunks to train visual
                  pre-parsing.
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
          </div>

          {/* Trace Mode */}
          <div class="flex items-center justify-between border-t border-sub-alt/30 pt-3">
            <span class="text-xs font-bold text-text">
              Keyboard Trace Arcs:
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

        {/* Section 5: Reset History & Mistakes */}
        <div class="border-rose-500/30 bg-rose-500/10 flex flex-col gap-3 rounded-xl border p-4">
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-rose-400 font-bold">
                Reset Mistakes & Calibration
              </span>
              <span class="text-xs text-sub">
                Clear all recorded mistake counts and recalibrate to clean
                state.
              </span>
            </div>

            <Button
              variant="button"
              class="border-rose-500/50 bg-rose-500/20 text-rose-400 hover:bg-rose-500/40"
              text={showConfirmReset() ? "Confirm Reset?" : "Reset History"}
              fa={{ icon: "fa-trash-alt" }}
              onClick={() => {
                if (showConfirmReset()) {
                  setRepeatedMistakes({});
                  setTransitionRatings({});
                  localStorage.removeItem("eepytype_kinetic_state_v3");
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
