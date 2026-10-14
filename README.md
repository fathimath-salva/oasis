# THE OASIS UNISEX SALON & SPA â€” Management System

> **Location:** 2nd Floor, Providence Plaza, Main Road, Yelmudi Bridge, Puttur, D.K., Karnataka â€” 574201
> **Phones:** +91 91515 50077 | +91 77604 51767
> **Instagram:** [@the_oasis_official](https://instagram.com/the_oasis_official)

---

## Project Overview

## Current Implementation Notes

- `src/lib/db.ts` currently stores services, appointments, schedules, payments and audit events in this browser's `localStorage`. The Supabase schema and client exist, but the application data layer does not yet read or write those tables. Adding Supabase credentials alone does not enable shared persistence.
- Supabase URL and public key were not configured in `.env` at the time of this review.
- The role switcher and sample accounts are development-only. The current sign-in form is a prototype and is not production authentication. Configure Supabase Auth and enforce roles with database policies before using staff or administrator access in production.
- Production customer login and registration are intentionally disabled until a real authentication provider is configured. The booking flow preserves selections but blocks confirmation for signed-out visitors.
- `Women-oasis.pdf` and `Oasis-men's Catalog.pdf` were not present in the inspected workspace. The catalogue values already in `salonData.ts` were preserved, but their source prices and listed durations could not be independently verified during this work.
- `.env` contains salon email and enquiry endpoint configuration, but a test submission returned HTTP 404. Email delivery is not verified; check the server endpoint path and provider setup. Keep provider credentials on the server.
- Google Maps directions use the supplied salon address as a search destination. The exact business pin has not been verified.

These notes describe the current prototype; they are not a claim that production authentication, shared storage, email delivery, or map-pin verification is complete.

Salon website and local management prototype built with **React 19 + TypeScript + Vite**, featuring:

- **Premium customer website** â€” service catalogue, appointment booking, gallery, about & contact
- **Admin dashboard** â€” appointments, services, staff, payments, business hours, reports & audit log
- **Staff dashboard** â€” daily schedule, queue management, real-time appointment status
- **Booking engine** â€” double-booking prevention, slot availability, multi-service selection
- **Role dashboards** â€” customer / staff / admin views, with development-only demo controls
- **Local prototype storage** â€” `localStorage` persistence via `db.ts`; Supabase CRUD is not connected

---

## Tech Stack

| Layer      | Technology                                     |
|------------|------------------------------------------------|
| UI         | React 19, TypeScript, Vite 8                  |
| Styling    | Tailwind CSS v4 (`@tailwindcss/vite`)          |
| Icons      | Lucide React                                   |
| DB (local) | `localStorage` JSON persistence (`src/lib/db.ts`) |
| DB (planned) | Supabase schema in `supabase/`; application CRUD is not connected |
| Fonts      | Cormorant Garamond (serif) Â· Plus Jakarta Sans (sans) via Google Fonts |

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

## Development Demo Accounts

| Role     | Name                | Email                    |
|----------|---------------------|--------------------------|
| Admin    | Salon Director      | admin@oasis-salon.in     |
| Staff    | Ramesh Shetty       | ramesh@oasis-salon.in    |
| Customer | Kavya Rai           | kavya.rai@example.com    |

> In development, open the Account menu to switch demo roles. These sample accounts are not secure authentication and must not be used in production.

---

## Service Catalogue

The existing catalogue data is in `src/constants/salonData.ts`, separated by service gender and category. The official PDFs were not present in the workspace during this review, so compare this data with the salon's current catalogues before treating every price or duration as independently verified.

---

## Database & Supabase Setup

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Create a new Supabase project at [supabase.com](https://supabase.com)

3. Run the schema in **Supabase SQL Editor**:
   - `supabase/schema.sql` â€” tables, enums, RLS policies, indexes
   - `supabase/seed.sql` â€” initial services, staff, business hours

4. Add your credentials to `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
   ```

> The current application data methods still use `localStorage`; configuring Supabase credentials alone will not connect them.

---

## Project Structure

```
src/
â”œâ”€â”€ components/         # UI components & pages
â”‚   â”œâ”€â”€ AdminDashboard.tsx    # Full admin panel (9 tabs)
â”‚   â”œâ”€â”€ StaffDashboard.tsx    # Staff daily view
â”‚   â”œâ”€â”€ BookingModal.tsx      # 5-step booking wizard
â”‚   â”œâ”€â”€ ServicesPage.tsx      # Service catalogue with filters
â”‚   â”œâ”€â”€ MyAppointmentsPage.tsx # Customer appointment management
â”‚   â”œâ”€â”€ HomePage.tsx          # Landing page
â”‚   â”œâ”€â”€ GalleryPage.tsx       # Photo gallery
â”‚   â”œâ”€â”€ AboutPage.tsx         # About the salon
â”‚   â”œâ”€â”€ ContactPage.tsx       # Contact & map
â”‚   â”œâ”€â”€ Footer.tsx            # Global footer
â”‚   â”œâ”€â”€ Navbar.tsx            # Responsive navigation and account menu
â”‚   â””â”€â”€ AuthModal.tsx         # Login / register modal
â”œâ”€â”€ context/
â”‚   â”œâ”€â”€ AuthContext.tsx        # User auth state & role management
â”‚   â””â”€â”€ BookingContext.tsx     # Booking wizard state machine
â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ db.ts                  # Full CRUD database layer (localStorage)
â”‚   â”œâ”€â”€ formatters.ts          # INR, date, time formatters
â”‚   â””â”€â”€ supabase.ts            # Supabase client (cloud)
â”œâ”€â”€ constants/
â”‚   â””â”€â”€ salonData.ts           # All services, staff, hours, reviews, gallery
â””â”€â”€ types/
    â””â”€â”€ salon.ts               # TypeScript interfaces
supabase/
â”œâ”€â”€ schema.sql                 # PostgreSQL schema with RLS
â””â”€â”€ seed.sql                   # Initial data seed
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

Fonts: **Cormorant Garamond** (headings) Â· **Plus Jakarta Sans** (body)
