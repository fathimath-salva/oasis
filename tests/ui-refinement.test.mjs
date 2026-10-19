import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { HERO_SLIDE_INTERVAL_MS, startHeroRotation } from '../src/lib/heroCarousel.mjs';

const readSource = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('homepage keeps the existing section order with reviews immediately after Most Loved', () => {
  const homePage = readSource('src/components/HomePage.tsx');
  const markers = ['home-hero', 'home-category-section', 'home-popular-section', 'home-review-section', 'home-story-section', 'home-map-section', 'home-instagram-section', 'home-inquiry-section'];
  let previous = -1;
  for (const marker of markers) {
    const next = homePage.indexOf(marker);
    assert.ok(next > previous, `${marker} must follow the preceding homepage section`);
    previous = next;
  }
  assert.equal(homePage.includes('A Glimpse Inside OASIS'), false);
});

test('homepage hero keeps the welcome banner first and uses the exact Design Reference photos for four slides', () => {
  const homePage = readSource('src/components/HomePage.tsx');
  const expectedSlides = [
    ["id: 'welcome'", "image: '/images/salon-interior.jpg'"],
    ["id: 'men'", "image: menBanner", "heading: 'MEN’S GROOMING'", "quote: 'Refined style. Timeless confidence.'", "filter: 'men'"],
    ["id: 'women'", "image: womenBanner", "heading: 'WOMEN’S BEAUTY'", "quote: 'Your beauty. Your moment. Your glow.'", "filter: 'women'"],
    ["id: 'spa'", "image: spaBanner", "heading: 'SPA & MASSAGE'", "quote: 'Relax your body. Restore your balance.'", "filter: 'spa'"],
  ];
  let position = homePage.indexOf('const heroSlides = [');
  assert.notEqual(position, -1);
  for (const group of expectedSlides) {
    for (const expected of group) {
      const next = homePage.indexOf(expected, position);
      assert.ok(next >= position, `${expected} appears in slide order`);
      position = next + expected.length;
    }
  }
  assert.equal((homePage.match(/kind: 'service' as const/g) ?? []).length, 3);
  for (const image of ['mens.png', 'womens.png', 'spa.png']) {
    assert.ok(existsSync(new URL(`../design-reference/${image}`, import.meta.url)), `${image} must be present in Design Reference`);
  }
  assert.match(homePage, /onClick=\{\(\) => onNavigate\('services', slide\.filter\)\}/);
  assert.match(homePage, /Make space for <em>yourself\.<\/em>/);
  assert.match(homePage, /Hair, beauty and spa care in a considered, welcoming space/);
});

test('hero carousel rotates in order every five seconds without visible slider controls', () => {
  const homePage = readSource('src/components/HomePage.tsx');
  assert.match(homePage, /startHeroRotation\(setActiveHeroSlide, heroSlides\.length\)/);
  assert.match(homePage, /React\.useEffect\(\(\) => \{\s*return startHeroRotation\(setActiveHeroSlide, heroSlides\.length\);\s*\}, \[\]\)/);
  assert.doesNotMatch(homePage, /isHovered|hasFocus|prefersReducedMotion|onMouseEnter|onFocusCapture/);
  assert.doesNotMatch(homePage, /home-hero-controls|home-hero-control|home-hero-indicator|Previous banner|Next banner|Pause banner rotation|Play banner rotation/);
  assert.doesNotMatch(homePage, /window\.scrollTo|document\.scrollTo/);
  const styles = readSource('src/index.css');
  assert.doesNotMatch(styles, /home-hero-controls|home-hero-control|home-hero-indicator/);
  assert.match(styles, /\.home-hero-slide\.is-active \{ opacity: 1; visibility: visible; pointer-events: auto; \}/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.home-hero-slide \{ transition: none !important;/);
});

test('automatic banner timer advances through four slides every five seconds and cleans up', () => {
  let activeSlide = 0;
  let timerCallback;
  let scheduledDelay;
  let clearedTimer;
  const stop = startHeroRotation(
    (update) => { activeSlide = update(activeSlide); },
    4,
    (callback, delay) => { timerCallback = callback; scheduledDelay = delay; return 'hero-timer'; },
    (timer) => { clearedTimer = timer; },
  );

  assert.equal(HERO_SLIDE_INTERVAL_MS, 5000);
  assert.equal(scheduledDelay, 5000);
  for (const expectedSlide of [1, 2, 3, 0]) {
    timerCallback();
    assert.equal(activeSlide, expectedSlide);
  }
  stop();
  assert.equal(clearedTimer, 'hero-timer');
});

test('booking and authentication modals expose monochrome theme hooks', () => {
  assert.match(readSource('src/components/BookingModal.tsx'), /oasis-booking-modal/);
  assert.match(readSource('src/components/AuthModal.tsx'), /oasis-auth-modal/);
  const styles = readSource('src/index.css');
  assert.match(styles, /\.oasis-booking-modal/);
  assert.match(styles, /\.oasis-auth-modal/);
  assert.match(styles, /Palette ownership for the active booking, authentication, and inquiry flows/);
  assert.match(styles, /\.oasis-modal-close \{/);
});

test('inquiry form uses the explicit palette hook instead of inherited page colours', () => {
  const homePage = readSource('src/components/HomePage.tsx');
  assert.match(homePage, /className="oasis-inquiry-form"/);
  assert.match(readSource('src/index.css'), /\.oasis-inquiry-form :is\(input, textarea\)/);
});

test('catalogue rows use a responsive name-and-price layout', () => {
  const servicesPage = readSource('src/components/ServicesPage.tsx');
  assert.doesNotMatch(servicesPage, /service-option-duration|service\.durationMinutes/);
  assert.match(readSource('src/constants/salonData.ts'), /durationMinutes:\s*\d+/);
  const bookingModal = readSource('src/components/BookingModal.tsx');
  assert.doesNotMatch(bookingModal, /formatDuration|duration preview|Total Duration|Duration required/);
  assert.match(bookingModal, /Available Time Slots/);
  assert.match(servicesPage, /className="service-option-details"><span className="service-option-name">\{service\.name\}/);
  assert.match(servicesPage, /getCataloguePriceLabel\(service\)/);
  const styles = readSource('src/index.css');
  assert.match(styles, /\.oasis-app \.service-option \{ display: grid/);
  assert.match(styles, /\.service-category-grid \{ display: grid;/);
  assert.doesNotMatch(styles, /service-option-duration/);
});

test('catalogue hides service durations while preserving length labels and their prices', () => {
  const servicesPage = readSource('src/components/ServicesPage.tsx');
  const catalogue = readSource('src/constants/salonData.ts');
  assert.match(servicesPage, /\{service\.name\}[^<]*\{service\.hairLength &&/);
  assert.doesNotMatch(servicesPage, /durationMinutes|formatDuration|service-option-duration/);

  const expectedLengthPrices = [
    [/Smoothening \/ Straightening[^']*Short/, /price: 4000/],
    [/Smoothening \/ Straightening[^']*Medium/, /price: 5000/],
    [/Smoothening \/ Straightening[^']*Long/, /price: 7000/],
    [/Keratin Treatment[^']*Extra Long/, /price: 10000,[\s\S]*?displayPrice: '[^']*10,000\+'/],
  ];
  for (const [namePattern, pricePattern] of expectedLengthPrices) {
    const serviceStart = catalogue.search(namePattern);
    assert.notEqual(serviceStart, -1, `catalogue keeps ${namePattern}`);
    const service = catalogue.slice(serviceStart, catalogue.indexOf('isActive: true', serviceStart));
    assert.match(service, pricePattern, `catalogue keeps the price for ${namePattern}`);
    assert.match(service, /durationMinutes:\s*\d+/, `catalogue retains duration data for ${namePattern}`);
  }
});

test('Most Loved cards use the four requested catalogue services, existing prices, and booking actions', () => {
  const homePage = readSource('src/components/HomePage.tsx');
  for (const title of ['Keratin Treatment', 'Classic Facial', 'Beard Trimming & Styling', 'Body Spa & Massage']) {
    assert.ok(homePage.includes(`title: '${title}'`), `${title} is featured`);
  }
  assert.match(homePage, /const lovedServices = mostLovedCards\.flatMap/);
  assert.match(homePage, /isFixedPriceService\(service\) && card\.matches\(service\)/);
  assert.match(homePage, /getCataloguePriceLabel\(card\.service\)/);
  assert.match(homePage, /card\.service\.name !== card\.title/);
  assert.match(homePage, /onClick=\{\(\) => openBooking\(card\.service\)\}/);
  for (const asset of ['women-hair-smoothing.jpg', 'women-facial.jpg', 'men-grooming.jpg', 'men-massage.jpg']) {
    assert.ok(homePage.includes(`/images/${asset}`), `${asset} should be reused for a featured service`);
    assert.ok(existsSync(new URL(`../public/images/${asset}`, import.meta.url)), `${asset} must exist`);
  }
});

test('Guest Feedback shows a non-fabricated placeholder when no approved reviews are stored', () => {
  const homePage = readSource('src/components/HomePage.tsx');
  assert.match(homePage, /home-review-section/);
  assert.match(homePage, /Guest Feedback/);
  assert.match(homePage, /Every visit, a little more special\./);
  assert.match(homePage, /Your experience matters to us\. Guest reviews will appear here soon\./);
  assert.doesNotMatch(homePage, /reviewerName|customerName|rating:\s*\d|stars:\s*\d/);
  assert.doesNotMatch(homePage, /Submit review/);
  const styles = readSource('src/index.css');
  assert.match(styles, /\.home-guest-feedback-grid \{ display: grid; grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/);
  assert.match(styles, /@media \(max-width: 1000px\) \{ \.home-guest-feedback-grid \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \} \}/);
  assert.match(styles, /\.home-most-loved-grid, \.home-guest-feedback-grid \{ grid-template-columns: 1fr; \}/);
});

test('homepage category cards use existing portrait photos with separate face-safe crops', () => {
  const homePage = readSource('src/components/HomePage.tsx');
  for (const asset of ['men-grooming.jpg', 'women-beauty.jpg', 'men-massage.jpg']) {
    assert.ok(existsSync(new URL(`../public/images/${asset}`, import.meta.url)), `${asset} must exist`);
    assert.ok(homePage.includes(`/images/${asset}`), `${asset} must be used on the homepage`);
  }
  const styles = readSource('src/index.css');
  assert.match(styles, /aspect-ratio: 4 \/ 5/);
  assert.match(styles, /object-fit: cover/);
  assert.match(styles, /nth-child\(1\) img \{ object-position: center 22%/);
  assert.match(styles, /nth-child\(2\) img \{ object-position: center 28%/);
  assert.match(styles, /nth-child\(3\) img \{ object-position: center 50%/);
});

test('Our Story heading has a high contrast gold style and story copy stays ivory', () => {
  const aboutPage = readSource('src/components/AboutPage.tsx');
  assert.match(aboutPage, /className="about-story-heading/);
  assert.match(readSource('src/index.css'), /\.oasis-app \.about-story-heading[\s\S]*?color: #c6aa76 !important;[\s\S]*?opacity: 1 !important;/);
  assert.match(readSource('src/index.css'), /\.oasis-app \.about-page p:not\(\.eyebrow\) \{ color: #f5f1e8 !important/);
});

test('shared catalogue cards stack headings and option counts before naturally sized service rows', () => {
  const servicesPage = readSource('src/components/ServicesPage.tsx');
  assert.match(servicesPage, /className="service-category-title"><h3>\{category\}<\/h3><span>\{services\.length\}/);
  assert.match(servicesPage, /className="service-category-heading"[\s\S]*?service-category-title[\s\S]*?categoryImage\(category, group\.gender\)/);
  const styles = readSource('src/index.css');
  assert.match(styles, /\.oasis-app \.service-category-grid > section \{[\s\S]*?height: fit-content;[\s\S]*?min-height: 0;/);
  assert.match(styles, /\.oasis-app \.service-category-heading \{[\s\S]*?display: grid;[\s\S]*?grid-template-columns: minmax\(0, 1fr\) 4rem;/);
  assert.match(styles, /\.oasis-app \.service-category-title > span \{[\s\S]*?display: block;/);
  assert.match(styles, /\.oasis-app \.service-option \{[\s\S]*?display: grid !important;[\s\S]*?grid-template-columns: minmax\(0, 1fr\) minmax\(4\.25rem, auto\);/);
  assert.match(styles, /@media \(max-width: 420px\) \{[\s\S]*?\.oasis-app \.service-option \{[\s\S]*?grid-template-columns:/);
});

test('both catalogues render categories in original order in one shared responsive grid', () => {
  const servicesPage = readSource('src/components/ServicesPage.tsx');
  assert.equal((servicesPage.match(/className="service-category-grid"/g) ?? []).length, 1);
  assert.match(servicesPage, /SERVICE_CATEGORIES\.map\(\(category\) => \(\{/);
  assert.match(servicesPage, /<div className="service-category-grid">\s*\{group\.categories\.map\(\(\{ category, services \}\) => \(\s*<section key=\{category\}/);
  assert.doesNotMatch(servicesPage, /categoryBands|service-category-row|data-service-count-band/);
  const categorySource = readSource('src/constants/salonData.ts');
  const declaredCategories = categorySource.match(/export const SERVICE_CATEGORIES:[\s\S]*?= \[([\s\S]*?)\];/)?.[1];
  assert.ok(declaredCategories, 'catalogue category order is declared');
  assert.deepEqual([...declaredCategories.matchAll(/^\s*'([^']+)',?\s*$/gm)].map(([, name]) => name), [
    'Hair Cutting', 'Hair Wash', 'Blow Dry', 'Smoothening / Straightening', 'Keratin Treatment',
    'Hair Colour', 'Classic Facial', 'Premium Facial', 'Clean-Up', 'Bleach & Add-On', 'Manicure',
    'Pedicure', 'Hair Spa', 'Waxing', 'Brazilian Waxing', 'Threading', 'Body Spa & Massage',
  ]);
  const styles = readSource('src/index.css');
  assert.match(styles, /\.oasis-app \.service-category-grid \{\s*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\) !important;/);
  assert.match(styles, /@media \(max-width: 900px\) \{\s*\.oasis-app \.service-category-grid \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\) !important;/);
  assert.match(styles, /@media \(max-width: 600px\) \{\s*\.oasis-app \.service-category-grid \{ grid-template-columns: minmax\(0, 1fr\) !important;/);
  assert.doesNotMatch(styles, /service-category-row/);
});

test('Services page uses one tab-driven hero with the supplied salon, men, and women photos', () => {
  const servicesPage = readSource('src/components/ServicesPage.tsx');
  for (const asset of ['Salon Interior.png', 'Men’s Services.png', 'Women’s Services.png']) {
    assert.ok(existsSync(new URL(`../design-reference/${asset}`, import.meta.url)), `${asset} must exist in Design Reference`);
    assert.ok(servicesPage.includes(`design-reference/${asset}`), `${asset} must be imported by ServicesPage`);
  }
  const hero = servicesPage.match(/<section[\s\S]*?className=\{`service-hero[\s\S]*?<\/section>/)?.[0];
  assert.ok(hero, 'Services & prices banner exists');
  assert.equal((servicesPage.match(/service-hero\$\{/g) ?? []).length, 1);
  assert.match(hero, /style=\{selectedGender === 'all' \? \{ backgroundImage: `url\(\$\{salonInteriorReference\}\)` \} : undefined\}/);
  assert.match(hero, /selectedGender !== 'all' && <img src=\{selectedGender === 'men' \? menServicesReference : womenServicesReference\}/);
  assert.match(hero, /selectedGender === 'all' \? ' service-hero--all'/);
  assert.match(hero, /Services & prices/);
  assert.doesNotMatch(servicesPage, /service-gender-banner|service-unisex-heading/);
  const styles = readSource('src/index.css');
  assert.match(styles, /\.service-hero > img \{[\s\S]*?object-fit: cover;/);
  assert.match(styles, /\.service-hero--all \{ background-position: right center; background-repeat: no-repeat; background-size: auto max\(100%, 122vw\); \}/);
  assert.match(styles, /\.service-hero--all::after \{ background: linear-gradient\(90deg,rgba\(21,20,18,\.3\)/);
  assert.doesNotMatch(styles, /\.service-hero--all::after \{ background: linear-gradient\([^}]*\.995/);
});
