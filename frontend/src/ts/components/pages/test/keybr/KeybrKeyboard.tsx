import { For, JSXElement, Show } from "solid-js";

import {
  depressedKeys,
  focusedKey,
  keyCalibrationMap,
  lastLessonHeatmap,
} from "../../../../states/keybr";
import { cn } from "../../../../utils/cn";

type KeyDef = {
  id: string;
  topLabel?: string;
  label: string;
  width?: number; // relative width, default 1
  colorClass: string;
  hasBump?: boolean;
};

// Exact color palette matching Keybr's finger zones & keyboard layout
const KEY_ROWS: KeyDef[][] = [
  // Row 1
  [
    {
      id: "`",
      topLabel: "~",
      label: "`",
      colorClass: "bg-[#5b8764] text-white/90",
    },
    {
      id: "1",
      topLabel: "!",
      label: "1",
      colorClass: "bg-[#5b8764] text-white/90",
    },
    {
      id: "2",
      topLabel: "@",
      label: "2",
      colorClass: "bg-[#bfa143] text-white/90",
    },
    {
      id: "3",
      topLabel: "#",
      label: "3",
      colorClass: "bg-[#cf8e3c] text-white/90",
    },
    {
      id: "4",
      topLabel: "$",
      label: "4",
      colorClass: "bg-[#457b77] text-white/90",
    },
    {
      id: "5",
      topLabel: "%",
      label: "5",
      colorClass: "bg-[#457b77] text-white/90",
    },
    {
      id: "6",
      topLabel: "^",
      label: "6",
      colorClass: "bg-[#555d78] text-white/90",
    },
    {
      id: "7",
      topLabel: "&",
      label: "7",
      colorClass: "bg-[#555d78] text-white/90",
    },
    {
      id: "8",
      topLabel: "*",
      label: "8",
      colorClass: "bg-[#cf8e3c] text-white/90",
    },
    {
      id: "9",
      topLabel: "(",
      label: "9",
      colorClass: "bg-[#9db852] text-white/90",
    },
    {
      id: "0",
      topLabel: ")",
      label: "0",
      colorClass: "bg-[#9db852] text-white/90",
    },
    {
      id: "-",
      topLabel: "_",
      label: "-",
      colorClass: "bg-[#5b8764] text-white/90",
    },
    {
      id: "=",
      topLabel: "+",
      label: "=",
      colorClass: "bg-[#5b8764] text-white/90",
    },
    {
      id: "Backspace",
      label: "Backspace",
      width: 2.0,
      colorClass: "bg-[#5b8764] text-white/90 text-[10px]",
    },
  ],
  // Row 2
  [
    {
      id: "Tab",
      label: "Tab",
      width: 1.5,
      colorClass: "bg-[#5b8764] text-white/90 text-[10px]",
    },
    { id: "q", label: "Q", colorClass: "bg-[#5b8764] text-white/90" },
    { id: "w", label: "W", colorClass: "bg-[#bfa143] text-white/90" },
    { id: "e", label: "E", colorClass: "bg-[#cf8e3c] text-white/90" },
    { id: "r", label: "R", colorClass: "bg-[#457b77] text-white/90" },
    { id: "t", label: "T", colorClass: "bg-[#457b77] text-white/90" },
    { id: "y", label: "Y", colorClass: "bg-[#555d78] text-white/90" },
    { id: "u", label: "U", colorClass: "bg-[#555d78] text-white/90" },
    { id: "i", label: "I", colorClass: "bg-[#cf8e3c] text-white/90" },
    { id: "o", label: "O", colorClass: "bg-[#9db852] text-white/90" },
    { id: "p", label: "P", colorClass: "bg-[#5b8764] text-white/90" },
    {
      id: "[",
      topLabel: "{",
      label: "[",
      colorClass: "bg-[#5b8764] text-white/90",
    },
    {
      id: "]",
      topLabel: "}",
      label: "]",
      colorClass: "bg-[#5b8764] text-white/90",
    },
    {
      id: "\\",
      topLabel: "|",
      label: "\\",
      width: 1.5,
      colorClass: "bg-[#5b8764] text-white/90",
    },
  ],
  // Row 3
  [
    {
      id: "CapsLock",
      label: "Caps Lock",
      width: 1.8,
      colorClass: "bg-[#5b8764] text-white/90 text-[10px]",
    },
    { id: "a", label: "A", colorClass: "bg-[#5b8764] text-white/90" },
    { id: "s", label: "S", colorClass: "bg-[#bfa143] text-white/90" },
    { id: "d", label: "D", colorClass: "bg-[#cf8e3c] text-white/90" },
    {
      id: "f",
      label: "F",
      hasBump: true,
      colorClass: "bg-[#457b77] text-white/90",
    },
    { id: "g", label: "G", colorClass: "bg-[#457b77] text-white/90" },
    { id: "h", label: "H", colorClass: "bg-[#555d78] text-white/90" },
    {
      id: "j",
      label: "J",
      hasBump: true,
      colorClass: "bg-[#555d78] text-white/90",
    },
    { id: "k", label: "K", colorClass: "bg-[#cf8e3c] text-white/90" },
    { id: "l", label: "L", colorClass: "bg-[#9db852] text-white/90" },
    {
      id: ";",
      topLabel: ":",
      label: ";",
      colorClass: "bg-[#5b8764] text-white/90",
    },
    {
      id: "'",
      topLabel: '"',
      label: "'",
      colorClass: "bg-[#5b8764] text-white/90",
    },
    {
      id: "Enter",
      label: "Enter",
      width: 2.2,
      colorClass: "bg-[#5b8764] text-white/90 text-[10px]",
    },
  ],
  // Row 4
  [
    {
      id: "ShiftLeft",
      label: "Shift",
      width: 2.3,
      colorClass: "bg-[#5b8764] text-white/90 text-[10px]",
    },
    { id: "z", label: "Z", colorClass: "bg-[#5b8764] text-white/90" },
    { id: "x", label: "X", colorClass: "bg-[#bfa143] text-white/90" },
    { id: "c", label: "C", colorClass: "bg-[#cf8e3c] text-white/90" },
    { id: "v", label: "V", colorClass: "bg-[#457b77] text-white/90" },
    { id: "b", label: "B", colorClass: "bg-[#457b77] text-white/90" },
    { id: "n", label: "N", colorClass: "bg-[#555d78] text-white/90" },
    { id: "m", label: "M", colorClass: "bg-[#555d78] text-white/90" },
    {
      id: ",",
      topLabel: "<",
      label: ",",
      colorClass: "bg-[#cf8e3c] text-white/90",
    },
    {
      id: ".",
      topLabel: ">",
      label: ".",
      colorClass: "bg-[#9db852] text-white/90",
    },
    {
      id: "/",
      topLabel: "?",
      label: "/",
      colorClass: "bg-[#5b8764] text-white/90",
    },
    {
      id: "ShiftRight",
      label: "Shift",
      width: 2.7,
      colorClass: "bg-[#5b8764] text-white/90 text-[10px]",
    },
  ],
  // Row 5
  [
    {
      id: "ControlLeft",
      label: "Ctrl",
      width: 1.5,
      colorClass: "bg-[#5b8764] text-white/90 text-[10px]",
    },
    {
      id: "AltLeft",
      label: "Alt",
      width: 1.5,
      colorClass: "bg-[#5b8764] text-white/90 text-[10px]",
    },
    {
      id: " ",
      label: "",
      width: 6.8,
      colorClass: "bg-[#8b4545] text-white/90",
    }, // spacebar terracotta
    {
      id: "AltRight",
      label: "Alt",
      width: 1.5,
      colorClass: "bg-[#5b8764] text-white/90 text-[10px]",
    },
    {
      id: "ControlRight",
      label: "Ctrl",
      width: 1.5,
      colorClass: "bg-[#5b8764] text-white/90 text-[10px]",
    },
  ],
];

export function KeybrKeyboard(): JSXElement {
  return (
    <div class="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-1.5 rounded-2xl border border-sub-alt/40 bg-[#1e2023]/95 p-4 font-mono shadow-2xl backdrop-blur-md select-none">
      {/* Dynamic Key Motion Flow SVG Overlay */}
      <svg
        class="pointer-events-none absolute inset-0 h-full w-full opacity-40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="heatGlow" cx="50%" cy="50%" r="50%">
            <stop
              offset="0%"
              style={{ "stop-color": "#38bdf8", "stop-opacity": "0.6" }}
            ></stop>
            <stop
              offset="100%"
              style={{ "stop-color": "#38bdf8", "stop-opacity": "0" }}
            ></stop>
          </radialGradient>
        </defs>
        {/* Heatmap transition flow arcs connecting active home row and vowels */}
        <path
          d="M 230 75 Q 310 50 350 75 T 460 75"
          fill="none"
          stroke="#38bdf8"
          style={{ "stroke-width": "1.5", "stroke-dasharray": "3 3" }}
        ></path>
        <path
          d="M 220 110 Q 300 120 400 110"
          fill="none"
          stroke="#818cf8"
          style={{ "stroke-width": "1.5", "stroke-dasharray": "4 2" }}
        ></path>
        <circle cx="310" cy="75" r="22" fill="url(#heatGlow)"></circle>
        <circle cx="360" cy="75" r="28" fill="url(#heatGlow)"></circle>
      </svg>

      <For each={KEY_ROWS}>
        {(row) => (
          <div class="flex w-full justify-center gap-1">
            <For each={row}>
              {(keyDef) => {
                const lowerId = keyDef.id.toLowerCase();
                const keyStats = () => keyCalibrationMap()[lowerId];
                const isFocused = () => lowerId === focusedKey().toLowerCase();
                const isDepressed = () =>
                  depressedKeys().includes(lowerId) ||
                  depressedKeys().includes(keyDef.id) ||
                  (keyDef.id === " " && depressedKeys().includes("space"));

                const missCount = () =>
                  lastLessonHeatmap().misses[lowerId] ?? 0;
                const hasWidth = keyDef.width !== undefined && keyDef.width > 0;
                const hasTopLabel =
                  keyDef.topLabel !== undefined && keyDef.topLabel !== "";

                return (
                  <div
                    class={cn(
                      "relative flex h-9.5 items-center justify-center rounded-sm text-[11px] font-semibold shadow-xs transition-all duration-75",
                      keyDef.colorClass,
                      hasWidth ? "grow" : "w-9.5",
                      isFocused() &&
                        "ring-white z-10 ring-2 ring-offset-1 ring-offset-[#1e2023] brightness-110",
                      isDepressed() &&
                        "translate-y-0.5 scale-95 shadow-inner brightness-140",
                    )}
                    style={{
                      "flex-grow": keyDef.width ?? 1,
                      "max-width":
                        hasWidth && keyDef.width !== undefined
                          ? `${keyDef.width * 2.6}rem`
                          : "2.6rem",
                    }}
                  >
                    <Show when={hasTopLabel}>
                      <span class="absolute top-0.5 left-1 text-[9px] font-normal opacity-75">
                        {keyDef.topLabel}
                      </span>
                    </Show>

                    <span
                      class={cn(
                        hasTopLabel ? "absolute bottom-0.5 left-1" : "",
                      )}
                    >
                      {keyDef.label}
                    </span>

                    {/* Homing bump */}
                    <Show when={keyDef.hasBump}>
                      <div class="bg-white/70 absolute bottom-1 h-0.5 w-2 rounded-full"></div>
                    </Show>

                    {/* Hit Pie / Heat Indicator Arc */}
                    <Show when={keyStats()?.isIncluded}>
                      <div class="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
                        <div class="border-white/60 h-4 w-4 rounded-full border"></div>
                      </div>
                    </Show>

                    {/* Miss error badge */}
                    <Show when={missCount() > 0}>
                      <span class="bg-rose-600 text-white absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-extrabold shadow-md">
                        {missCount()}
                      </span>
                    </Show>
                  </div>
                );
              }}
            </For>
          </div>
        )}
      </For>
    </div>
  );
}
