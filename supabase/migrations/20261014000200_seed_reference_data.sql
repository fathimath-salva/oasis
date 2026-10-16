-- Seed only daily business hours. The salon has not confirmed holiday closures,
-- so do not make any dates unavailable through reference data.
INSERT INTO public.salon_business_hours(day_of_week, day_name, is_open, open_time, close_time) VALUES
  (0, 'Sunday', true, '09:00', '20:30'),
  (1, 'Monday', true, '09:00', '20:30'),
  (2, 'Tuesday', true, '09:00', '20:30'),
  (3, 'Wednesday', true, '09:00', '20:30'),
  (4, 'Thursday', true, '09:00', '20:30'),
  (5, 'Friday', true, '09:00', '20:30'),
  (6, 'Saturday', true, '09:00', '20:30')
ON CONFLICT (day_of_week) DO NOTHING;
