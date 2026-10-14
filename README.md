# THE OASIS UNISEX SALON & SPA â€” Management System

> **Location:** 2nd Floor, Providence Plaza, Main Road, Yelmudi Bridge, Puttur, D.K., Karnataka â€” 574201
> **Phones:** +91 91515 50077 | +91 77604 51767
> **Instagram:** [@the_oasis_official](https://instagram.com/the_oasis_official)

---

## Project Overview

## Current Implementation Notes

- `src/lib/db.ts` currently stores services, appointments, schedules, payments and audit events in this browser's `localStorage`. The Supabase schema and client exist, but the application data layer does not yet read or write those tables. Adding Supabase credentials alone does not enable shared persistence.
- Supabase URL and public key are not configured in `.env`, so sign-in, registration, and verified dashboard access are unavailable in this checkout.
- The auth UI is wired to Supabase email/password auth and reads each signed-in user's role from `profiles`. The versioned migration installs a signup trigger that assigns `customer`; staff/admin roles require an authorized role change.
- The versioned database migrations are prepared locally and have not been applied to a Supabase project. The legacy `schema.sql` and `seed.sql` are not safe deployment scripts. The app's `src/lib/db.ts` still stores appointments and dashboard data in browser `localStorage`; those operations are not yet backed by Supabase RLS.
- Public pages remain available without an account. Appointment confirmation requires a signed-in customer; without Supabase credentials, the sign-in form explains why it cannot proceed.
- `Women-oasis.pdf` and `Oasis-men's Catalog.pdf` were not present in the inspected workspace. The catalogue values already in `salonData.ts` were preserved, but their source prices and listed durations could not be independently verified during this work.
- `.env` contains salon email and enquiry endpoint configuration, but a test submission returned HTTP 404. Email delivery is not verified; check the server endpoint path and provider setup. Keep provider credentials on the server.
- Google Maps directions use the supplied salon address as a search destination. The exact business pin has not been verified.

These notes describe the current prototype; they are not a claim that production authentication, shared storage, email delivery, or map-pin verification is complete.

Salon website and local management prototype built with **React 19 + TypeScript + Vite**, featuring:

- **Customer website** â€” service catalogue, appointment booking, account details, about & contact
- **Admin dashboard** â€” appointments, services, staff, payments, business hours, reports & audit log
- **Staff dashboard** â€” daily schedule, queue management, real-time appointment status
- **Booking engine** â€” double-booking prevention, slot availability, multi-service selection
- **Role dashboards** â€” customer / staff / admin pages retained; staff/admin access requires verified authentication
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

## Authentication Status

Sign-in and registration use Supabase Auth when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured. Dashboard links and routes require a matching role read from the signed-in user's `profiles` row. No staff/admin credentials are built into the app; an administrator must assign those roles in the database. Until the schema is deployed, Supabase is configured, and account roles exist, staff/admin dashboards cannot be accessed. Dashboard and appointment data operations still use browser `localStorage`, so role-gated screens are not yet a secure server-backed management system.

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

3. The legacy `supabase/schema.sql` and `supabase/seed.sql` are reference files
   from the browser prototype. Do not run them in SQL Editor: their policies
   allow unsafe direct writes, and their sample catalogue and IDs do not match
   the current frontend.

4. Review the versioned migrations in `supabase/migrations/`. Migrations
   `20261014000100` and `20261014000200` are a **fresh-database baseline only**,
   not an upgrade for an existing hosted database. This checkout's
   `supabase/config.toml` explicitly disables Supabase CLI seed discovery, so
   the legacy `supabase/seed.sql` cannot run during a database reset. Do not
   run that legacy file manually: it targets the browser prototype and has
   incompatible staff columns and catalogue IDs. The later versioned
   reference-data migration inserts only the reviewed public service catalogue
   and staff roster; it does not create staff contacts or qualifications. Test
   locally with a disposable stack:
   ```bash
   supabase start
   supabase db reset
   supabase test db
   supabase stop
   ```
   These commands operate on the local stack; do not run `supabase link` for
   this test. `supabase db reset` recreates the local database and applies the
   migrations from scratch. Existing hosted databases may contain conflicting
   objects or data; this baseline contains create operations and must not be
   applied to them as an upgrade. It does not intentionally drop tables or
   delete data, but will fail where those objects already exist.

5. Migration `20261014000300` adds source keys, pricing metadata, hair-length
   snapshots, and admin-only private-contact access. Migration `20261014000400`
   seeds 133 services and four public staff rows idempotently from the checked-in
   review CSVs. Existing rows with a matching source key are preserved without
   being overwritten. Variable-price services remain unavailable to booking
   until a secure salon price-confirmation flow is implemented. No staff-service
   qualifications are seeded because the salon has not confirmed them.

6. Add your credentials to `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
   ```

> The current application data methods still use `localStorage`; configuring Supabase credentials alone will not connect them.

### Initial administrator and payment limits

The signup trigger creates every new account as a customer and ignores role
metadata. After an owner verifies the first administrator account, an authorized
database owner must promote that existing profile exactly once through the
Supabase SQL Editor (or a trusted owner-only database session):

```sql
UPDATE public.profiles
SET role = 'admin', updated_at = now()
WHERE id = '<verified-auth-user-uuid>' AND role = 'customer';
```

Replace the placeholder with the UUID shown for that verified account in
Supabase Authentication. Review the affected row count before executing. This
is an owner-operated bootstrap step; no public RPC, client control, or built-in
admin account exists. Thereafter, administrators assign roles with the
`admin_set_profile_role` RPC. Do not run this bootstrap on a hosted project
until its schema and migration history have been independently reviewed.

The current SQL payment operation records one completed, full-appointment
payment per appointment. Failed-payment retries, partial payments, and refunds
are not implemented. The `failed` and `refunded` enum values do not imply those
workflows are supported; do not use them as operational features yet.

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
â”‚   â”œâ”€â”€ MyAccountPage.tsx     # Customer account details
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
â”‚   â””â”€â”€ salonData.ts           # Services, staff, business hours and reviews
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
