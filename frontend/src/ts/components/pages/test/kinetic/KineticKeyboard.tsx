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
  activeMicroDrillTransition,
  kineticDepressedKeys,
  kineticDiagnostics,
  kineticRecentTransitions,
  kineticSettings,
  transitionRatings,
} from "../../../../states/kinetic";
import { cn } from "../../../../utils/cn";

type KeyDef = {
  id: string;
  topLabel?: string;
  label: string;
  width?: number;
  colorClass: string;
  hasBump?: boolean;
};

const KEY_ROWS: KeyDef[][] = [
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
      colorClass: "bg-[#be4e46] text-white/90",
    },
    {
      id: "5",
      topLabel: "%",
      label: "5",
      colorClass: "bg-[#be4e46] text-white/90",
    },
    {
      id: "6",
      topLabel: "^",
      label: "6",
      colorClass: "bg-[#914782] text-white/90",
    },
    {
      id: "7",
      topLabel: "&",
      label: "7",
      colorClass: "bg-[#914782] text-white/90",
    },
    {
      id: "8",
      topLabel: "*",
      label: "8",
      colorClass: "bg-[#45789f] text-white/90",
    },
    {
      id: "9",
      topLabel: "(",
      label: "9",
      colorClass: "bg-[#488e7d] text-white/90",
    },
    {
      id: "0",
      topLabel: ")",
      label: "0",
      colorClass: "bg-[#5b8764] text-white/90",
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
      id: "backspace",
      label: "⌫",
      width: 1.6,
      colorClass: "bg-[#4e555b] text-white/80",
    },
  ],
  [
    {
      id: "tab",
      label: "tab",
      width: 1.4,
      colorClass: "bg-[#4e555b] text-white/80",
    },
    { id: "q", label: "Q", colorClass: "bg-[#5b8764] text-white/90" },
    { id: "w", label: "W", colorClass: "bg-[#bfa143] text-white/90" },
    { id: "e", label: "E", colorClass: "bg-[#cf8e3c] text-white/90" },
    { id: "r", label: "R", colorClass: "bg-[#be4e46] text-white/90" },
    { id: "t", label: "T", colorClass: "bg-[#be4e46] text-white/90" },
    { id: "y", label: "Y", colorClass: "bg-[#914782] text-white/90" },
    { id: "u", label: "U", colorClass: "bg-[#914782] text-white/90" },
    { id: "i", label: "I", colorClass: "bg-[#45789f] text-white/90" },
    { id: "o", label: "O", colorClass: "bg-[#488e7d] text-white/90" },
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
      colorClass: "bg-[#4e555b] text-white/80",
    },
  ],
  [
    {
      id: "capslock",
      label: "caps",
      width: 1.7,
      colorClass: "bg-[#4e555b] text-white/80",
    },
    { id: "a", label: "A", colorClass: "bg-[#5b8764] text-white/90" },
    { id: "s", label: "S", colorClass: "bg-[#bfa143] text-white/90" },
    { id: "d", label: "D", colorClass: "bg-[#cf8e3c] text-white/90" },
    {
      id: "f",
      label: "F",
      hasBump: true,
      colorClass: "bg-[#be4e46] text-white/90",
    },
    { id: "g", label: "G", colorClass: "bg-[#be4e46] text-white/90" },
    { id: "h", label: "H", colorClass: "bg-[#914782] text-white/90" },
    {
      id: "j",
      label: "J",
      hasBump: true,
      colorClass: "bg-[#914782] text-white/90",
    },
    { id: "k", label: "K", colorClass: "bg-[#45789f] text-white/90" },
    { id: "l", label: "L", colorClass: "bg-[#488e7d] text-white/90" },
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
      id: "enter",
      label: "enter",
      width: 1.9,
      colorClass: "bg-[#4e555b] text-white/80",
    },
  ],
  [
    {
      id: "shiftleft",
      label: "shift",
      width: 2.2,
      colorClass: "bg-[#4e555b] text-white/80",
    },
    { id: "z", label: "Z", colorClass: "bg-[#5b8764] text-white/90" },
    { id: "x", label: "X", colorClass: "bg-[#bfa143] text-white/90" },
    { id: "c", label: "C", colorClass: "bg-[#cf8e3c] text-white/90" },
    { id: "v", label: "V", colorClass: "bg-[#be4e46] text-white/90" },
    { id: "b", label: "B", colorClass: "bg-[#be4e46] text-white/90" },
    { id: "n", label: "N", colorClass: "bg-[#914782] text-white/90" },
    { id: "m", label: "M", colorClass: "bg-[#914782] text-white/90" },
    {
      id: ",",
      topLabel: "<",
      label: ",",
      colorClass: "bg-[#45789f] text-white/90",
    },
    {
      id: ".",
      topLabel: ">",
      label: ".",
      colorClass: "bg-[#488e7d] text-white/90",
    },
    {
      id: "/",
      topLabel: "?",
      label: "/",
      colorClass: "bg-[#5b8764] text-white/90",
    },
    {
      id: "shiftright",
      label: "shift",
      width: 2.4,
      colorClass: "bg-[#4e555b] text-white/80",
    },
  ],
  [
    {
      id: "ctrlleft",
      label: "ctrl",
      width: 1.3,
      colorClass: "bg-[#4e555b] text-white/80",
    },
    {
      id: "altleft",
      label: "alt",
      width: 1.2,
      colorClass: "bg-[#4e555b] text-white/80",
    },
    {
      id: " ",
      label: "space",
      width: 6.2,
      colorClass: "bg-[#383d42] text-white/80",
    },
    {
      id: "altright",
      label: "alt",
      width: 1.2,
      colorClass: "bg-[#4e555b] text-white/80",
    },
    {
      id: "ctrlright",
      label: "ctrl",
      width: 1.3,
      colorClass: "bg-[#4e555b] text-white/80",
    },
  ],
];

export function KineticKeyboard(): JSXElement {
  let keyboardContainerRef: HTMLDivElement | null = null;
  const keyElementRefs = new Map<string, HTMLElement>();
  const [keyCenters, setKeyCenters] = createSignal<
    Map<string, { x: number; y: number }>
  >(new Map());

  const recalcKeyCenters = () => {
    if (!keyboardContainerRef) return;
    const containerRect = keyboardContainerRef.getBoundingClientRect();
    const newCenters = new Map<string, { x: number; y: number }>();

    for (const [keyId, el] of keyElementRefs.entries()) {
      const rect = el.getBoundingClientRect();
      newCenters.set(keyId, {
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2,
      });
    }
    setKeyCenters(newCenters);
  };

  onMount(() => {
    recalcKeyCenters();
    window.addEventListener("resize", recalcKeyCenters);
    onCleanup(() => window.removeEventListener("resize", recalcKeyCenters));
  });

  createEffect(() => {
    void kineticRecentTransitions().length;
    setTimeout(recalcKeyCenters, 30);
  });

  const traceArcs = () => {
    const mode = kineticSettings().traceMode;
    if (mode === "off") return [];

    const centers = keyCenters();
    const transitions = kineticRecentTransitions();
    const activeBottlenecks = kineticDiagnostics().motorBottlenecks;
    const microFocus = activeMicroDrillTransition();

    const arcs: {
      id: string;
      d: string;
      color: string;
      opacity: number;
      markerEnd: string;
    }[] = [];

    for (let i = 0; i < transitions.length; i++) {
      const tr = transitions[i];
      if (!tr) continue;

      if (mode === "errors" && tr.correct) continue;
      if (
        mode === "focus" &&
        !activeBottlenecks.some(
          (b) => b.includes(tr.from) || b.includes(tr.to),
        ) &&
        (microFocus === null ||
          microFocus === "" ||
          !microFocus.toLowerCase().includes(tr.from))
      ) {
        continue;
      }

      const p1 = centers.get(tr.from);
      const p2 = centers.get(tr.to);
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

      const color = tr.correct ? "#38bdf8" : "#f43f5e";
      const markerEnd = tr.correct ? "url(#arrow-cyan)" : "url(#arrow-rose)";

      arcs.push({
        id: `${tr.from}-${tr.to}-${i}-${tr.timestamp}`,
        d,
        color,
        opacity,
        markerEnd,
      });
    }

    return arcs;
  };

  return (
    <div
      ref={(el) => {
        keyboardContainerRef = el;
      }}
      class="relative mx-auto flex w-full max-w-4xl flex-col gap-1 rounded-xl border border-sub-alt/40 bg-[#1e2023]/95 p-3 shadow-2xl backdrop-blur-md select-none"
    >
      {/* SVG Transition Trace Layer */}
      <svg class="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible">
        <defs>
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

        <For each={traceArcs()}>
          {(arc) => (
            <path
              d={arc.d}
              fill="none"
              stroke={arc.color}
              opacity={arc.opacity}
              style={{
                "stroke-width": "2.5",
                "stroke-linecap": "round",
                "stroke-dasharray": "4,2",
                "marker-end": arc.markerEnd,
              }}
              class="transition-opacity duration-200"
            ></path>
          )}
        </For>
      </svg>

      {/* Keyboard Grid */}
      <For each={KEY_ROWS}>
        {(row) => (
          <div class="flex w-full gap-1">
            <For each={row}>
              {(keyDef) => {
                const lowerId = keyDef.id.toLowerCase();
                const isDepressed = () =>
                  kineticDepressedKeys().includes(lowerId);
                const isFocused = () => {
                  const micro = activeMicroDrillTransition();
                  if (micro !== null && micro.toLowerCase().includes(lowerId)) {
                    return true;
                  }
                  const bList = kineticDiagnostics().motorBottlenecks;
                  return bList.some((b) => b.includes(lowerId));
                };

                const ratingInfo = () => transitionRatings()[lowerId];
                const hasErrors = () => (ratingInfo()?.totalErrors ?? 0) > 0;
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
                      "relative flex h-8.5 items-center justify-center rounded-sm text-[10px] font-bold shadow-xs transition-all duration-75",
                      keyDef.colorClass,
                      hasWidth ? "grow" : "w-8.5",
                      isFocused() &&
                        "z-10 ring-2 ring-main ring-offset-1 ring-offset-[#1e2023] brightness-110",
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

                    {/* Split-Circle Hit/Miss Pie Wedge */}
                    <div class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-50">
                      <svg viewBox="0 0 32 32" class="h-5 w-5">
                        {/* Top Arc: Hit */}
                        <path
                          d="M 4 16 A 12 12 0 0 1 28 16 Z"
                          fill="rgba(56, 189, 248, 0.4)"
                          stroke="rgba(255, 255, 255, 0.25)"
                          style={{ "stroke-width": "0.75" }}
                        ></path>
                        {/* Bottom Arc: Error */}
                        <path
                          d="M 4 16 A 12 12 0 0 0 28 16 Z"
                          fill={
                            hasErrors()
                              ? "rgba(244, 63, 94, 0.65)"
                              : "rgba(255, 255, 255, 0.1)"
                          }
                          stroke="rgba(255, 255, 255, 0.25)"
                          style={{ "stroke-width": "0.75" }}
                        ></path>
                      </svg>
                    </div>
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
