import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { motion as Motion } from 'framer-motion';

// ─── Configuration morphing ───────────────────────────────────────────────────

/** Taille du blob en px */
const DEFAULT_SIZE = 1400;
/** Rayon de blur CSS en px */
const DEFAULT_BLUR = 80;
/** Opacité du blob (0–1) */
const DEFAULT_OPACITY = 0.5;
/** Couleur CSS du blob */
const DEFAULT_COLOR = "var(--color-primary)";
/** Durée minimale d'une transition de morphing en secondes */
const MORPH_DURATION_MIN = 2;
/** Durée maximale d'une transition de morphing en secondes */
const MORPH_DURATION_MAX = 32;
/** Nombre de points déplacés par cycle de morphing */
const POINTS_PER_CYCLE = 6;
/** Amplitude max du déplacement d'un point par cycle (unités SVG 0–100) */
const POINT_JITTER = 50;

// ─── Configuration déplacement ────────────────────────────────────────────────

/** Dépassement autorisé au-delà du bord de la viewport (px) */
const DEFAULT_FLOAT_OVERFLOW = 200;
/** Durée minimale d'un déplacement en secondes */
const DEFAULT_FLOAT_DURATION_MIN = 8;
/** Durée maximale d'un déplacement en secondes */
const DEFAULT_FLOAT_DURATION_MAX = 120;

// ─── Points de base ───────────────────────────────────────────────────────────
// 12 points répartis autour du centre (50,50).
// À chaque cycle, POINTS_PER_CYCLE points dérivent aléatoirement de ±POINT_JITTER.

const BASE_POINTS = [
  [50, 5],
  [72, 8],
  [92, 20],
  [98, 42],
  [95, 62],
  [80, 82],
  [62, 95],
  [40, 98],
  [20, 88],
  [6, 70],
  [4, 45],
  [18, 20],
];

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function pointsToPath(points) {
  const [[fx, fy], ...rest] = points;
  return `M ${fx},${fy} ${rest.map(([x, y]) => `L ${x},${y}`).join(" ")} Z`;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * AnimatedBlob — forme morphing organique + dérive libre.
 *
 * Props morphing :
 *  - size             {number}  Taille du blob en px (défaut : DEFAULT_SIZE)
 *  - blur             {number}  Rayon de blur CSS en px (défaut : DEFAULT_BLUR)
 *  - opacity          {number}  Opacité 0-1 (défaut : DEFAULT_OPACITY)
 *  - color            {string}  Couleur CSS (défaut : DEFAULT_COLOR)
 *  - morphDurationMin {number}  Durée min de déformation en secondes (défaut : MORPH_DURATION_MIN)
 *  - morphDurationMax {number}  Durée max de déformation en secondes (défaut : MORPH_DURATION_MAX)
 *  - pointsPerCycle   {number}  Nombre de points bougés par cycle (défaut : POINTS_PER_CYCLE)
 *  - pointJitter      {number}  Amplitude max du déplacement par cycle (défaut : POINT_JITTER)
 *
 * Props déplacement :
 *  - floatOverflow    {number}  Dépassement max au-delà du bord de la viewport en px (défaut : DEFAULT_FLOAT_OVERFLOW)
 *  - floatDurationMin {number}  Durée min d'un déplacement en secondes (défaut : DEFAULT_FLOAT_DURATION_MIN)
 *  - floatDurationMax {number}  Durée max d'un déplacement en secondes (défaut : DEFAULT_FLOAT_DURATION_MAX)
 */
export default function AnimatedBlob({
  size = DEFAULT_SIZE,
  blur = DEFAULT_BLUR,
  opacity = DEFAULT_OPACITY,
  color = DEFAULT_COLOR,
  morphDurationMin = MORPH_DURATION_MIN,
  morphDurationMax = MORPH_DURATION_MAX,
  pointsPerCycle = POINTS_PER_CYCLE,
  pointJitter = POINT_JITTER,
  floatOverflow = DEFAULT_FLOAT_OVERFLOW,
  floatDurationMin = DEFAULT_FLOAT_DURATION_MIN,
  floatDurationMax = DEFAULT_FLOAT_DURATION_MAX,
}) {
  // ── Morphing ─────────────────────────────────────────────────────────────────
  const pointsRef = useRef(BASE_POINTS.map(([x, y]) => [x, y]));
  const [pathD, setPathD] = useState(() => pointsToPath(pointsRef.current));
  const [morphDuration, setMorphDuration] = useState(MORPH_DURATION_MIN);

  const morphMinRef = useRef(morphDurationMin);
  const morphMaxRef = useRef(morphDurationMax);
  const pointsPerCycleRef = useRef(pointsPerCycle);
  const pointJitterRef = useRef(pointJitter);
  morphMinRef.current = morphDurationMin;
  morphMaxRef.current = morphDurationMax;
  pointsPerCycleRef.current = pointsPerCycle;
  pointJitterRef.current = pointJitter;

  useEffect(() => {
    let timer;
    function tick() {
      const dur = randomBetween(morphMinRef.current, morphMaxRef.current);
      const count = Math.min(pointsPerCycleRef.current, BASE_POINTS.length);

      const indices = [];
      while (indices.length < count) {
        const i = Math.floor(Math.random() * BASE_POINTS.length);
        if (!indices.includes(i)) indices.push(i);
      }

      const newPoints = pointsRef.current.map(([x, y], i) => {
        if (!indices.includes(i)) return [x, y];
        const [bx, by] = BASE_POINTS[i];
        const jitter = pointJitterRef.current;
        const nx = clamp(bx + (Math.random() * 2 - 1) * jitter, 2, 98);
        const ny = clamp(by + (Math.random() * 2 - 1) * jitter, 2, 98);
        return [nx, ny];
      });

      pointsRef.current = newPoints;
      setMorphDuration(dur);
      setPathD(pointsToPath(newPoints));
      timer = setTimeout(tick, dur * 1000);
    }
    tick();
    return () => clearTimeout(timer);
  }, []);

  // ── Déplacement libre ─────────────────────────────────────────────────────────
  const [floatPos, setFloatPos] = useState(() => {
    const maxX = window.innerWidth / 2 + floatOverflow;
    const maxY = window.innerHeight / 2 + floatOverflow;
    return {
      x: randomBetween(-maxX, maxX),
      y: randomBetween(-maxY, maxY),
    };
  });
  const [floatDuration, setFloatDuration] = useState(
    DEFAULT_FLOAT_DURATION_MIN,
  );

  const floatOverflowRef = useRef(floatOverflow);
  const floatMinRef = useRef(floatDurationMin);
  const floatMaxRef = useRef(floatDurationMax);
  floatOverflowRef.current = floatOverflow;
  floatMinRef.current = floatDurationMin;
  floatMaxRef.current = floatDurationMax;

  useEffect(() => {
    let timer;
    function move() {
      const dur = randomBetween(floatMinRef.current, floatMaxRef.current);
      const maxX = window.innerWidth / 2 + floatOverflowRef.current;
      const maxY = window.innerHeight / 2 + floatOverflowRef.current;
      const x = randomBetween(-maxX, maxX);
      const y = randomBetween(-maxY, maxY);
      setFloatDuration(dur);
      setFloatPos({ x, y });
      timer = setTimeout(move, dur * 1000);
    }
    // Délai initial aléatoire pour déphasrer les blobs entre eux
    const initialDelay = randomBetween(0, floatMaxRef.current) * 1000;
    timer = setTimeout(move, initialDelay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        width: 0,
        height: 0,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* Déplacement libre aléatoire */}
      <Motion.div
        animate={{ x: floatPos.x, y: floatPos.y }}
        transition={{ duration: floatDuration, ease: "easeInOut" }}
        style={{ position: "absolute" }}
      >
        {/* Blob centré sur sa position */}
        <div
          style={{
            position: "absolute",
            width: size + blur * 6,
            height: size + blur * 6,
            marginLeft: -(size / 2 + blur * 3),
            marginTop: -(size / 2 + blur * 3),
            filter: `blur(${blur}px)`,
            opacity,
          }}
        >
          <svg
            viewBox="0 0 100 100"
            style={{
              width: size,
              height: size,
              margin: blur * 3,
              overflow: "visible",
              display: "block",
            }}
          >
            <Motion.path
              initial={{ d: pointsToPath(BASE_POINTS) }}
              animate={{ d: pathD }}
              transition={{ duration: morphDuration, ease: "easeInOut" }}
              fill={color}
            />
          </svg>
        </div>
      </Motion.div>
    </div>
  );
}
