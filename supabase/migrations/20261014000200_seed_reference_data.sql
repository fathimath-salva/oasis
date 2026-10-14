-- Seed only the schedule/holiday values from supabase/seed.sql. The source
-- service and staff rows do not match the live frontend catalogue/IDs and are
-- intentionally deferred until Stage 2 aligns the complete catalogue.
INSERT INTO public.salon_business_hours(day_of_week, day_name, is_open, open_time, close_time) VALUES
  (0, 'Sunday', true, '09:00', '20:30'),
  (1, 'Monday', true, '09:00', '20:30'),
  (2, 'Tuesday', true, '09:00', '20:30'),
  (3, 'Wednesday', true, '09:00', '20:30'),
  (4, 'Thursday', true, '09:00', '20:30'),
  (5, 'Friday', true, '09:00', '20:30'),
  (6, 'Saturday', true, '09:00', '20:30')
ON CONFLICT (day_of_week) DO NOTHING;

INSERT INTO public.salon_holidays(holiday_date, title, description) VALUES
  ('2026-11-01', 'Kannada Rajyotsava', 'Karnataka Statehood Day'),
  ('2026-10-20', 'Ayudha Puja', 'Annual Salon Equipment Puja'),
  ('2026-12-25', 'Christmas Day', 'Festival Holiday')
ON CONFLICT (holiday_date) DO NOTHING;
