export const HERO_SLIDE_INTERVAL_MS: number;
export function nextHeroSlideIndex(currentIndex: number, slideCount: number): number;
export function startHeroRotation(
  setActiveSlide: (update: (currentIndex: number) => number) => void,
  slideCount: number,
  schedule?: (callback: () => void, delay: number) => unknown,
  cancel?: (timer: unknown) => void,
): () => void;
