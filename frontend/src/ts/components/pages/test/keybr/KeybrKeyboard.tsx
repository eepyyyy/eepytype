import {
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
      width: 1.6,
      colorClass: "bg-[#5b8764] text-white/90 text-[10px]",
    },
  ],
  // Row 2
  [
    {
      id: "Tab",
      label: "Tab",
      width: 1.4,
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
      width: 1.1,
      colorClass: "bg-[#5b8764] text-white/90",
    },
  ],
  // Row 3
  [
    {
      id: "CapsLock",
      label: "Caps Lock",
      width: 1.7,
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
      width: 1.9,
      colorClass: "bg-[#5b8764] text-white/90 text-[10px]",
    },
  ],
  // Row 4
  [
    {
      id: "ShiftLeft",
      label: "Shift",
      width: 2.2,
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
      width: 2.4,
      colorClass: "bg-[#5b8764] text-white/90 text-[10px]",
    },
  ],
  // Row 5
  [
    {
      id: "ControlLeft",
      label: "Ctrl",
      width: 1.3,
      colorClass: "bg-[#5b8764] text-white/90 text-[10px]",
    },
    {
      id: "AltLeft",
      label: "Alt",
      width: 1.2,
      colorClass: "bg-[#5b8764] text-white/90 text-[10px]",
    },
    {
      id: " ",
      label: "",
      width: 6.2,
      colorClass: "bg-[#8b4545] text-white/90",
    }, // spacebar terracotta
    {
      id: "AltRight",
      label: "Alt",
      width: 1.2,
      colorClass: "bg-[#5b8764] text-white/90 text-[10px]",
    },
    {
      id: "ControlRight",
      label: "Ctrl",
      width: 1.3,
      colorClass: "bg-[#5b8764] text-white/90 text-[10px]",
    },
  ],
];

export function KeybrKeyboard(): JSXElement {
  let containerRef: HTMLDivElement | null = null;
  const keyElementRefs = new Map<string, HTMLElement>();

  const [keyCenters, setKeyCenters] = createSignal<
    Map<string, { x: number; y: number }>
  >(new Map());

  // Recalculate key center coordinates relative to container
  const updateKeyPositions = () => {
    if (containerRef === null) return;
    const cRect = containerRef.getBoundingClientRect();
    const map = new Map<string, { x: number; y: number }>();

    for (const [keyId, el] of keyElementRefs.entries()) {
      if (el !== undefined && el !== null) {
        const kRect = el.getBoundingClientRect();
        map.set(keyId, {
          x: kRect.left - cRect.left + kRect.width / 2,
          y: kRect.top - cRect.top + kRect.height / 2,
        });
      }
    }
    const spacePos = map.get(" ");
    if (spacePos !== undefined) {
      map.set("space", spacePos);
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

  const renderedArcs = () => {
    const mode = keybrSettings().traceMode ?? "all";
    if (mode === "off") return [];

    const transitions = recentTransitions();
    const centers = keyCenters();
    const focus = focusedKey().toLowerCase();

    const arcs: {
      id: string;
      d: string;
      color: string;
      opacity: number;
      markerEnd: string;
      isLatest: boolean;
    }[] = [];

    for (let i = 0; i < transitions.length; i++) {
      const tr = transitions[i];
      if (!tr) continue;

      if (mode === "errors" && !tr.error) continue;
      if (
        mode === "focus" &&
        tr.fromKey.toLowerCase() !== focus &&
        tr.toKey.toLowerCase() !== focus
      ) {
        continue;
      }

      const p1 = centers.get(tr.fromKey.toLowerCase());
      const p2 = centers.get(tr.toKey.toLowerCase());
      if (!p1 || !p2) continue;

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const offsetDist = Math.min(32, dist * 0.28);
      const ctrlX = midX - (dy / (dist || 1)) * offsetDist;
      const ctrlY = midY + (dx / (dist || 1)) * offsetDist;

      const d = `M ${p1.x} ${p1.y} Q ${ctrlX} ${ctrlY} ${p2.x} ${p2.y}`;
      const isLatest = i >= transitions.length - 2;
      const opacity = isLatest
        ? 0.95
        : Math.max(0.2, (i + 1) / transitions.length);

      const color = tr.error ? "#f43f5e" : "#38bdf8";
      const markerEnd = tr.error ? "url(#arrow-rose)" : "url(#arrow-cyan)";

      arcs.push({
        id: `${tr.id}-${tr.fromKey}-${tr.toKey}`,
        d,
        color,
        opacity,
        markerEnd,
        isLatest,
      });
    }

    return arcs;
  };

  const focusPos = () => keyCenters().get(focusedKey().toLowerCase());

  return (
    <div
      ref={(el) => {
        containerRef = el;
      }}
      class="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-1 rounded-xl border border-sub-alt/40 bg-[#1e2023]/95 p-3 font-mono shadow-2xl backdrop-blur-md select-none"
    >
      {/* Dynamic Key Motion Flow SVG Overlay with Kinetic Line-Drawing Animation */}
      <svg
        class="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>
            {`
              @keyframes keybrDrawArc {
                0% {
                  stroke-dashoffset: 200;
                  opacity: 0.2;
                }
                60% {
                  opacity: 1;
                }
                100% {
                  stroke-dashoffset: 0;
                }
              }
              .keybr-arc-animate {
                stroke-dasharray: 200;
                stroke-dashoffset: 0;
                animation: keybrDrawArc 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
            `}
          </style>

          {/* Arrowhead markers */}
          <marker
            id="arrow-cyan"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8"></path>
          </marker>
          <marker
            id="arrow-rose"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e"></path>
          </marker>
        </defs>

        {/* Focused Key Ring Matching Official Keybr Screenshot */}
        <Show when={focusPos()}>
          {(pos) => (
            <g class="animate-pulse duration-1000">
              <circle
                cx={pos().x}
                cy={pos().y}
                r="16"
                fill="none"
                stroke="#94a338"
                style={{ "stroke-width": "3.5" }}
                opacity="0.9"
              ></circle>
            </g>
          )}
        </Show>

        {/* Moving Dynamic Keystroke Transition Arcs with Arrowheads & Kinetic Line Drawing */}
        <For each={renderedArcs()}>
          {(arc) => (
            <path
              d={arc.d}
              fill="none"
              stroke={arc.color}
              style={{
                "stroke-width": arc.isLatest ? "2.5" : "2.0",
                "stroke-linecap": "round",
                "stroke-dasharray": "6,3",
                "marker-end": arc.markerEnd,
              }}
              opacity={arc.opacity}
              class={cn(
                "transition-opacity duration-200",
                arc.isLatest && "keybr-arc-animate",
              )}
            ></path>
          )}
        </For>
      </svg>

      <For each={KEY_ROWS}>
        {(row) => (
          <div class="flex w-full gap-1">
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

                const isHighlighted = () =>
                  isFocused() ||
                  (isIncluded() && (keyStats()?.confidence ?? 0) > 0) ||
                  (keyDef.id === " " && isIncluded());

                return (
                  <div
                    ref={(el) => {
                      if (el !== undefined && el !== null) {
                        keyElementRefs.set(lowerId, el);
                        if (lowerId === " " || lowerId === "space") {
                          keyElementRefs.set(" ", el);
                          keyElementRefs.set("space", el);
                        }
                      }
                    }}
                    class={cn(
                      "relative box-border flex h-8.5 items-center justify-center rounded-sm border border-transparent text-[10px] font-bold shadow-xs transition-[transform,background-color,border-color,box-shadow,filter] duration-75",
                      keyDef.colorClass,
                      hasWidth ? "grow" : "w-8.5",
                      keyDef.id.length === 1 &&
                        keyDef.id !== " " &&
                        !isIncluded() &&
                        "border-white/10 text-white/30 after:border-white/20 bg-[#25282c] opacity-40 brightness-65 grayscale after:absolute after:inset-0 after:rotate-45 after:border-t-[1.5px]",
                      keyStats()?.isForced &&
                        "decoration-white font-black underline decoration-2",
                      isHighlighted() &&
                        "z-10 shadow-[0_0_10px_rgba(232,121,249,0.4)] ring-2 ring-[#e879f9]",
                      isFocused() &&
                        "z-20 shadow-[0_0_12px_rgba(148,163,56,0.5)] ring-2 ring-[#94a338] brightness-115",
                      isDepressed() &&
                        "translate-y-0.5 scale-95 shadow-inner brightness-140",
                    )}
                    style={{
                      "flex-grow": keyDef.width ?? 1,
                      "max-width":
                        hasWidth && keyDef.width !== undefined
                          ? `${keyDef.width * 2.5}rem`
                          : "2.5rem",
                    }}
                  >
                    <Show when={hasTopLabel}>
                      <span class="absolute top-0.5 left-1 text-[8px] font-normal opacity-75">
                        {keyDef.topLabel}
                      </span>
                    </Show>

                    {/* Confidence score badge on top-right matching screenshot */}
                    <Show
                      when={
                        isIncluded() &&
                        keyStats()?.confidence !== null &&
                        keyStats()?.confidence !== undefined
                      }
                    >
                      <span class="text-white/90 absolute top-0.5 right-1 font-mono text-[8px] font-extrabold drop-shadow-sm">
                        {keyStats()?.confidence?.toFixed(2)}
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
                      <div class="bg-white/70 absolute bottom-0.5 h-0.5 w-2 rounded-full"></div>
                    </Show>

                    {/* Keybr Split-Circle / Wedge Heatmap Indicator (Hits vs Misses) */}
                    <Show when={isIncluded()}>
                      <div class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                        <svg viewBox="0 0 32 32" class="h-5 w-5 opacity-60">
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
