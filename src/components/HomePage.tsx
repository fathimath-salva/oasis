import React from 'react';
import { ArrowDown, ArrowRight, MapPin } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { SALON_INFO } from '../constants/salonData';
import { getCataloguePriceLabel } from '../lib/formatters';
import { isFixedPriceService } from '../lib/serviceMapper';
import { startHeroRotation } from '../lib/heroCarousel.mjs';
import type { SalonService } from '../types/salon';
import { InstagramIcon } from './InstagramIcon';
import menBanner from '../../design-reference/mens.png';
import womenBanner from '../../design-reference/womens.png';
import spaBanner from '../../design-reference/spa.png';

const heroSlides = [
  { id: 'welcome', title: 'Welcome to OASIS', image: '/images/salon-interior.jpg', kind: 'welcome' as const },
  { id: 'men', title: 'Men’s Grooming', image: menBanner, alt: 'Men’s grooming service at OASIS', kind: 'service' as const, heading: 'MEN’S GROOMING', quote: 'Refined style. Timeless confidence.', filter: 'men', action: 'Explore men’s services' },
  { id: 'women', title: 'Women’s Beauty', image: womenBanner, alt: 'Women’s beauty service at OASIS', kind: 'service' as const, heading: 'WOMEN’S BEAUTY', quote: 'Your beauty. Your moment. Your glow.', filter: 'women', action: 'Explore women’s services' },
  { id: 'spa', title: 'Spa & Massage', image: spaBanner, alt: 'A customer receiving a relaxing massage at OASIS', kind: 'service' as const, heading: 'SPA & MASSAGE', quote: 'Relax your body. Restore your balance.', filter: 'spa', action: 'Explore spa services' },
];

const collections = [
  { title: "Men’s Grooming", filter: 'men', image: '/images/men-grooming.jpg', alt: 'Men’s grooming portrait from the OASIS men’s catalogue' },
  { title: "Women’s Beauty", filter: 'women', image: '/images/women-beauty.jpg', alt: 'Women’s beauty portrait from the OASIS women’s catalogue' },
  { title: 'Spa & Massage', filter: 'spa', image: '/images/men-massage.jpg', alt: 'Spa and massage service image from the existing OASIS catalogue' },
];

const mostLovedCards = [
  {
    key: 'keratin',
    title: 'Keratin Treatment',
    description: 'A keratin treatment option from the OASIS hair catalogue.',
    image: '/images/women-hair-smoothing.jpg',
    alt: 'Keratin hair treatment being styled in a salon',
    matches: (service: SalonService) => service.category === 'Keratin Treatment',
    preferred: (service: SalonService) => service.hairLength === 'short',
    objectPosition: 'center 35%',
  },
  {
    key: 'facial',
    title: 'Classic Facial',
    description: 'Classic facial care from the OASIS service catalogue.',
    image: '/images/women-facial.jpg',
    alt: 'A customer receiving a facial treatment',
    matches: (service: SalonService) => service.category === 'Classic Facial',
    preferred: (service: SalonService) => service.name === 'Basic Facial',
    objectPosition: 'center 38%',
  },
  {
    key: 'beard',
    title: 'Beard Trimming & Styling',
    description: 'A beard trim and styling service from the men’s grooming catalogue.',
    image: '/images/men-grooming.jpg',
    alt: 'A neatly groomed beard and hairstyle',
    matches: (service: SalonService) => service.name === 'Beard Trimming & Styling',
    preferred: () => true,
    objectPosition: 'center 28%',
  },
  {
    key: 'massage',
    title: 'Body Spa & Massage',
    description: 'A massage service from the OASIS spa catalogue.',
    image: '/images/men-massage.jpg',
    alt: 'A customer receiving a professional massage',
    matches: (service: SalonService) => service.category === 'Body Spa & Massage',
    preferred: (service: SalonService) => service.name === 'Swedish Massage',
    objectPosition: 'center 48%',
  },
];

interface HomePageProps { onNavigate: (view: string, filter?: string) => void; }

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [activeHeroSlide, setActiveHeroSlide] = React.useState(0);
  const [inquiry, setInquiry] = React.useState({ name: '', contact: '', message: '' });
  const [whatsAppDraft, setWhatsAppDraft] = React.useState('');
  const [inquiryError, setInquiryError] = React.useState('');
  const { openBooking, services } = useBooking();
  const lovedServices = mostLovedCards.flatMap((card) => {
    const choices = services.filter((service) => isFixedPriceService(service) && card.matches(service));
    const service = choices.find(card.preferred) ?? choices[0];
    return service ? [{ ...card, service }] : [];
  });

  React.useEffect(() => {
    return startHeroRotation(setActiveHeroSlide, heroSlides.length);
  }, []);

  return (
    <div className="home-page">
      <section
        className={`home-hero${heroSlides[activeHeroSlide].kind === 'service' ? ' home-hero--service' : ''}`}
        data-testid="home-hero-carousel"
        aria-label="OASIS highlights"
        aria-roledescription="carousel"
      >
        <div className="home-hero-media" aria-hidden="true">
          {heroSlides.map((slide, index) => (
            <img
              key={slide.id}
              className={`home-hero-background${index === activeHeroSlide ? ' is-active' : ''}`}
              src={slide.image}
              alt=""
              fetchPriority={index === activeHeroSlide ? 'high' : 'auto'}
            />
          ))}
        </div>
        <div className="home-hero-copy">
          <div className="home-hero-slide-stack">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`home-hero-slide${index === activeHeroSlide ? ' is-active' : ''}${slide.kind === 'welcome' ? ' home-hero-slide--welcome' : ' home-hero-slide--service'}`}
                role="group"
                aria-hidden={index !== activeHeroSlide}
                aria-label={`${index + 1} of ${heroSlides.length}: ${slide.title}`}
                aria-roledescription="slide"
                inert={index !== activeHeroSlide}
              >
                {slide.kind === 'welcome' ? <>
                  <img className="home-hero-logo" src="/images/oasis-logo-transparent.png" alt="THE OASIS ’ UNISEX SALON & SPA" width="1600" height="909" />
                  <h1>Make space for <em>yourself.</em></h1>
                  <p className="home-hero-intro">Hair, beauty and spa care in a considered, welcoming space. Come as you are; leave feeling renewed.</p>
                  <div className="home-actions">
                    <button type="button" className="button-gold" onClick={() => openBooking()}>Book an appointment <ArrowRight size={16} /></button>
                    <button type="button" className="button-quiet-light" onClick={() => onNavigate('services', 'all')}>Explore services</button>
                  </div>
                  <a className="hero-location" href={SALON_INFO.googleMaps.url} target="_blank" rel="noreferrer"><MapPin size={14} /> Providence Plaza, Puttur</a>
                </> : <>
                  <img className="home-hero-service-logo" src="/images/oasis-logo-transparent.png" alt="THE OASIS UNISEX SALON & SPA" width="900" height="511" />
                  <p className="eyebrow">THE OASIS · PUTTUR</p>
                  <h1>{slide.heading}</h1>
                  <p className="home-hero-quote">“{slide.quote}”</p>
                  <button type="button" className="button-gold" onClick={() => onNavigate('services', slide.filter)}>
                    {slide.action} <ArrowRight size={16} />
                  </button>
                </>}
              </div>
            ))}
          </div>
        </div>
        <a href="#salon-services" className="hero-scroll" aria-label="Scroll to salon services"><ArrowDown size={16} /></a>
      </section>

      <section id="salon-services" className="home-category-section" aria-label="Service categories">
        <div className="home-category-grid">
          {collections.map((collection) => (
            <button key={collection.filter} type="button" className="home-category-card" onClick={() => onNavigate('services', collection.filter)}>
              <img src={collection.image} alt={collection.alt} width="900" height="1350" loading="lazy" />
              <span>{collection.title}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="home-popular-section home-most-loved-section" aria-labelledby="most-loved-heading">
        <div className="home-section-heading">
          <div><p className="eyebrow">Selected from our catalogue</p><h2 id="most-loved-heading">Most Loved at OASIS</h2></div>
          <button type="button" className="text-link" onClick={() => onNavigate('services', 'all')}>View all services <ArrowRight size={16} /></button>
        </div>
        {lovedServices.length > 0 ? <div className="home-most-loved-grid">
          {lovedServices.map((card) => <button type="button" className="home-loved-card" key={card.key} onClick={() => openBooking(card.service)} aria-label={`Book ${card.title}, ${getCataloguePriceLabel(card.service)}`}>
            <img src={card.image} alt={card.alt} loading="lazy" style={{ objectPosition: card.objectPosition }} />
            <span className="home-loved-card-copy"><strong>{card.title}</strong>{card.service.name !== card.title && <span className="home-loved-card-service-name">{card.service.name}</span>}<span className="home-loved-card-description">{card.key === 'keratin' && card.service.hairLength ? `Keratin care for ${card.service.hairLength.replace('_', ' ')} hair.` : card.description}</span><span className="home-loved-card-price">{getCataloguePriceLabel(card.service)}</span></span>
          </button>)}
        </div> : <p className="home-most-loved-empty" role="status">Featured services will appear here when the catalogue is available.</p>}
      </section>

      <section className="home-review-section home-guest-feedback-section" aria-labelledby="guest-feedback-heading">
        <div className="home-section-heading home-review-heading"><div><p className="eyebrow">Guest feedback</p><h2 id="guest-feedback-heading">Guest Feedback</h2><p className="home-guest-feedback-subtitle">Every visit, a little more special.</p></div></div>
        <div className="home-review-empty" role="status">
          <p className="home-review-empty-title">Your experience matters to us. Guest reviews will appear here soon.</p>
        </div>
      </section>

      <section className="home-story-section" aria-labelledby="home-story-heading">
        <p className="eyebrow">THE OASIS ’ Puttur</p><h2 id="home-story-heading">A little space to feel at home</h2><p>{SALON_INFO.tagline}. Find us at Providence Plaza in Puttur.</p>
        <button type="button" className="text-link" onClick={() => onNavigate('about')}>Our Story <ArrowRight size={16} /></button>
      </section>

      <section className="home-map-section" aria-labelledby="home-map-heading">
        <div className="home-map-copy"><p className="eyebrow">Find THE OASIS</p><h2 id="home-map-heading">Easy to Find</h2><p>{SALON_INFO.fullAddress}</p><p className="map-landmark">Down the road from Ujjivan Small Finance Bank ’ Puttur Branch.</p><a className="text-link" href={SALON_INFO.googleMaps.url} target="_blank" rel="noreferrer">Get directions <ArrowRight size={16} /></a></div>
        <iframe title="Google Maps search for THE OASIS at verified Plus Code Q665+67R" src={SALON_INFO.googleMaps.embedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </section>

      <section className="home-instagram-section" aria-labelledby="home-instagram-heading">
        <div><p className="eyebrow">Follow THE OASIS</p><h2 id="home-instagram-heading">Instagram</h2><p>See updates from the salon on {SALON_INFO.instagram.handle}.</p></div>
        <a href={SALON_INFO.instagram.url} target="_blank" rel="noreferrer" className="home-instagram-link"><InstagramIcon className="h-4 w-4" /> Visit Instagram <ArrowRight size={16} /></a>
      </section>

      <section className="home-inquiry-section" aria-labelledby="home-inquiry-heading">
        <div><p className="eyebrow">A question before your visit?</p><h2 id="home-inquiry-heading">We Would Love to Hear From You</h2><p>Share a few details and we’ll prepare a message for WhatsApp. It is sent only when you press Send there.</p></div>
        <form className="oasis-inquiry-form" onSubmit={(event) => { event.preventDefault(); const value = inquiry.contact.trim(); const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); const isPhone = /^[+\d][\d\s().-]{6,}$/.test(value); if (!isEmail && !isPhone) { setInquiryError('Enter a valid email address or phone number.'); setWhatsAppDraft(''); return; } setInquiryError(''); const text = `Hello THE OASIS UNISEX SALON & SPA. My name is ${inquiry.name}. Contact: ${inquiry.contact}. ${inquiry.message}`; setWhatsAppDraft(`https://wa.me/91${SALON_INFO.phones[0].raw}?text=${encodeURIComponent(text)}`); }}>
          <label>Your name<input required value={inquiry.name} onChange={(event) => setInquiry({ ...inquiry, name: event.target.value })} autoComplete="name" /></label>
          <label>Email or phone<input required value={inquiry.contact} onChange={(event) => setInquiry({ ...inquiry, contact: event.target.value })} autoComplete="email" /></label>
          {inquiryError && <p role="alert" className="inquiry-error">{inquiryError}</p>}
          <label>Your message<textarea required rows={4} value={inquiry.message} onChange={(event) => setInquiry({ ...inquiry, message: event.target.value })} /></label>
          <button className="button-dark" type="submit">Prepare WhatsApp message <ArrowRight size={16} /></button>
          {whatsAppDraft && <a className="inquiry-whatsapp-link" href={whatsAppDraft} target="_blank" rel="noreferrer">Open WhatsApp and press Send</a>}
        </form>
      </section>
    </div>
  );
};
