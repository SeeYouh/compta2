import { useMemo } from 'react';

import AnimatedBlob from './AnimatedBlob';

/**
 * Rendu adaptatif de blobs en arrière-plan selon la largeur de la fenêtre.
 *
 * Paliers :
 *  < 768px   → 2 blobs
 *  768–1280  → 3 blobs
 *  1280–1920 → 5 blobs
 *  > 1920px  → 8 blobs
 */

const BREAKPOINTS = [
  { maxWidth: 768, count: 2 },
  { maxWidth: 1280, count: 3 },
  { maxWidth: 1920, count: 5 },
  { maxWidth: Infinity, count: 8 },
];

// Variation des paramètres par index pour que les blobs ne soient pas identiques
const BLOB_VARIANTS = [
  {
    morphDurationMin: 8,
    morphDurationMax: 14,
    floatDurationMin: 10,
    floatDurationMax: 18,
  },
  {
    morphDurationMin: 10,
    morphDurationMax: 16,
    floatDurationMin: 12,
    floatDurationMax: 20,
  },
  {
    morphDurationMin: 6,
    morphDurationMax: 12,
    floatDurationMin: 8,
    floatDurationMax: 16,
  },
  {
    morphDurationMin: 12,
    morphDurationMax: 20,
    floatDurationMin: 14,
    floatDurationMax: 22,
  },
  {
    morphDurationMin: 7,
    morphDurationMax: 15,
    floatDurationMin: 11,
    floatDurationMax: 19,
  },
  {
    morphDurationMin: 9,
    morphDurationMax: 18,
    floatDurationMin: 13,
    floatDurationMax: 21,
  },
  {
    morphDurationMin: 5,
    morphDurationMax: 13,
    floatDurationMin: 9,
    floatDurationMax: 17,
  },
  {
    morphDurationMin: 11,
    morphDurationMax: 19,
    floatDurationMin: 15,
    floatDurationMax: 23,
  },
];

function getBlobCount() {
  const width = window.innerWidth;
  return BREAKPOINTS.find((bp) => width < bp.maxWidth).count;
}

export default function BlobBackground() {
  const count = useMemo(getBlobCount, []);

  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const variant = BLOB_VARIANTS[i % BLOB_VARIANTS.length];
        return <AnimatedBlob key={i} {...variant} />;
      })}
    </>
  );
}
