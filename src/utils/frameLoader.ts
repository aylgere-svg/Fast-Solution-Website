/// <reference types="vite/client" />

// Load all frames reliably using Vite's eager asset glob import
const frameModules: Record<string, { default: string } | string> = (
  import.meta as any
).glob('../assets/frames/*.jpg', {
  eager: true,
});

// Sort frames numerically by frame number
export const frameUrls: string[] = Object.keys(frameModules)
  .sort((a, b) => {
    const numA = parseInt(a.match(/(\d+)/)?.[0] || '0', 10);
    const numB = parseInt(b.match(/(\d+)/)?.[0] || '0', 10);
    return numA - numB;
  })
  .map((key) => {
    const mod = frameModules[key];
    if (typeof mod === 'string') return mod;
    return mod?.default || '';
  })
  .filter(Boolean);

// Fallback generator if needed
export const getFallbackFrameUrl = (frameNum: number): string => {
  const padded = Math.min(Math.max(1, frameNum), 100)
    .toString()
    .padStart(3, '0');
  if (frameUrls && frameUrls[frameNum - 1]) {
    return frameUrls[frameNum - 1];
  }
  return `/ezgif-frame-${padded}.jpg`;
};
