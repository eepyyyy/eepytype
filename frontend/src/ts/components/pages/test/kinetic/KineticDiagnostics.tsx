import { createSignal, For, JSXElement, Show } from "solid-js";

import {
  KineticCorpus,
  kineticDiagnostics,
  kineticSettings,
  sessionCurrentTestIndex,
  startKineticDrill,
  startNewSession,
  updateKineticSettings,
} from "../../../../states/kinetic";
import { showModal } from "../../../../states/modals";
import { cn } from "../../../../utils/cn";
import { Fa } from "../../../common/Fa";

export function KineticDiagnostics(): JSXElement {
  const [showLanguageDropdown, setShowLanguageDropdown] = createSignal(false);
  const diag = () => kineticDiagnostics();
  const settings = () => kineticSettings();
  const currentTest = () => sessionCurrentTestIndex();

  const motorSpeedWpm = () =>
    diag().meanIkiMs > 0 ? Math.round(12000 / diag().meanIkiMs) : 0;

  const corpusList: { id: KineticCorpus; label: string }[] = [
    { id: "english", label: "English 200" },
    { id: "english_1k", label: "English 1k" },
    { id: "english_5k", label: "English 5k" },
    { id: "english_10k", label: "English 10k" },
    { id: "english_25k", label: "English 25k" },
    { id: "custom", label: "Custom Code / Text" },
  ];

  return (
    <div class="mx-auto flex w-full flex-col gap-2 font-mono text-xs select-none">
      {/* Top Diagnostics & Controls Toolbar */}
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-sub-alt/30 pb-2">
        {/* Left: Telemetry & Language Dropdown */}
        <div class="flex flex-wrap items-center gap-3 sm:gap-5">
          {/* Language Selector Dropdown */}
          <div class="relative">
            <button
              type="button"
              onClick={() => setShowLanguageDropdown((prev) => !prev)}
              class="flex items-center gap-1.5 rounded-lg border border-sub-alt/50 bg-sub-alt/20 px-2.5 py-1 text-xs font-bold text-main transition-colors hover:border-main/60 hover:bg-sub-alt/40"
            >
              <Fa icon="fa-globe" class="text-sub" />
              <span>{settings().corpus.replace("_", " ").toUpperCase()}</span>
              <Fa icon="fa-chevron-down" class="text-[10px] text-sub" />
            </button>

            <Show when={showLanguageDropdown()}>
              <div class="absolute top-full left-0 z-50 mt-1 flex min-w-44 flex-col gap-0.5 rounded-xl border border-sub-alt/60 bg-[#1e2023] p-1.5 shadow-2xl backdrop-blur-md">
                <For each={corpusList}>
                  {(item) => (
                    <button
                      type="button"
                      onClick={() => {
                        updateKineticSettings({ corpus: item.id });
                        setShowLanguageDropdown(false);
                        void startKineticDrill();
                      }}
                      class={cn(
                        "rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-colors",
                        settings().corpus === item.id
                          ? "bg-main font-bold text-bg"
                          : "text-sub hover:bg-sub-alt/30 hover:text-text",
                      )}
                    >
                      {item.label}
                    </button>
                  )}
                </For>
              </div>
            </Show>
          </div>

          {/* Cognitive Hesitation (IKL) */}
          <div class="flex items-center gap-1.5 text-sub">
            <span class="text-sub/70">Cognitive (IKL):</span>
            <span class="font-bold text-text">{diag().meanIklMs}ms</span>
          </div>

          {/* Motor Execution (IKI) */}
          <div class="flex items-center gap-1.5 text-sub">
            <span class="text-sub/70">Motor (IKI):</span>
            <span class="font-bold text-text">{diag().meanIkiMs}ms</span>
            <span class="text-emerald-400 text-[11px] font-bold">
              ({motorSpeedWpm()} WPM)
            </span>
          </div>

          {/* Session Progress Badge */}
          <div class="flex items-center gap-1 rounded bg-sub-alt/30 px-2 py-0.5 text-[11px] font-bold text-text">
            <span class="text-sub">Set:</span>
            <span class="text-main">
              {settings().sessionLength > 0
                ? `${currentTest()}/${settings().sessionLength}`
                : "Continuous"}
            </span>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div class="flex items-center gap-1 text-sub">
          <button
            type="button"
            title="Restart Test (Esc)"
            onClick={() => void startKineticDrill()}
            class="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-sub-alt/40 hover:text-text"
          >
            <Fa icon="fa-undo" />
          </button>

          <button
            type="button"
            title="New Session"
            onClick={() => startNewSession()}
            class="flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-bold text-sub transition-colors hover:bg-sub-alt/40 hover:text-text"
          >
            <Fa icon="fa-play" class="text-[10px]" />
            <span>New Set</span>
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
    </div>
  );
}
