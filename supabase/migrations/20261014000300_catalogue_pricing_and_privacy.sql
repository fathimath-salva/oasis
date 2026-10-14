-- Additive catalogue preparation. Safe to apply after 00100 and 00200.
-- This migration does not replace or delete business records.

ALTER TABLE public.services
  ADD COLUMN source_key text,
  ADD COLUMN price_type text NOT NULL DEFAULT 'fixed',
  ADD COLUMN price_min numeric(10,2),
  ADD COLUMN price_max numeric(10,2),
  ADD COLUMN hair_length text,
  ADD COLUMN source_note text;

ALTER TABLE public.services
  ADD CONSTRAINT services_source_key_unique UNIQUE (source_key),
  ADD CONSTRAINT services_price_type_valid CHECK (price_type IN ('fixed', 'range', 'starting_at')),
  ADD CONSTRAINT services_hair_length_valid CHECK (hair_length IS NULL OR hair_length IN ('short', 'medium', 'long', 'extra_long')),
  ADD CONSTRAINT services_price_model_valid CHECK (
    (price_type = 'fixed' AND price_min IS NULL AND price_max IS NULL)
    OR (price_type = 'range' AND price_min IS NOT NULL AND price_max IS NOT NULL
        AND price_min >= 0 AND price_max >= price_min AND price = price_min)
    OR (price_type = 'starting_at' AND price_min IS NOT NULL AND price_max IS NULL
        AND price_min >= 0 AND price = price_min)
  ),
  ADD CONSTRAINT services_variable_price_requires_confirmation CHECK (
    price_type = 'fixed' OR requires_confirmation
  );

ALTER TABLE public.staff
  ADD COLUMN source_key text,
  ADD CONSTRAINT staff_source_key_unique UNIQUE (source_key);

ALTER TABLE public.appointment_services
  ADD COLUMN hair_length text,
  ADD CONSTRAINT appointment_services_hair_length_valid
    CHECK (hair_length IS NULL OR hair_length IN ('short', 'medium', 'long', 'extra_long'));

-- Staff contact details are for authorized administrators only. Remove the
-- former self-read policy; the existing admin-only ALL policy remains intact.
DROP POLICY staff_private_self_or_admin ON public.staff_private;

-- Preserve the existing RPC signature while ensuring only fixed, confirmed
-- prices are bookable. The SECURITY DEFINER function accepts no client price.
CREATE OR REPLACE FUNCTION public.create_booking(
  p_service_ids uuid[], p_appointment_date date, p_start_time time,
  p_staff_id uuid DEFAULT NULL, p_customer_name text DEFAULT NULL,
  p_customer_phone text DEFAULT NULL, p_customer_email text DEFAULT NULL, p_notes text DEFAULT NULL
) RETURNS public.appointments LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE
  v_role public.user_role;
  v_service_count integer;
  v_price numeric(10,2);
  v_duration integer;
  v_snapshot_count integer;
  v_staff_id uuid;
  v_appointment public.appointments%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to book an appointment'; END IF;
  v_role := public.current_user_role();
  IF v_role IS DISTINCT FROM 'customer' THEN RAISE EXCEPTION 'A customer account is required to book'; END IF;
  IF p_service_ids IS NULL OR cardinality(p_service_ids) = 0
     OR cardinality(p_service_ids) <> (
       SELECT count(DISTINCT requested.service_id)
       FROM unnest(p_service_ids) AS requested(service_id)
     ) THEN
    RAISE EXCEPTION 'Select one or more distinct services';
  END IF;
  IF NULLIF(btrim(p_customer_name), '') IS NULL OR NULLIF(btrim(p_customer_phone), '') IS NULL
     OR position('@' IN COALESCE(p_customer_email, '')) < 2 THEN
    RAISE EXCEPTION 'Valid customer contact details are required';
  END IF;
  IF length(COALESCE(p_notes, '')) > 1000 THEN RAISE EXCEPTION 'Notes are too long'; END IF;

  -- Lock rows in a deterministic order so price and duration cannot change
  -- between validation, total calculation, and immutable appointment snapshots.
  PERFORM s.id FROM public.services s
   WHERE s.id = ANY(p_service_ids) ORDER BY s.id FOR SHARE;
  SELECT count(*), COALESCE(sum(s.price), 0), COALESCE(sum(s.duration_minutes), 0)
    INTO v_service_count, v_price, v_duration
    FROM public.services s WHERE s.id = ANY(p_service_ids) AND s.is_active
      AND s.price_confirmed AND NOT s.requires_confirmation AND s.price_type = 'fixed';
  IF v_service_count <> cardinality(p_service_ids) THEN
    RAISE EXCEPTION 'A selected service is unavailable or requires salon price confirmation';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('oasis-booking-day:' || p_appointment_date::text, 0));
  v_staff_id := public.validate_booking_slot(p_appointment_date, p_start_time, v_duration, p_staff_id, p_service_ids);
  INSERT INTO public.appointments(
    booking_reference, customer_id, customer_name, customer_phone, customer_email, staff_id,
    appointment_date, start_time, end_time, total_duration_minutes, total_price, status, notes
  ) VALUES (
    'OASIS-' || to_char(p_appointment_date, 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
    auth.uid(), btrim(p_customer_name), btrim(p_customer_phone), btrim(p_customer_email), v_staff_id,
    p_appointment_date, p_start_time, p_start_time + make_interval(mins => v_duration),
    v_duration, v_price, 'confirmed', NULLIF(btrim(p_notes), '')
  ) RETURNING * INTO v_appointment;
  INSERT INTO public.appointment_services(appointment_id, service_id, service_name, service_price, duration_minutes, hair_length)
    SELECT v_appointment.id, s.id, s.name, s.price, s.duration_minutes, s.hair_length
      FROM public.services s WHERE s.id = ANY(p_service_ids) ORDER BY s.id;
  GET DIAGNOSTICS v_snapshot_count = ROW_COUNT;
  IF v_snapshot_count <> cardinality(p_service_ids) THEN
    RAISE EXCEPTION 'Could not snapshot every selected service';
  END IF;
  RETURN v_appointment;
END;
$$;

-- CREATE OR REPLACE retains the existing ACL; reaffirm the intended client grant.
REVOKE ALL ON FUNCTION public.create_booking(uuid[], date, time, uuid, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_booking(uuid[], date, time, uuid, text, text, text, text) TO authenticated;
