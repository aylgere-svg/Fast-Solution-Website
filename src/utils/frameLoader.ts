/// <reference types="vite/client" />

import firstFrameUrl from '../../ezgif-frame-001.jpg?url';

// Import the intact root-level image sequence as build-time URLs.
const frameModules = import.meta.glob<string>('../../ezgif-frame-*.jpg', {
  eager: true,
  import: 'default',
  query: '?url',
});

export {firstFrameUrl};

// Sort frames numerically by frame number
export const frameUrls: string[] = Object.keys(frameModules)
  .sort((a, b) => {
    const numA = parseInt(a.match(/(\d+)/)?.[0] || '0', 10);
    const numB = parseInt(b.match(/(\d+)/)?.[0] || '0', 10);
    return numA - numB;
  })
  .map((key) => {
    return frameModules[key];
  })
  .filter(Boolean);

// Fallback generator with base URL support for Git / GitHub Pages / Subpath deployments.
export const getFallbackFrameUrl = (frameNum: number): string => {
  const padded = Math.min(Math.max(1, frameNum), 100)
    .toString()
    .padStart(3, '0');

  // The working source images live outside the corrupted frames directories.
  if (frameUrls[frameNum - 1]) {
    return frameUrls[frameNum - 1];
  }

  const rawBase = import.meta.env.BASE_URL || './';
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  return `${base}ezgif-frame-${padded}.jpg`;
};
