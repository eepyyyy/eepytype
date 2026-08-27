import { JSXElement } from "solid-js";

import { setConfig } from "../../../../config/setters";
import { restartTestEvent } from "../../../../events/test";
import {
  keybrSettings,
  resetKeybrLesson,
  setKeybrMode,
  skipKeybrLesson,
  updateKeybrSettings,
} from "../../../../states/keybr";
import { showModal } from "../../../../states/modals";
import { Fa } from "../../../common/Fa";

export function KeybrControls(): JSXElement {
  const currentView = () => keybrSettings().viewMode;

  const cycleView = () => {
    const next =
      currentView() === "normal"
        ? "compact"
        : currentView() === "compact"
          ? "bare"
          : "normal";
    updateKeybrSettings({ viewMode: next });
  };

  const handleExit = () => {
    setKeybrMode(false);
    setConfig("mode", "time");
    restartTestEvent.dispatch();
  };

  return (
    <div class="mx-auto flex flex-wrap items-center justify-center gap-2 pt-2 font-mono text-xs select-none">
      {/* View Switcher */}
      <button
        type="button"
        onClick={cycleView}
        class="flex items-center gap-1.5 rounded-lg border border-sub-alt/60 bg-sub-alt/20 px-3 py-1.5 text-sub transition-all hover:bg-sub-alt/40 hover:text-text"
        title="Toggle Layout View (Normal / Compact / Bare)"
      >
        <Fa icon="fa-desktop" class="text-[11px]" />
        <span class="capitalize">View: {currentView()}</span>
      </button>

      {/* Reset Lesson */}
      <button
        type="button"
        onClick={resetKeybrLesson}
        class="flex items-center gap-1.5 rounded-lg border border-sub-alt/60 bg-sub-alt/20 px-3 py-1.5 text-sub transition-all hover:bg-sub-alt/40 hover:text-text active:scale-95"
        title="Restart Current Drill (Esc)"
      >
        <Fa icon="fa-redo" class="text-[11px]" />
        <span>Restart</span>
      </button>

      {/* Skip Lesson */}
      <button
        type="button"
        onClick={skipKeybrLesson}
        class="flex items-center gap-1.5 rounded-lg border border-sub-alt/60 bg-sub-alt/20 px-3 py-1.5 text-sub transition-all hover:bg-sub-alt/40 hover:text-text active:scale-95"
        title="Skip to Next Drill (Ctrl+Right)"
      >
        <Fa icon="fa-forward" class="text-[11px]" />
        <span>Skip</span>
      </button>

      {/* Settings Modal */}
      <button
        type="button"
        onClick={() => showModal("KeybrSettingsModal")}
        class="flex items-center gap-1.5 rounded-lg border border-sub-alt/60 bg-sub-alt/20 px-3 py-1.5 text-sub transition-all hover:bg-sub-alt/40 hover:text-text"
        title="Keybr Learning Settings"
      >
        <Fa icon="fa-cog" class="text-[11px]" />
        <span>Settings</span>
      </button>

      {/* Exit Keybr Mode */}
      <button
        type="button"
        onClick={handleExit}
        class="border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-all active:scale-95"
        title="Exit Keybr Practice"
      >
        <Fa icon="fa-times" class="text-[11px]" />
        <span>Exit Keybr</span>
      </button>
    </div>
  );
}
