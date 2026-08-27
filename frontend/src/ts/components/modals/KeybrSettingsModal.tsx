import { createSignal, JSXElement } from "solid-js";

import {
  keybrSettings,
  resetAllKeybrProgress,
  updateKeybrSettings,
} from "../../states/keybr";
import { AnimatedModal } from "../common/AnimatedModal";
import { Button } from "../common/Button";

export function KeybrSettingsModal(): JSXElement {
  const [showConfirmReset, setShowConfirmReset] = createSignal(false);

  const settings = () => keybrSettings();

  const handleTargetWpmChange = (wpm: number) => {
    const clamped = Math.max(15, Math.min(150, wpm));
    updateKeybrSettings({ targetWpm: clamped });
  };

  const handleDailyGoalChange = (minutes: number) => {
    const clamped = Math.max(5, Math.min(180, minutes));
    updateKeybrSettings({ dailyGoalMinutes: clamped });
  };

  return (
    <AnimatedModal
      id="KeybrSettingsModal"
      title="Keybr Practice Settings"
      modalClass="max-w-xl"
    >
      <div class="flex flex-col gap-6 font-mono text-sm text-text">
        <p class="text-xs text-sub">
          Configure the phonetic learning algorithm, target speed calibration,
          and progression rules.
        </p>

        {/* 1. Target Speed */}
        <div class="flex flex-col gap-2 rounded-xl border border-sub-alt/60 bg-sub-alt/20 p-4">
          <div class="flex items-center justify-between">
            <span class="font-bold text-text">Target Typing Speed</span>
            <span class="font-bold text-main">{settings().targetWpm} WPM</span>
          </div>
          <p class="text-xs text-sub">
            The minimum speed required on all active keys to unlock new letters.
          </p>
          <input
            type="range"
            min="15"
            max="120"
            step="5"
            value={settings().targetWpm}
            onInput={(e) =>
              handleTargetWpmChange(Number(e.currentTarget.value))
            }
            class="w-full accent-main"
          />
        </div>

        {/* 2. Auto-Unlock & Progression */}
        <div class="flex items-center justify-between rounded-xl border border-sub-alt/60 bg-sub-alt/20 p-4">
          <div class="flex flex-col gap-1 pr-4">
            <span class="font-bold text-text">Automatic Letter Unlocking</span>
            <span class="text-xs text-sub">
              Automatically introduce the next letter when all current keys
              reach 100% confidence.
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings().autoUnlock}
            onChange={(e) =>
              updateKeybrSettings({ autoUnlock: e.currentTarget.checked })
            }
            class="h-5 w-5 rounded-md accent-main"
          />
        </div>

        {/* 3. Capital Letters & Punctuation */}
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="flex items-center justify-between rounded-xl border border-sub-alt/60 bg-sub-alt/20 p-4">
            <div class="flex flex-col">
              <span class="font-bold text-text">Capital Letters</span>
              <span class="text-xs text-sub">Include uppercase words</span>
            </div>
            <input
              type="checkbox"
              checked={settings().withCapitals}
              onChange={(e) =>
                updateKeybrSettings({ withCapitals: e.currentTarget.checked })
              }
              class="h-5 w-5 rounded-md accent-main"
            />
          </div>

          <div class="flex items-center justify-between rounded-xl border border-sub-alt/60 bg-sub-alt/20 p-4">
            <div class="flex flex-col">
              <span class="font-bold text-text">Punctuation</span>
              <span class="text-xs text-sub">Include marks (.,!?-)</span>
            </div>
            <input
              type="checkbox"
              checked={settings().withPunctuation}
              onChange={(e) =>
                updateKeybrSettings({
                  withPunctuation: e.currentTarget.checked,
                })
              }
              class="h-5 w-5 rounded-md accent-main"
            />
          </div>
        </div>

        {/* 4. Daily Practice Goal */}
        <div class="flex flex-col gap-2 rounded-xl border border-sub-alt/60 bg-sub-alt/20 p-4">
          <div class="flex items-center justify-between">
            <span class="font-bold text-text">Daily Practice Goal</span>
            <span class="font-bold text-main">
              {settings().dailyGoalMinutes} Minutes
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="120"
            step="5"
            value={settings().dailyGoalMinutes}
            onInput={(e) =>
              handleDailyGoalChange(Number(e.currentTarget.value))
            }
            class="w-full accent-main"
          />
        </div>

        {/* 5. Reset All Progress */}
        <div class="border-rose-500/30 bg-rose-500/10 flex flex-col gap-3 rounded-xl border p-4">
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-rose-400 font-bold">
                Reset Calibration Data
              </span>
              <span class="text-xs text-sub">
                Wipe all character calibration, speeds, and return to first 6
                letters.
              </span>
            </div>

            <Button
              variant="button"
              class="border-rose-500/50 bg-rose-500/20 text-rose-400 hover:bg-rose-500/40"
              text={showConfirmReset() ? "Confirm Reset?" : "Reset"}
              fa={{ icon: "fa-trash-alt" }}
              onClick={() => {
                if (showConfirmReset()) {
                  resetAllKeybrProgress();
                  setShowConfirmReset(false);
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
