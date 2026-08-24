/// <reference types="vite/client" />

const base = (import.meta.env.BASE_URL || './').replace(/\/$/, '');

// These are copied from the valid root-level files into public/ during setup.
export const frameUrls: string[] = Array.from(
  { length: 100 },
  (_, index) => `${base}/ezgif-frame-${String(index + 1).padStart(3, '0')}.jpg`
);

export const firstFrameUrl = frameUrls[0];

// Fallback generator with base URL support for Git / GitHub Pages / Subpath deployments.
export const getFallbackFrameUrl = (frameNum: number): string => {
  const padded = Math.min(Math.max(1, frameNum), 100)
    .toString()
    .padStart(3, '0');

  return `${base}/ezgif-frame-${padded}.jpg`;
};
