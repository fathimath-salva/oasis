-- ============================================================================
-- THE OASIS UNISEX SALON & SPA — INITIAL SEED DATA
-- Location: Puttur, Karnataka
-- ============================================================================

-- 1. Business Hours (Puttur Salon: Mon - Sun 09:00 to 20:30)
INSERT INTO salon_business_hours (day_of_week, day_name, is_open, open_time, close_time) VALUES
(0, 'Sunday', true, '09:00:00', '20:30:00'),
(1, 'Monday', true, '09:00:00', '20:30:00'),
(2, 'Tuesday', true, '09:00:00', '20:30:00'),
(3, 'Wednesday', true, '09:00:00', '20:30:00'),
(4, 'Thursday', true, '09:00:00', '20:30:00'),
(5, 'Friday', true, '09:00:00', '20:30:00'),
(6, 'Saturday', true, '09:00:00', '20:30:00')
ON CONFLICT (day_of_week) DO UPDATE 
SET open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time;

-- 2. Holidays
INSERT INTO salon_holidays (holiday_date, title, description) VALUES
('2026-11-01', 'Kannada Rajyotsava', 'Karnataka Statehood Day'),
('2026-10-20', 'Ayudha Puja', 'Annual Salon Equipment Puja'),
('2026-12-25', 'Christmas Day', 'Festival Holiday')
ON CONFLICT (holiday_date) DO NOTHING;

-- 3. Services (Prices confirmed or flagged for review)
INSERT INTO services (id, name, category, gender, description, price, price_confirmed, duration_minutes, is_active, image_url) VALUES
('11111111-0000-0000-0000-000000000001', 'Men''s Signature Haircut & Beard Trim', 'Haircutting and hairstyling', 'men', 'Precision scissor and clipper cut tailored to facial structure, finished with refreshing hot towel and beard contouring.', 350.00, true, 45, true, 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80'),
('11111111-0000-0000-0000-000000000002', 'Women''s Advanced Creative Haircut & Style', 'Haircutting and hairstyling', 'women', 'Consultation, customized sectioning, advanced layering or bob styling, completed with a blow-dry finish.', 750.00, true, 60, true, 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80'),
('11111111-0000-0000-0000-000000000003', 'Hydra Scalp Cleansing Wash & Volumizing Blow-Dry', 'Hair wash and blow-dry', 'women', 'Purifying scalp massage with deep nourishing conditioner and bouncy salon blow-dry for long-lasting gloss.', 600.00, false, 40, true, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'),
('11111111-0000-0000-0000-000000000004', 'Global Hair Colour (L''Oréal Inoa / Majirel)', 'Hair colouring and highlights', 'women', 'Rich, ammonia-free root-to-tip colour infusion with 100% grey coverage and radiant shine.', 3200.00, false, 120, true, 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80'),
('11111111-0000-0000-0000-000000000005', 'L''Oréal Extenso Protein Smoothening', 'Smoothening and straightening', 'women', 'Tames unruly frizz and creates silk-like manageability while preserving hair health and natural movement.', 4999.00, false, 180, true, 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80'),
('11111111-0000-0000-0000-000000000006', 'Intensive Brazilian Keratin Infusion', 'Keratin treatments', 'unisex', 'Hydrolyzed keratin formula seals split ends, eliminates 95% frizz and restores glossy protein bonds.', 5500.00, false, 180, true, 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80'),
('11111111-0000-0000-0000-000000000007', 'Moroccan Argan Oil Deep Conditioning Spa', 'Hair spa and head massage', 'unisex', 'Intense hydration masque, steam infusion, and pressure-point scalp massage to restore vitality to dry strands.', 1200.00, true, 50, true, 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80'),
('11111111-0000-0000-0000-000000000008', 'Traditional Kesh Ayurvedic Warm Oil Champi', 'Hair spa and head massage', 'unisex', 'Traditional Indian herbal oil head and shoulder acupressure therapy to alleviate stress.', 650.00, true, 40, true, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'),
('11111111-0000-0000-0000-000000000009', 'O3+ Bridal Whitening & Radiance Luxury Facial', 'Classic and premium facials', 'women', 'Multi-step skin brightening ritual utilizing oxygenating peel, melanin-reducing serum, and peel-off algae mask.', 2800.00, false, 75, true, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'),
('11111111-0000-0000-0000-000000000010', 'Casmara Luxury 24K Gold Rejuvenation Facial', 'Classic and premium facials', 'unisex', 'Spanish mineralized gold therapy that firms skin contours, stimulates cell regeneration, and restores luminous glow.', 3500.00, false, 80, true, 'https://images.unsplash.com/photo-1512290900672-1f486a42a033?auto=format&fit=crop&w=800&q=80'),
('11111111-0000-0000-0000-000000000011', 'Hydra-Infusion Clean-Up & Blackhead Extraction', 'Clean-up and skin treatments', 'unisex', 'Deep pore steaming, gentle ultrasonic blackhead clearance, soothing tea tree gel, and pore-minimizing toner.', 900.00, true, 45, true, 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80'),
('11111111-0000-0000-0000-000000000012', 'Rica Italian Liposoluble Wax (Full Arms + Legs)', 'Waxing and threading', 'women', 'Gentle, colophony-free Italian wax enriched with natural beeswax and argan oil for silky smooth skin.', 1350.00, false, 50, true, 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80'),
('11111111-0000-0000-0000-000000000013', 'Aroma Bubble Foot Spa & Paraffin Pedicure', 'Manicure and pedicure', 'unisex', 'Epsom salt soak, walnut shell exfoliation, dead skin callus filing, cuticles care, and heated paraffin wax wrap.', 1100.00, true, 60, true, 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80'),
('11111111-0000-0000-0000-000000000014', 'Swedish Deep Relaxation Full Body Massage', 'Body spa and massage', 'unisex', 'Long fluid effleurage strokes, therapeutic essential oils, and gentle kneading to melt chronic tension and fatigue.', 2400.00, false, 60, true, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (id) DO NOTHING;

-- 4. Staff Members
INSERT INTO staff (id, name, title, phone, email, specialties, is_active, rating, working_days, start_time, end_time) VALUES
('22222222-0000-0000-0000-000000000001', 'Ramesh Shetty', 'Senior Hair Stylist & Barber', '9151550077', 'ramesh@oasis-salon.in', ARRAY['Haircutting and hairstyling', 'Hair wash and blow-dry', 'Hair spa and head massage', 'Keratin treatments'], true, 4.90, '{0,1,2,4,5,6}', '09:00:00', '20:30:00'),
('22222222-0000-0000-0000-000000000002', 'Ananya Rao', 'Master Aesthetician & Skin Care Specialist', '7760451767', 'ananya@oasis-salon.in', ARRAY['Classic and premium facials', 'Clean-up and skin treatments', 'Waxing and threading', 'Manicure and pedicure'], true, 4.95, '{0,1,2,3,5,6}', '09:30:00', '20:30:00'),
('22222222-0000-0000-0000-000000000003', 'Mohammed Irfan', 'Senior Hair Colourist & Texture Artist', '9151550077', 'irfan@oasis-salon.in', ARRAY['Hair colouring and highlights', 'Smoothening and straightening', 'Keratin treatments'], true, 4.88, '{1,2,3,4,5,6}', '10:00:00', '20:30:00'),
('22222222-0000-0000-0000-000000000004', 'Preethi D’Souza', 'Certified Spa Therapist & Wellness Specialist', '7760451767', 'preethi@oasis-salon.in', ARRAY['Body spa and massage', 'Hair spa and head massage', 'Manicure and pedicure'], true, 4.92, '{0,1,3,4,5,6}', '09:00:00', '19:30:00')
ON CONFLICT (id) DO NOTHING;
