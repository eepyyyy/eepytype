import {
  createEffect,
  createSignal,
  For,
  JSXElement,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

import {
  depressedKeys,
  focusedKey,
  keyCalibrationMap,
  keybrSettings,
  lastLessonHeatmap,
  recentTransitions,
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
  let containerRef: HTMLDivElement | null = null;
  const keyElementRefs = new Map<string, HTMLElement>();

  const [keyCenters, setKeyCenters] = createSignal<
    Record<string, { x: number; y: number }>
  >({});

  // Recalculate key center coordinates relative to container
  const updateKeyPositions = () => {
    if (containerRef === null) return;
    const cRect = containerRef.getBoundingClientRect();
    const map: Record<string, { x: number; y: number }> = {};

    for (const [keyId, el] of keyElementRefs.entries()) {
      if (el !== undefined && el !== null) {
        const kRect = el.getBoundingClientRect();
        map[keyId] = {
          x: kRect.left - cRect.left + kRect.width / 2,
          y: kRect.top - cRect.top + kRect.height / 2,
        };
      }
    }
    setKeyCenters(map);
  };

  onMount(() => {
    updateKeyPositions();
    window.addEventListener("resize", updateKeyPositions);

    let ro: ResizeObserver | undefined;
    if (containerRef !== null && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => updateKeyPositions());
      ro.observe(containerRef);
    }

    onCleanup(() => {
      window.removeEventListener("resize", updateKeyPositions);
      ro?.disconnect();
    });
  });

  createEffect(() => {
    focusedKey();
    keyCalibrationMap();
    setTimeout(updateKeyPositions, 50);
  });

  const renderedArcs = () => {
    const mode = keybrSettings().traceMode ?? "all";
    if (mode === "off") return [];

    const transitions = recentTransitions();
    const centers = keyCenters();
    const focus = focusedKey().toLowerCase();

    const filtered = transitions.filter((t) => {
      if (mode === "errors") return t.error;
      if (mode === "focus") {
        return (
          t.fromKey.toLowerCase() === focus || t.toKey.toLowerCase() === focus
        );
      }
      return true;
    });

    const arcs = [];
    for (let idx = 0; idx < filtered.length; idx++) {
      const t = filtered[idx];
      if (!t) continue;
      const p1 = centers[t.fromKey.toLowerCase()];
      const p2 = centers[t.toKey.toLowerCase()];
      if (!p1 || !p2) continue;

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      const curvature = Math.min(45, Math.max(16, dist * 0.25));
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      const nx = -dy / dist;
      const ny = dx / dist;

      const sign = ny < 0 ? -1 : 1;
      const cx = midX + nx * curvature * sign;
      const cy = midY + ny * curvature * sign - 6;

      const isRecent = idx >= filtered.length - 4;
      const opacity = isRecent ? (t.error ? 0.85 : 0.65) : 0.35;
      const strokeColor = t.error ? "#f43f5e" : "#38bdf8";

      arcs.push({
        id: t.id,
        path: `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`,
        strokeColor,
        opacity,
        isError: t.error,
        isRecent,
      });
    }

    return arcs;
  };

  const focusPos = () => keyCenters()[focusedKey().toLowerCase()];

  return (
    <div
      ref={(el) => {
        containerRef = el;
      }}
      class="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-1.5 rounded-2xl border border-sub-alt/40 bg-[#1e2023]/95 p-4 font-mono shadow-2xl backdrop-blur-md select-none"
    >
      {/* Dynamic Key Motion Flow SVG Overlay */}
      <svg
        class="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="focusGlow" cx="50%" cy="50%" r="50%">
            <stop
              offset="0%"
              style={{ "stop-color": "#38bdf8", "stop-opacity": "0.6" }}
            ></stop>
            <stop
              offset="80%"
              style={{ "stop-color": "#38bdf8", "stop-opacity": "0.15" }}
            ></stop>
            <stop
              offset="100%"
              style={{ "stop-color": "#38bdf8", "stop-opacity": "0" }}
            ></stop>
          </radialGradient>

          {/* Arrowhead markers */}
          <marker
            id="arrow-cyan"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#38bdf8" opacity="0.8"></path>
          </marker>
          <marker
            id="arrow-rose"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#f43f5e" opacity="0.9"></path>
          </marker>
        </defs>

        {/* Focused Key Halo Glow & Outer Rings */}
        <Show when={focusPos()}>
          {(pos) => (
            <g class="animate-pulse duration-1000">
              <circle
                cx={pos().x}
                cy={pos().y}
                r="30"
                fill="url(#focusGlow)"
              ></circle>
              <circle
                cx={pos().x}
                cy={pos().y}
                r="24"
                fill="none"
                stroke="#38bdf8"
                style={{ "stroke-width": "1.5", "stroke-dasharray": "3 3" }}
                opacity="0.8"
              ></circle>
            </g>
          )}
        </Show>

        {/* Dynamic Keystroke Transition Arcs with Arrowheads */}
        <For each={renderedArcs()}>
          {(arc) => (
            <path
              d={arc.path}
              fill="none"
              stroke={arc.strokeColor}
              style={{
                "stroke-width": arc.isRecent ? "2.0" : "1.4",
                "stroke-dasharray": arc.isError ? "4 2" : "none",
                "marker-end": arc.isError
                  ? "url(#arrow-rose)"
                  : "url(#arrow-cyan)",
              }}
              opacity={arc.opacity}
              class="transition-all duration-300"
            ></path>
          )}
        </For>
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
                const hitCount = () => keyStats()?.totalHits ?? 0;
                const totalMisses = () => keyStats()?.totalMisses ?? 0;
                const isIncluded = () => keyStats()?.isIncluded ?? false;
                const hasWidth = keyDef.width !== undefined && keyDef.width > 0;
                const hasTopLabel =
                  keyDef.topLabel !== undefined && keyDef.topLabel !== "";

                return (
                  <div
                    ref={(el) => {
                      if (el !== undefined && el !== null) {
                        keyElementRefs.set(lowerId, el);
                      }
                    }}
                    class={cn(
                      "relative flex h-9.5 items-center justify-center rounded-sm text-[11px] font-semibold shadow-xs transition-all duration-75",
                      keyDef.colorClass,
                      hasWidth ? "grow" : "w-9.5",
                      keyDef.id.length === 1 &&
                        keyDef.id !== " " &&
                        !isIncluded() &&
                        "border-white/5 text-white/30 after:border-white/20 border bg-[#25282c] opacity-40 brightness-65 grayscale after:absolute after:inset-0 after:rotate-45 after:border-t-[1.5px]",
                      keyStats()?.isForced &&
                        "decoration-white font-black underline decoration-2",
                      isFocused() &&
                        "ring-amber-400 z-20 shadow-[0_0_12px_rgba(251,191,36,0.4)] ring-2 ring-offset-1 ring-offset-[#1e2023] brightness-125",
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
                        "z-10",
                        hasTopLabel ? "absolute bottom-0.5 left-1" : "",
                      )}
                    >
                      {keyDef.label}
                    </span>

                    {/* Homing bump */}
                    <Show when={keyDef.hasBump === true}>
                      <div class="bg-white/70 absolute bottom-1 h-0.5 w-2 rounded-full"></div>
                    </Show>

                    {/* Keybr Split-Circle / Wedge Heatmap Indicator (Hits vs Misses) */}
                    <Show when={isIncluded()}>
                      <div class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                        <svg viewBox="0 0 32 32" class="h-6.5 w-6.5 opacity-60">
                          {/* Top Semi-Circle / Arc: Hit density */}
                          <path
                            d="M 4 16 A 12 12 0 0 1 28 16 Z"
                            fill={
                              hitCount() > 0
                                ? "rgba(56, 189, 248, 0.45)"
                                : "rgba(255, 255, 255, 0.15)"
                            }
                            stroke="rgba(255, 255, 255, 0.3)"
                            style={{ "stroke-width": "0.75" }}
                          ></path>

                          {/* Bottom Semi-Circle / Arc: Error / Miss density */}
                          <path
                            d="M 4 16 A 12 12 0 0 0 28 16 Z"
                            fill={
                              totalMisses() > 0 || missCount() > 0
                                ? "rgba(244, 63, 94, 0.65)"
                                : "rgba(255, 255, 255, 0.1)"
                            }
                            stroke="rgba(255, 255, 255, 0.3)"
                            style={{ "stroke-width": "0.75" }}
                          ></path>
                        </svg>
                      </div>
                    </Show>

                    {/* Miss error badge */}
                    <Show when={missCount() > 0}>
                      <span class="bg-rose-600 text-white absolute -top-1 -right-1 z-20 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-extrabold shadow-md">
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
