import { For, JSXElement, Show } from "solid-js";

import {
  getMistakeRemediationLetters,
  kineticSettings,
  repeatedMistakes,
  sessionHistory,
  startNewSession,
} from "../../states/kinetic";
import { AnimatedModal } from "../common/AnimatedModal";
import { Button } from "../common/Button";
import { Fa } from "../common/Fa";

export function KineticSessionReportModal(): JSXElement {
  const history = () => sessionHistory();
  const settings = () => kineticSettings();
  const mistakes = () => repeatedMistakes();
  const remediationLetters = () => getMistakeRemediationLetters();

  const avgWpm = () => {
    const list = history();
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, t) => acc + t.wpm, 0);
    return Math.round(sum / list.length);
  };

  const avgAcc = () => {
    const list = history();
    if (list.length === 0) return 100;
    const sum = list.reduce((acc, t) => acc + t.accuracy, 0);
    return Math.round(sum / list.length);
  };

  const totalErrors = () => {
    return history().reduce((acc, t) => acc + t.totalMisses, 0);
  };

  const sortedMistakes = () => {
    return Object.entries(mistakes())
      .filter(([char, count]) => char.length === 1 && count > 0 && char !== " ")
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  };

  return (
    <AnimatedModal
      id="KineticSessionReportModal"
      title="Adaptive Training Session Report"
      modalClass="max-w-3xl"
    >
      <div class="flex flex-col gap-6 font-mono text-text">
        {/* Session Milestone Header Banner */}
        <div class="flex flex-col gap-3 rounded-2xl border border-main/50 bg-main/10 p-5 shadow-xl backdrop-blur-md">
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-2 text-sm font-bold text-main uppercase">
              <Fa icon="fa-trophy" class="text-amber-400" />
              {settings().sessionLength > 0
                ? `${settings().sessionLength}-Test Session Complete`
                : "Training Session Summary"}
            </span>
            <span class="rounded-lg bg-main/20 px-2.5 py-1 text-xs font-black text-main">
              {settings().corpus.toUpperCase()}
            </span>
          </div>

          <div class="grid grid-cols-3 gap-3 pt-2">
            <div class="flex flex-col items-center rounded-xl bg-[#1e2023]/80 p-3">
              <span class="text-[10px] text-sub uppercase">Average Speed</span>
              <span class="text-2xl font-black text-text">
                {avgWpm()} <span class="text-xs font-normal text-sub">WPM</span>
              </span>
            </div>

            <div class="flex flex-col items-center rounded-xl bg-[#1e2023]/80 p-3">
              <span class="text-[10px] text-sub uppercase">Accuracy</span>
              <span class="text-emerald-400 text-2xl font-black">
                {avgAcc()}%
              </span>
            </div>

            <div class="flex flex-col items-center rounded-xl bg-[#1e2023]/80 p-3">
              <span class="text-[10px] text-sub uppercase">Total Mistakes</span>
              <span class="text-rose-400 text-2xl font-black">
                {totalErrors()}
              </span>
            </div>
          </div>
        </div>

        {/* Mistake Diagnosis & Prescription */}
        <div class="flex flex-col gap-3 rounded-xl border border-sub-alt/50 bg-[#1e2023]/90 p-4 shadow-lg">
          <span class="flex items-center gap-2 text-xs font-bold text-text uppercase">
            <Fa icon="fa-stethoscope" class="text-rose-400" />
            Mistake Diagnostics & Auto-Remediation
          </span>

          <Show
            when={sortedMistakes().length > 0}
            fallback={
              <p class="text-emerald-400 text-xs">
                Flawless session! No repeated mistakes detected across test
                sets.
              </p>
            }
          >
            <div class="flex flex-col gap-2.5">
              <span class="text-xs text-sub">
                Top repeated error characters during this session:
              </span>
              <div class="flex flex-wrap gap-2">
                <For each={sortedMistakes()}>
                  {([char, count]) => (
                    <div class="border-rose-500/40 bg-rose-500/20 flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs">
                      <span class="text-rose-300 font-extrabold">
                        {char.toUpperCase()}
                      </span>
                      <span class="text-rose-400/80 text-[10px]">
                        ({count} {count === 1 ? "miss" : "misses"})
                      </span>
                    </div>
                  )}
                </For>
              </div>

              <div class="border-sky-500/30 bg-sky-500/10 text-sky-300 mt-2 rounded-lg border p-3 text-xs">
                <span class="font-bold">Automated Next Step: </span>
                Next training set will automatically synthesize vocabulary from{" "}
                <span class="font-bold text-main">
                  {settings().corpus.toUpperCase()}
                </span>{" "}
                heavily targeting letters [
                <span class="text-white font-black">
                  {remediationLetters().join(", ").toUpperCase()}
                </span>
                ] to permanently rewire muscle memory.
              </div>
            </div>
          </Show>
        </div>

        {/* Per-Test Breakdown Table */}
        <Show when={history().length > 0}>
          <div class="flex flex-col gap-2 rounded-xl border border-sub-alt/50 bg-[#1e2023]/90 p-4 shadow-lg">
            <span class="text-xs font-bold text-text uppercase">
              Session Tests Breakdown
            </span>
            <div class="max-h-40 overflow-y-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-sub-alt/30 text-[10px] text-sub uppercase">
                    <th class="py-1">Test #</th>
                    <th class="py-1">Speed</th>
                    <th class="py-1">Accuracy</th>
                    <th class="py-1">Misses</th>
                    <th class="py-1">Motor IKI</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={history()}>
                    {(t) => (
                      <tr class="border-b border-sub-alt/20 hover:bg-sub-alt/10">
                        <td class="py-1.5 font-bold text-sub">
                          #{t.testNumber}
                        </td>
                        <td class="py-1.5 font-extrabold text-text">
                          {t.wpm} WPM
                        </td>
                        <td class="text-emerald-400 py-1.5 font-bold">
                          {t.accuracy}%
                        </td>
                        <td class="text-rose-400 py-1.5 font-bold">
                          {t.totalMisses}
                        </td>
                        <td class="py-1.5 text-sub">{t.meanIkiMs}ms</td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </div>
        </Show>

        {/* Next Session Action Buttons */}
        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-sub-alt/30 pt-4">
          <div class="flex gap-2">
            <Button
              variant="button"
              class="border-main/50 bg-main font-bold text-bg hover:brightness-110"
              text="Start Next 5-Test Set"
              fa={{ icon: "fa-play" }}
              onClick={() => startNewSession(5)}
            />
            <Button
              variant="button"
              class="border-sub-alt/50 bg-sub-alt/20 text-text hover:bg-sub-alt/40"
              text="Start 10-Test Set"
              onClick={() => startNewSession(10)}
            />
          </div>

          <Button
            variant="button"
            class="border-sub-alt/30 bg-transparent text-sub hover:text-text"
            text="Continuous Practice"
            onClick={() => startNewSession(0)}
          />
        </div>
      </div>
    </AnimatedModal>
  );
}
