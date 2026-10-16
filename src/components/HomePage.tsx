import React from 'react';
import { ArrowDown, ArrowRight, MapPin, Phone } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { SALON_INFO } from '../constants/salonData';
import { getCataloguePriceLabel } from '../lib/formatters';
import { isFixedPriceService } from '../lib/serviceMapper';

const collections = [
  { eyebrow: 'For him', title: "Men's grooming", filter: 'men', image: '/images/men-grooming.jpg', alt: 'Men’s grooming portrait from the OASIS men’s catalogue', copy: 'Considered cuts, colour and restorative care, tailored to your routine.' },
  { eyebrow: 'For her', title: "Women's beauty", filter: 'women', image: '/images/women-beauty.jpg', alt: 'Women’s beauty portrait from the OASIS women’s catalogue', copy: 'Hair, skin and beauty rituals for the moments you want to make your own.' },
];

const featured = [
  { category: 'Hair Cutting', image: '/images/men-haircut.jpg', alt: 'A stylist shaping a short haircut from the men’s catalogue', gender: 'men' },
  { category: 'Premium Facial', image: '/images/women-facial.jpg', alt: 'A facial treatment from the women’s catalogue', gender: 'women' },
  { category: 'Hair Spa', image: '/images/men-hair-spa.jpg', alt: 'A restorative hair spa from the men’s catalogue', gender: 'men' },
];

interface HomePageProps { onNavigate: (view: string, filter?: string) => void; }

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { openBooking, services, catalogueLoading, catalogueError } = useBooking();
  const highlights = featured.map((item) => ({
    ...item,
    service: services.find((service) => service.category === item.category && (service.gender === item.gender || service.gender === 'unisex')),
  })).filter((item) => item.service);

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">A little time, beautifully spent · Puttur</p>
          <img className="home-hero-logo" src="/images/oasis-logo.jpg" alt="THE OASIS — UNISEX SALON & SPA" width="1450" height="660" />
          <h1>Make space for <em>yourself.</em></h1>
          <p className="home-hero-intro">Hair, beauty and spa care in a considered, welcoming space. Come as you are; leave feeling renewed.</p>
          <div className="home-actions">
            <button type="button" className="button-gold" onClick={() => openBooking()}>Book an appointment <ArrowRight size={16} /></button>
            <button type="button" className="button-quiet-light" onClick={() => onNavigate('services', 'all')}>Explore services</button>
          </div>
          <a className="hero-location" href={SALON_INFO.googleMaps.url} target="_blank" rel="noreferrer"><MapPin size={14} /> Providence Plaza, Puttur</a>
        </div>
        <div className="home-hero-photo">
          <img src="/images/salon-interior.jpg" alt="Warm ivory salon interior with illuminated mirrors and black styling chairs" width="904" height="1600" fetchPriority="high" />
          <span className="photo-caption">A calm place to reset</span>
        </div>
        <a href="#salon-services" className="hero-scroll" aria-label="Scroll to salon services"><ArrowDown size={16} /></a>
      </section>

      <section className="home-intro section-cream">
        <div className="section-kicker"><span /> The OASIS experience</div>
        <p>Thoughtful care, warm light, and a moment that belongs to you.</p>
      </section>

      <section id="salon-services" className="collection-section">
        {collections.map((collection, index) => (
          <article key={collection.filter} className={index % 2 ? 'collection-row collection-reverse' : 'collection-row'}>
            <div className="collection-image"><img src={collection.image} alt={collection.alt} width="1300" height="826" loading="lazy" /></div>
            <div className="collection-copy">
              <p className="eyebrow">{collection.eyebrow} · THE OASIS</p>
              <h2>{collection.title}</h2>
              <p>{collection.copy}</p>
              <button type="button" className="text-link" onClick={() => onNavigate('services', collection.filter)}>Discover {collection.filter} services <ArrowRight size={16} /></button>
            </div>
          </article>
        ))}
      </section>

      <section className="featured-section section-cream">
        <div className="section-heading">
          <div><p className="eyebrow">From the catalogue</p><h2>A few ways to unwind</h2></div>
          <button type="button" className="text-link" onClick={() => onNavigate('services', 'all')}>View all services <ArrowRight size={16} /></button>
        </div>
        {catalogueLoading && <p role="status" className="catalogue-message">Loading the live service catalogue…</p>}
        {catalogueError && <p role="alert" className="catalogue-message">{catalogueError}</p>}
        {!catalogueLoading && !catalogueError && highlights.length === 0 && <p role="status" className="catalogue-message">Browse the service catalogue or contact the salon to plan your visit.</p>}
        {highlights.length > 0 && <div className="featured-grid">
          {highlights.map(({ service, image, alt }) => service && (
            <article className="featured-item" key={service.id}>
              <img src={image} alt={alt} width="950" height="1250" loading="lazy" />
              <div className="featured-meta"><p className="eyebrow">{service.gender === 'unisex' ? 'Unisex' : service.gender + "'s"} · {service.category}</p><h3>{service.name}</h3><div className="featured-price"><span>{getCataloguePriceLabel(service)}</span><button type="button" onClick={() => openBooking(service)} disabled={!isFixedPriceService(service)}>{isFixedPriceService(service) ? 'Book' : 'Details'}</button></div></div>
            </article>
          ))}
        </div>}
      </section>

      <section className="experience-section">
        <div className="experience-photo"><img src="/images/salon-interior.jpg" alt="The softly lit OASIS salon interior" width="904" height="1600" loading="lazy" /></div>
        <div className="experience-copy"><p className="eyebrow">Your time at OASIS</p><h2>Arrive as you are.<br /><em>Leave a little lighter.</em></h2><p>A warm welcome, a comfortable chair, and care shaped around what you need that day. Find us at Providence Plaza in Puttur.</p><button type="button" className="button-dark" onClick={() => onNavigate('about')}>A little about us <ArrowRight size={16} /></button></div>
      </section>

      <section className="visit-section">
        <div><p className="eyebrow">Plan your visit</p><h2>Your next pause<br />is waiting.</h2></div>
        <p className="visit-address"><MapPin size={17} /> 2nd Floor, Providence Plaza<br />Main Road, Yelmudi Bridge<br />Puttur, Karnataka</p>
        <div className="visit-actions"><button type="button" className="button-gold" onClick={() => openBooking()}>Book a visit <ArrowRight size={16} /></button><a href={'tel:' + SALON_INFO.phones[0].raw}><Phone size={15} /> {SALON_INFO.phones[0].display}</a></div>
      </section>
    </div>
  );
};
