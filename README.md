# THE OASIS UNISEX SALON & SPA — Management System

> **Location:** 2nd Floor, Providence Plaza, Main Road, Yelmudi Bridge, Puttur, D.K., Karnataka — 574201
> **Phones:** +91 91515 50077 | +91 77604 51767
> **Instagram:** [@the_oasis_official](https://instagram.com/the_oasis_official)

---

## Project Overview

## Current Implementation Notes

- The public service catalogue and booking availability are read from Supabase through the read-only repository. Appointment creation remains disabled. Admin, staff, and customer appointment-management screens still use this browser's `localStorage` prototype data.
- Sign-in, registration, and verified dashboard access require configured public Supabase credentials and a deployed schema.
- The auth UI is wired to Supabase email/password auth and reads each signed-in user's role from `profiles`. The versioned migration installs a signup trigger that assigns `customer`; staff/admin roles require an authorized role change. Separate `/admin-login` and `/staff-login` entry points continue only when the loaded profile has the matching verified role.
- The versioned database migrations are prepared locally and have not been applied to a Supabase project. The legacy `schema.sql` and `seed.sql` are not safe deployment scripts. The app's `src/lib/db.ts` still stores appointments and dashboard data in browser `localStorage`; those operations are not yet backed by Supabase RLS.
- Public pages remain available without an account. Appointment confirmation requires a signed-in customer; without Supabase credentials, the sign-in form explains why it cannot proceed.
- `Women-oasis.pdf` and `Oasis-men's Catalog.pdf` were not present in the inspected workspace. Catalogue prices and durations could not be independently verified during this work.
- `.env` contains salon email and enquiry endpoint configuration, but a test submission returned HTTP 404. Email delivery is not verified; check the server endpoint path and provider setup. Keep provider credentials on the server.
- Google Maps directions use the supplied salon address as a search destination. The exact business pin has not been verified.

These notes describe the current prototype; they are not a claim that production authentication, shared storage, email delivery, or map-pin verification is complete.

Salon website and local management prototype built with **React 19 + TypeScript + Vite**, featuring:

- **Customer website** — live service catalogue, read-only availability, account details, about & contact
- **Admin dashboard** — appointments, services, staff, payments, business hours, reports & audit log
- **Staff dashboard** — daily schedule, queue management, real-time appointment status
- **Booking prototype** — live slots are read-only; appointment confirmation remains disabled
- **Role dashboards** — customer / staff / admin pages retained; staff/admin access requires verified authentication
- **Prototype management data** — appointment and dashboard CRUD remains in browser `localStorage`

---

## Tech Stack

| Layer      | Technology                                     |
|------------|------------------------------------------------|
| UI         | React 19, TypeScript, Vite 8                  |
| Styling    | Tailwind CSS v4 (`@tailwindcss/vite`)          |
| Icons      | Lucide React                                   |
| DB (local) | `localStorage` JSON persistence (`src/lib/db.ts`) |
| DB (partial) | Supabase Auth and read-only service/availability queries; dashboard CRUD remains local |
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

## Client Demo Access and Vercel Preparation

- Customer Sign In and Register remain in the Account menu. Registration submits only customer details; the database signup trigger assigns the customer role.
- Admin Login and Staff Login are separate links in the footer's Team Access section and are also available at `/admin-login` and `/staff-login`. Both use Supabase email/password authentication and continue only when the loaded profile has the matching verified role. No privileged account is provisioned by the website.
- Preview Admin Dashboard and Preview Staff Dashboard use isolated fictional sample data. They do not grant real dashboard access.
- The booking modal's Demo Booking Preview uses clearly labelled sample services and fictional times. It never checks a real slot or creates an appointment. Live booking confirmation and payments remain disabled.

### Vercel settings (not deployed from this checkout)

The frontend root is the repository root (`D:\oasis` locally; set Vercel's Root Directory to `.`). Vercel should use the Vite framework preset, `npm run build` as the build command, and `dist` as the output directory. `vercel.json` rewrites client routes to `index.html`; navigation supports direct links and refreshes for customer, demo, login, recovery, and protected dashboard paths. Paths do not grant roles; protected views still wait for a Supabase session and verified database profile.

For a demo deployment, configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel with the existing **Oasis-Test** project's public URL and public anon/publishable key. These `VITE_` values are bundled into browser code and must never contain service-role keys or other secrets. Do not use production-project credentials for the client demo. The repository's `.env` is ignored by Git and was not changed.

Before presenting, allow the exact local and Vercel demo origins and password callback URLs in the Oasis-Test Auth URL configuration, then test customer registration/sign-in, profile loading, role-specific login mismatch, and recovery using test accounts. This repository cannot confirm remote provider settings, existing account roles, or the live schema. Do not claim live authentication until tested against Oasis-Test. Dashboard CRUD remains a browser-local prototype, while the read-only catalogue and availability call Supabase. Appointment creation and payments remain disabled.

---

## Authentication Status

Sign-in and registration use Supabase Auth when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured. Dashboard links and routes require a matching role read from the signed-in user's `profiles` row. No staff/admin credentials are built into the app; an administrator must assign those roles in the database. Until the schema is deployed, Supabase is configured, and account roles exist, staff/admin dashboards cannot be accessed. Dashboard and appointment operations still use browser `localStorage`, so those screens are not yet secure server-backed management tools. The booking modal can read the service catalogue and slot availability, but does not create or manage appointments.

Signup and confirmation resend links now return to the origin hosting the app
(for local Vite development, normally `http://localhost:5173/`). In Supabase
Auth URL Configuration, allow the actual local origin(s) and the intended demo
deployment origin. The deployment origin is not recorded in this repository,
so verify its exact hostname before adding it; this code does not change the
Supabase Site URL, redirect allowlist, or confirmation-email settings. The
Supabase client detects Auth callbacks on the app origin. Password reset uses `resetPasswordForEmail()` and returns to:

- Local Vite: `http://localhost:5173/reset-password` (also allow `http://127.0.0.1:5173/reset-password` if you use that host).
- Vercel: `https://<verified-vercel-host>/reset-password` (replace with the exact assigned hostname).

For Oasis-Test, set **Authentication → URL Configuration → Site URL** to the actual deployed HTTPS site origin (no path), and add these exact entries under **Redirect URLs**:

- `http://localhost:5173/` (customer signup and confirmation resend)
- `http://localhost:5173/reset-password`
- `http://127.0.0.1:5173/` if local testing uses that host
- `http://127.0.0.1:5173/reset-password` only if local testing uses that host
- `https://<actual-vercel-host>/` (customer signup and confirmation resend)
- `https://<actual-vercel-host>/reset-password` (replace the placeholder with the assigned Vercel hostname or custom domain)

Local Vite uses its current local origin. For a production Vercel build, optionally set `VITE_APP_URL` to the exact deployed HTTPS origin (no path); if unset, the app uses the HTTPS origin serving it. Do not guess the Vercel hostname or use `localhost` for a deployed build. These dashboard settings have not been changed or verified. The client explicitly uses Supabase JS's implicit flow with `detectSessionInUrl`; the SDK validates and consumes the callback, and only its `PASSWORD_RECOVERY` event plus a current session permits `updateUser()`. A PKCE code verifier is browser-local, so this cross-device flow intentionally remains implicit. `INITIAL_SESSION` closes verification for invalid/expired links, and a timeout prevents a stuck spinner.

`localhost` means the device opening the link. A phone cannot reach the laptop's `localhost`. Test locally by requesting and opening the email on that same laptop. To test on a phone, request a fresh email from the deployed HTTPS site (or a reachable HTTPS preview); links previously generated on localhost still point to localhost. A phone test of this code requires a Vercel preview/deployment, which has not been performed here. Supabase may return `otp_expired` for an expired or already-used email link; request a fresh reset email after redirect settings and the app build are ready.

### Security alert limitation

Alert delivery is not implemented or verified. The prepared local migration set defines an `audit_logs` table for successful audited database changes and admin role changes, but the prepared schema is not a live hosted event source. The table also does not capture failed sign-ins, RLS denials, password resets, IP identity, or reliable new-device identity. Browser-submitted alerts would be spoofable. The admin recipient is deferred and no mail provider is configured. See [`docs/SECURITY_ALERTS_REVIEW.md`](docs/SECURITY_ALERTS_REVIEW.md) for the server-side event-source and delivery proposal. Do not claim alert coverage until its trusted event source, provider, recipient, rate limits, and retention policy are reviewed and tested.

### Local pre-deployment checklist

1. Configure only the Oasis-Test public Supabase URL/key locally; never place a service-role key in a `VITE_` variable.
2. Run `npm run dev` and verify Home, Services, Our Story, and Contact while signed out.
3. Open `/admin-login`, `/staff-login`, `/forgot-password`, `/reset-password`, `/admin`, and `/staff` directly and refresh. Verify that a URL never grants a role.
4. Register a customer and verify the trusted profile role is `customer`. Test customer access to customer pages and rejection from real admin/staff views. Test that each team role is rejected by the other team's login entry.
5. Request a reset email. Verify the neutral response, allowed callback URL, invalid/expired-link rejection, successful password update, and sign-out using Oasis-Test.
6. Check browser diagnostics for errors and ensure they contain no credentials, tokens, email addresses, or user IDs.
7. Run `npm test`, `npm run build`, and `npm run lint`, then inspect a Vercel preview before deployment.

The real Admin and Staff dashboard components still use browser `localStorage` for management data and operations. React role guards protect navigation, but browser-local CRUD is not a server authorization boundary; do not use these prototype screens for real operational data. Replacing those local paths requires a separate reviewed Supabase repository/API integration. Live booking confirmation and payments remain disabled.

---

## Service Catalogue

The database catalogue is seeded from `supabase/reference-data/service-catalogue-review.csv`; the public pages now query that live table. `src/constants/salonData.ts` remains for prototype pages and categories. The official PDFs were not present in the workspace during this review, so prices and disputed names still require comparison with the salon's current catalogues.

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
   reference-data migration inserts the 133-row public service catalogue and
   four explicitly demo-marked roster rows; it does not create staff contacts
   or qualifications. No holiday closures are seeded. Test
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
   seeds 133 services and four demo-marked staff rows idempotently from the checked-in
   review CSVs. Existing rows with a matching source key are preserved without
   being overwritten. `staff.is_demo` defaults to true so new roster records
   cannot be mistaken for verified employees unless explicitly reviewed.
   Variable-price services remain unavailable to booking
   until a secure salon price-confirmation flow is implemented. No staff-service
   qualifications are seeded because the salon has not confirmed them.

6. Add your credentials to `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
   ```

> The current catalogue and availability reads use Supabase. Appointment creation and all dashboard CRUD still use prototype flows; configuring Supabase credentials does not connect those features.

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

The payment SQL operation is defined but its browser execution privilege is
revoked by migration `20261016000100`. Failed-payment retries, partial
payments, and refunds are not implemented. Do not enable payment recording
until a separately reviewed payment workflow is ready.

### Staff account onboarding and disabled operations

Public registration sends only a name and phone in user metadata. The database
signup trigger ignores all role metadata and creates a `customer` profile. The
frontend also reads the role from that signed-in user's `profiles` row; browser
state, query strings, and local storage are never role sources. The real Admin
and Staff Dashboard routes require an authenticated, successfully loaded
profile with the exact matching role. Demo dashboards remain isolated sample
previews and do not confer either role.

To add an employee, an owner should invite the employee through Supabase Auth
for the reviewed test project. The trigger will initially create a customer
profile. After verifying the identity and the intended employee record, use a
trusted SQL Editor/owner session to promote that exact profile and create/link
its non-demo `public.staff` row. Keep phone and email in `public.staff_private`;
never put contacts in the public staff row. Verify each affected row before
committing. Do not use the browser admin prototype for this provisioning:
dashboard CRUD is still local-only. Add `public.staff_services` qualification
links only after the salon confirms each employee's service qualifications.
The four seeded roster records are demo records and must not be linked to real
accounts.

For a staff account, first confirm the exact Auth UUID and corresponding
customer profile, then run a reviewed owner-only transaction on Oasis-Test.
The following is a template; replace every placeholder with verified values,
and stop if any guarded update or insert affects a different number of rows:

```sql
BEGIN;
DO $$
DECLARE
  v_profile_id uuid := '<verified-auth-user-uuid>';
  v_rows integer;
  v_staff_id uuid;
BEGIN
  UPDATE public.profiles SET role = 'staff', updated_at = now()
  WHERE id = v_profile_id AND role = 'customer';
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows <> 1 THEN RAISE EXCEPTION 'Expected one verified customer profile, changed %', v_rows; END IF;

  INSERT INTO public.staff(profile_id, name, title, is_demo)
  VALUES (v_profile_id, '<verified-public-name>', '<verified-title>', false)
  RETURNING id INTO v_staff_id;
  INSERT INTO public.staff_private(staff_id, phone, email)
  VALUES (v_staff_id, '<verified-private-phone>', '<verified-private-email>');
END $$;
COMMIT;
```

Use the same owner-only process to bootstrap the first salon owner as `admin`
after verifying the account, as shown above. Do not promote an account from the
public client. For later role changes, an already authorized administrator
uses `admin_set_profile_role`; role assignment is recorded in the database
audit log. Keep staff qualifications empty until the salon verifies them.

Migration `20261016000100` revokes browser execution of appointment creation,
cancellation, rescheduling, status changes, and payment recording. Read-only
availability remains available. Do not re-grant these functions until the
salon has confirmed qualifications, the final-price flow is secure, and a
separate end-to-end review has approved booking and payment operation.

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
│   ├── MyAccountPage.tsx     # Customer account details
│   ├── AboutPage.tsx         # About the salon
│   ├── ContactPage.tsx       # Contact & map
│   ├── Footer.tsx            # Global footer
│   ├── Navbar.tsx            # Responsive navigation and account menu
│   └── AuthModal.tsx         # Login / register modal
├── context/
│   ├── AuthContext.tsx        # User auth state & role management
│   └── BookingContext.tsx     # Booking wizard state machine
├── lib/
│   ├── db.ts                  # Full CRUD database layer (localStorage)
│   ├── formatters.ts          # INR, date, time formatters
│   └── supabase.ts            # Supabase client (cloud)
├── constants/
│   └── salonData.ts           # Services, staff, business hours and reviews
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
