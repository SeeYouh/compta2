import { Position } from "@xyflow/react";

function countHandles(size) {
  if (size <= 100) return 3;
  return 3 + Math.floor((size - 100) / 50);
}

export function generateHandles(width, height) {
  const handles = [];

  const sides = [
    {
      position: Position.Top,
      count: countHandles(width),
      axis: "x",
      size: width,
    },
    {
      position: Position.Bottom,
      count: countHandles(width),
      axis: "x",
      size: width,
    },
    {
      position: Position.Left,
      count: countHandles(height),
      axis: "y",
      size: height,
    },
    {
      position: Position.Right,
      count: countHandles(height),
      axis: "y",
      size: height,
    },
  ];

  for (const { position, count, axis } of sides) {
    for (let i = 0; i < count; i++) {
      const pct = count === 1 ? 50 : (i / (count - 1)) * 100;
      const style =
        axis === "x"
          ? { left: `${pct}%`, transform: "translateX(-50%)" }
          : { top: `${pct}%`, transform: "translateY(-50%)" };

      handles.push({ id: `${position}-${i}`, position, style });
    }
  }

  return handles;
}
