# THE OASIS UNISEX SALON & SPA — Management System

> **Location:** 2nd Floor, Providence Plaza, Main Road, Yelmudi Bridge, Puttur, D.K., Karnataka — 574201
> **Phones:** +91 91515 50077 | +91 77604 51767
> **Instagram:** [@the_oasis_official](https://instagram.com/the_oasis_official)

---

## Project Overview

## Current Implementation Notes

- `src/lib/db.ts` currently stores services, appointments, schedules, payments and audit events in this browser's `localStorage`. The Supabase schema and client exist, but the application data layer does not yet read or write those tables. Adding Supabase credentials alone does not enable shared persistence.
- The role switcher and sample accounts are development-only. The current sign-in form is a prototype and is not production authentication. Configure Supabase Auth and enforce roles with database policies before using staff or administrator access in production.
- `Women-oasis.pdf` and `Oasis-men's Catalog.pdf` were not present in the inspected workspace. The catalogue values already in `salonData.ts` were preserved, but their source prices and listed durations could not be independently verified during this work.
- Email enquiries require both `VITE_SALON_EMAIL` and `VITE_ENQUIRY_ENDPOINT`. The endpoint must be a server-side integration that sends mail and must reject invalid or duplicate submissions. Do not put email-provider credentials in frontend environment variables.
- Google Maps directions use the supplied salon address as a search destination. The exact business pin has not been verified.

These notes describe the current prototype; they are not a claim that production authentication, shared storage, email delivery, or map-pin verification is complete.

Full-stack salon management web application built with **React 19 + TypeScript + Vite**, featuring:

- **Premium customer website** — service catalogue, appointment booking, gallery, about & contact
- **Admin dashboard** — appointments, services, staff, payments, business hours, reports & audit log
- **Staff dashboard** — daily schedule, queue management, real-time appointment status
- **Booking engine** — double-booking prevention, slot availability, multi-service selection
- **Role-based access** — customer / staff / admin (with demo role switcher for testing)
- **Local-first database** — `localStorage` persistence via `db.ts` (drop-in replacement with Supabase when credentials are configured)

---

## Tech Stack

| Layer      | Technology                                     |
|------------|------------------------------------------------|
| UI         | React 19, TypeScript, Vite 8                  |
| Styling    | Tailwind CSS v4 (`@tailwindcss/vite`)          |
| Icons      | Lucide React                                   |
| DB (local) | `localStorage` JSON persistence (`src/lib/db.ts`) |
| DB (cloud) | Supabase (PostgreSQL + RLS) — schema in `supabase/` |
| Fonts      | Cormorant Garamond (serif) · Plus Jakarta Sans (sans) via Google Fonts |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app runs at **http://localhost:5173** (or next available port).

---

## Demo Accounts (Role Switcher in Navbar)

| Role     | Name                | Email                    |
|----------|---------------------|--------------------------|
| Admin    | Salon Director      | admin@oasis-salon.in     |
| Staff    | Ramesh Shetty       | ramesh@oasis-salon.in    |
| Customer | Kavya Rai           | kavya.rai@example.com    |

> Use the **role switcher pill** in the navbar to switch between roles and test all dashboards.

---

## Service Catalogue

All services and prices are sourced from the two official catalogues:

- **Women's services** — `Women-oasis.pdf` (Baby Cut ₹100 → Keratin Extra Long ₹10,000+)
- **Men's services** — `Oasis-men's Catalog.pdf` (Baby Haircut ₹100 → Full Body Waxing ₹2,200)

Men's and women's prices are strictly separate (e.g., Keratin Spa: Women ₹1,999 / Men ₹900).

---

## Database & Supabase Setup

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Create a new Supabase project at [supabase.com](https://supabase.com)

3. Run the schema in **Supabase SQL Editor**:
   - `supabase/schema.sql` — tables, enums, RLS policies, indexes
   - `supabase/seed.sql` — initial services, staff, business hours

4. Add your credentials to `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
   ```

> Until Supabase credentials are configured, the app operates fully with `localStorage`.

---

## Project Structure

```
src/
├── components/         # UI components & pages
│   ├── AdminDashboard.tsx    # Full admin panel (9 tabs)
│   ├── StaffDashboard.tsx    # Staff daily view
│   ├── BookingModal.tsx      # 5-step booking wizard
│   ├── ServicesPage.tsx      # Service catalogue with filters
│   ├── MyAppointmentsPage.tsx # Customer appointment management
│   ├── HomePage.tsx          # Landing page
│   ├── GalleryPage.tsx       # Photo gallery
│   ├── AboutPage.tsx         # About the salon
│   ├── ContactPage.tsx       # Contact & map
│   ├── Footer.tsx            # Global footer
│   ├── Navbar.tsx            # Sticky navbar with role switcher
│   └── AuthModal.tsx         # Login / register modal
├── context/
│   ├── AuthContext.tsx        # User auth state & role management
│   └── BookingContext.tsx     # Booking wizard state machine
├── lib/
│   ├── db.ts                  # Full CRUD database layer (localStorage)
│   ├── formatters.ts          # INR, date, time formatters
│   └── supabase.ts            # Supabase client (cloud)
├── constants/
│   └── salonData.ts           # All services, staff, hours, reviews, gallery
└── types/
    └── salon.ts               # TypeScript interfaces
supabase/
├── schema.sql                 # PostgreSQL schema with RLS
└── seed.sql                   # Initial data seed
```

---

## Design System

| Token            | Colour     | Usage                       |
|------------------|------------|-----------------------------|
| `oasis-forest`   | `#26352A`  | Primary text, CTAs, hero BG |
| `oasis-ivory`    | `#F5F1E8`  | Page background             |
| `oasis-eucalyptus`| `#E3E9DF` | Soft section backgrounds    |
| `oasis-gold`     | `#D8C9A7`  | Accents, dividers, badges   |
| `oasis-sage`     | `#A8B7A0`  | Secondary text, scrollbars  |

Fonts: **Cormorant Garamond** (headings) · **Plus Jakarta Sans** (body)
