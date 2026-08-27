import { For, JSXElement, Show } from "solid-js";

import { KeySample } from "../../../../utils/keybr/key-calibration";

type Props = {
  samples: readonly KeySample[];
  targetWpm: number;
  isUnlocked: boolean;
};

export function KeybrDetailsChart(props: Props): JSXElement {
  const width = 560;
  const height = 180;
  const padLeft = 55;
  const padRight = 50;
  const padTop = 20;
  const padBottom = 25;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const validSamples = () => {
    return props.samples.filter((s) => s.filteredTimeToType > 0);
  };

  const samplePoints = () => {
    const list = validSamples();
    if (list.length === 0) return [];
    return list.map((s, idx) => {
      const speed = Math.round(((1000 / s.filteredTimeToType) * 60) / 5);
      return { x: idx + 1, y: speed };
    });
  };

  const speedValues = () => {
    const pts = samplePoints();
    const speeds = pts.map((p) => p.y);
    speeds.push(props.targetWpm);
    return speeds;
  };

  const minSpeed = () =>
    Math.max(
      10,
      Math.floor(Math.min(...speedValues(), props.targetWpm - 10) / 5) * 5,
    );
  const maxSpeed = () =>
    Math.ceil(Math.max(...speedValues(), props.targetWpm + 10) / 5) * 5;

  const minX = 1;
  const maxX = () =>
    Math.max(10, samplePoints().length + (props.isUnlocked ? 2 : 8));

  const scaleX = (xVal: number) => {
    return padLeft + ((xVal - minX) / Math.max(1, maxX() - minX)) * chartW;
  };

  const scaleY = (yVal: number) => {
    const span = Math.max(1, maxSpeed() - minSpeed());
    return padTop + chartH - ((yVal - minSpeed()) / span) * chartH;
  };

  // Linear Regression trend line (slope & intercept)
  const regressionLine = () => {
    const pts = samplePoints();
    const n = pts.length;
    if (n < 2) return null;

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      const p = pts[i];
      if (!p) continue;
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumX2 += p.x * p.x;
    }

    const denom = n * sumX2 - sumX * sumX;
    if (denom === 0) return null;

    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;

    const startX = 1;
    const endX = maxX();
    const startY = slope * startX + intercept;
    const endY = slope * endX + intercept;

    return {
      x1: scaleX(startX),
      y1: scaleY(startY),
      x2: scaleX(endX),
      y2: scaleY(endY),
    };
  };

  // Y-axis grid ticks (3 horizontal grid lines: bottom, mid, top)
  const yTicks = () => {
    const min = minSpeed();
    const max = maxSpeed();
    const mid = Math.round((min + max) / 2);
    return [
      { val: min, y: scaleY(min), label: `${min}.0wpm` },
      { val: mid, y: scaleY(mid), label: `${mid}.0wpm` },
      { val: max, y: scaleY(max), label: `${max}.0wpm` },
    ];
  };

  // X-axis ticks (5 labels evenly spaced)
  const xTicks = () => {
    const max = maxX();
    const step = Math.max(1, Math.round(max / 5));
    const ticks: { val: number; x: number }[] = [];
    for (let i = 1; i <= max; i += step) {
      ticks.push({ val: i, x: scaleX(i) });
    }
    return ticks;
  };

  const targetY = () => scaleY(props.targetWpm);

  return (
    <div class="flex w-full flex-col items-center font-mono select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        class="h-44 w-full overflow-visible"
      >
        {/* Horizontal Grid lines */}
        <For each={yTicks()}>
          {(t) => (
            <g>
              <line
                x1={padLeft}
                y1={t.y}
                x2={width - padRight}
                y2={t.y}
                stroke="#3a3d42"
                style={{ "stroke-width": "1px", "stroke-opacity": "0.6" }}
              ></line>
              <text
                x={padLeft - 6}
                y={t.y + 3.5}
                fill="#7a8089"
                style={{ "font-size": "9px", "text-anchor": "end" }}
              >
                {t.label}
              </text>
            </g>
          )}
        </For>

        {/* Vertical Grid lines */}
        <For each={xTicks()}>
          {(t) => (
            <g>
              <line
                x1={t.x}
                y1={padTop}
                x2={t.x}
                y2={height - padBottom}
                stroke="#3a3d42"
                style={{ "stroke-width": "1px", "stroke-opacity": "0.4" }}
              ></line>
              <text
                x={t.x}
                y={height - padBottom + 12}
                fill="#7a8089"
                style={{ "font-size": "9px", "text-anchor": "middle" }}
              >
                {t.val}
              </text>
            </g>
          )}
        </For>

        {/* Bottom Axis Line */}
        <line
          x1={padLeft}
          y1={height - padBottom}
          x2={width - padRight}
          y2={height - padBottom}
          stroke="#4a4e56"
          style={{ "stroke-width": "1.2px" }}
        ></line>

        {/* Left Axis Line */}
        <line
          x1={padLeft}
          y1={padTop}
          x2={padLeft}
          y2={height - padBottom}
          stroke="#4a4e56"
          style={{ "stroke-width": "1.2px" }}
        ></line>

        {/* Target WPM Threshold Baseline (Pink line matching Keybr) */}
        <line
          x1={padLeft}
          y1={targetY()}
          x2={width - padRight + 6}
          y2={targetY()}
          stroke="#e57373"
          style={{ "stroke-width": "1.5px", "stroke-opacity": "0.85" }}
        ></line>
        <text
          x={width - padRight + 8}
          y={targetY() + 3.5}
          fill="#e57373"
          style={{
            "font-size": "9px",
            "font-weight": "bold",
            "text-anchor": "start",
          }}
        >
          {`${props.targetWpm}.0wpm`}
        </text>

        {/* Linear Regression Trend Line */}
        <Show when={regressionLine()}>
          {(r) => (
            <line
              x1={r().x1}
              y1={r().y1}
              x2={r().x2}
              y2={r().y2}
              stroke="#5bb88a"
              style={{ "stroke-width": "2px", "stroke-opacity": "0.75" }}
            ></line>
          )}
        </Show>

        {/* Scatter Plot Circles for Keystroke / Lesson Samples */}
        <For each={samplePoints()}>
          {(pt) => {
            const cx = () => scaleX(pt.x);
            const cy = () => scaleY(pt.y);
            return (
              <circle
                cx={cx()}
                cy={cy()}
                r={4.5}
                fill="#48a074"
                stroke="#202428"
                style={{ "stroke-width": "1px" }}
              ></circle>
            );
          }}
        </For>
      </svg>
    </div>
  );
}
