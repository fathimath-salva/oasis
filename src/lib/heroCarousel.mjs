export const HERO_SLIDE_INTERVAL_MS = 5000;

export function nextHeroSlideIndex(currentIndex, slideCount) {
  return slideCount > 0 ? (currentIndex + 1) % slideCount : 0;
}

export function startHeroRotation(setActiveSlide, slideCount, schedule, cancel) {
  const scheduleTimer = schedule ?? ((callback, delay) => globalThis.setInterval(callback, delay));
  const cancelTimer = cancel ?? ((timer) => globalThis.clearInterval(timer));
  const timer = scheduleTimer(() => {
    setActiveSlide((currentIndex) => nextHeroSlideIndex(currentIndex, slideCount));
  }, HERO_SLIDE_INTERVAL_MS);

  return () => cancelTimer(timer);
}
