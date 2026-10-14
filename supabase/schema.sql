-- ============================================================================
-- THE OASIS UNISEX SALON & SPA — DATABASE SCHEMA
-- Target Database: Supabase PostgreSQL (Postgres 15+)
-- Location: Puttur, Karnataka, India
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing schema if re-running
-- DROP SCHEMA public CASCADE; CREATE SCHEMA public;

-- ----------------------------------------------------------------------------
-- 1. CUSTOM TYPES & ENUMS
-- ----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('customer', 'staff', 'admin');
CREATE TYPE gender_classification AS ENUM ('men', 'women', 'unisex');
CREATE TYPE appointment_status AS ENUM (
  'pending',
  'confirmed',
  'checked_in',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
);
CREATE TYPE payment_method AS ENUM ('cash', 'upi', 'card', 'online');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- ----------------------------------------------------------------------------
-- 2. PROFILES & ROLES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Every new Supabase identity receives a customer profile. Privileged roles
-- must be assigned by an administrator after the account has been created.
CREATE OR REPLACE FUNCTION create_profile_for_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS create_profile_after_auth_signup ON auth.users;
CREATE TRIGGER create_profile_after_auth_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_auth_user();

-- Index for quick profile search by email & phone
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Helper function to check role in RLS
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('staff', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- A profile owner may edit contact details but cannot grant themselves a privileged role.
CREATE OR REPLACE FUNCTION prevent_profile_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Profile identifiers cannot be changed';
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role AND NOT is_admin() THEN
    RAISE EXCEPTION 'Only an authorised administrator can change profile roles';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS prevent_profile_role_escalation_trigger ON profiles;
CREATE TRIGGER prevent_profile_role_escalation_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_profile_role_escalation();

-- ----------------------------------------------------------------------------
-- 3. SERVICES CATALOGUE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  gender gender_classification NOT NULL DEFAULT 'unisex',
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  price_confirmed BOOLEAN NOT NULL DEFAULT false, -- flagged for admin review
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_gender ON services(gender);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

-- ----------------------------------------------------------------------------
-- 4. STAFF MEMBERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  avatar_url TEXT,
  working_days INTEGER[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  start_time TIME NOT NULL DEFAULT '09:00:00',
  end_time TIME NOT NULL DEFAULT '20:30:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS staff_services (
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, service_id)
);

-- ----------------------------------------------------------------------------
-- 5. BUSINESS HOURS & HOLIDAYS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS salon_business_hours (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL UNIQUE CHECK (day_of_week BETWEEN 0 AND 6),
  day_name TEXT NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT true,
  open_time TIME NOT NULL DEFAULT '09:00:00',
  close_time TIME NOT NULL DEFAULT '20:30:00'
);

CREATE TABLE IF NOT EXISTS salon_holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  holiday_date DATE NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------------------------
-- 6. APPOINTMENTS & APPOINTMENT SERVICES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference TEXT NOT NULL UNIQUE, -- OASIS-YYYY-XXXX
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_duration_minutes INTEGER NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  status appointment_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_method payment_method,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT check_time_order CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_staff ON appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_customer ON appointments(customer_id);

CREATE TABLE IF NOT EXISTS appointment_services (
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  service_name TEXT NOT NULL,
  service_price NUMERIC(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  PRIMARY KEY (appointment_id, service_id)
);

-- ----------------------------------------------------------------------------
-- 7. PAYMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  booking_reference TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  payment_method payment_method NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'completed',
  upi_transaction_id TEXT,
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_payments_appointment ON payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(recorded_at);

-- ----------------------------------------------------------------------------
-- 8. AUDIT LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_role user_role NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(created_at DESC);

-- ----------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles:
-- Public can read basic profile info for assigned staff; Users read/edit their own; Admins read all.
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id OR is_admin());

-- Services:
-- Anyone can view active services; Admins can do all modifications.
CREATE POLICY "Public read services" ON services
  FOR SELECT USING (true);

CREATE POLICY "Admin write services" ON services
  FOR ALL USING (is_admin());

-- Staff:
-- Anyone can view active staff; Admins can do all modifications.
CREATE POLICY "Public read staff" ON staff
  FOR SELECT USING (true);

CREATE POLICY "Admin write staff" ON staff
  FOR ALL USING (is_admin());

-- Business hours & holidays:
-- Public read; Admin write.
CREATE POLICY "Public read hours" ON salon_business_hours
  FOR SELECT USING (true);

CREATE POLICY "Admin write hours" ON salon_business_hours
  FOR ALL USING (is_admin());

CREATE POLICY "Public read holidays" ON salon_holidays
  FOR SELECT USING (true);

CREATE POLICY "Admin write holidays" ON salon_holidays
  FOR ALL USING (is_admin());

-- Appointments:
-- Customer can read and create their own appointments.
-- Staff can view assigned appointments.
-- Admins can view and manage all appointments.
CREATE POLICY "Customer read own appointments" ON appointments
  FOR SELECT USING (
    auth.uid() = customer_id 
    OR (is_staff() AND staff_id IN (SELECT id FROM staff WHERE profile_id = auth.uid()))
    OR is_admin()
  );

CREATE POLICY "Customer create appointment" ON appointments
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id OR customer_id IS NULL OR is_admin()
  );

CREATE POLICY "Customer or Staff update appointment" ON appointments
  FOR UPDATE USING (
    auth.uid() = customer_id OR is_staff() OR is_admin()
  );

-- Appointment services:
CREATE POLICY "Read appointment services" ON appointment_services
  FOR SELECT USING (true);

CREATE POLICY "Create appointment services" ON appointment_services
  FOR INSERT WITH CHECK (true);

-- Payments:
-- Staff and Admin can manage payments; Customer can view own payment receipt.
CREATE POLICY "View payments" ON payments
  FOR SELECT USING (
    is_staff() OR is_admin() OR EXISTS (
      SELECT 1 FROM appointments a 
      WHERE a.id = payments.appointment_id AND a.customer_id = auth.uid()
    )
  );

CREATE POLICY "Record payments" ON payments
  FOR INSERT WITH CHECK (is_staff() OR is_admin());

-- Audit logs:
-- Only Admin can view audit logs.
CREATE POLICY "Admin view audit logs" ON audit_logs
  FOR SELECT USING (is_admin());

CREATE POLICY "System insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
