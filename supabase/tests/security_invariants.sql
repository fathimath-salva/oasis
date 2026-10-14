-- Run only on a disposable database with `supabase test db`.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(69);

CREATE TEMP TABLE booking_fixture_date ON COMMIT DROP AS
SELECT candidate::date AS booking_date
FROM generate_series(
  (((now() AT TIME ZONE 'Asia/Kolkata')::date + 30)::timestamp),
  (((now() AT TIME ZONE 'Asia/Kolkata')::date + 120)::timestamp),
  interval '1 day'
) AS dates(candidate)
WHERE EXTRACT(DOW FROM candidate)::integer = 0
  AND NOT EXISTS (SELECT 1 FROM public.salon_holidays h WHERE h.holiday_date = candidate::date)
ORDER BY candidate
LIMIT 1;
GRANT SELECT ON booking_fixture_date TO authenticated;
SELECT is((SELECT count(*)::integer FROM booking_fixture_date),1,'fixture date is a future open Sunday');

SELECT ok(NOT EXISTS (
  SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind IN ('r','p') AND NOT c.relrowsecurity
), 'RLS is enabled on every public table');
SELECT ok(NOT has_table_privilege('anon', 'public.appointments', 'SELECT'), 'anon cannot read appointments');
SELECT ok(NOT has_table_privilege('authenticated', 'public.appointments', 'UPDATE'), 'clients cannot directly update appointments');
SELECT ok(NOT has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE'), 'clients cannot update their role');
SELECT ok(NOT has_sequence_privilege('anon', 'public.salon_business_hours_id_seq', 'USAGE')
  AND NOT has_sequence_privilege('anon', 'public.salon_business_hours_id_seq', 'SELECT')
  AND NOT has_sequence_privilege('anon', 'public.salon_business_hours_id_seq', 'UPDATE'), 'anon has no sequence privileges');
SELECT ok(NOT has_sequence_privilege('authenticated', 'public.salon_business_hours_id_seq', 'USAGE')
  AND NOT has_sequence_privilege('authenticated', 'public.salon_business_hours_id_seq', 'SELECT')
  AND NOT has_sequence_privilege('authenticated', 'public.salon_business_hours_id_seq', 'UPDATE'), 'authenticated has no sequence privileges');
SELECT ok(NOT has_function_privilege('anon', 'public.create_booking(uuid[],date,time,uuid,text,text,text,text)', 'EXECUTE')
  AND NOT has_function_privilege('anon', 'public.record_appointment_payment(uuid,public.payment_method,text,text)', 'EXECUTE')
  AND NOT has_table_privilege('anon', 'public.audit_logs', 'INSERT'), 'anon cannot book, record payments, or write audit rows');
SELECT ok(NOT has_table_privilege('anon', 'public.staff_private', 'SELECT'), 'anonymous users cannot read private staff contacts');
SELECT is((SELECT count(*)::integer FROM public.services WHERE source_key IS NOT NULL),133,'all reviewed catalogue rows have stable source keys');
SELECT is((SELECT count(*)::integer FROM public.staff WHERE source_key IS NOT NULL),4,'all reviewed public staff rows have stable source keys');
SELECT is((SELECT count(*)::integer FROM public.services WHERE hair_length IS NOT NULL),15,'all fifteen reviewed hair-length variants are structured');
SELECT is((SELECT count(*)::integer FROM public.services WHERE price_type <> 'fixed' AND requires_confirmation),6,'all variable-price services require final-price confirmation');
SELECT is((SELECT count(*)::integer FROM public.staff_private),0,'reference seed contains no staff contact details');
SELECT is((SELECT count(*)::integer FROM public.staff_services),0,'unverified staff qualifications are not seeded');
SELECT ok(NOT EXISTS (SELECT 1 FROM public.appointments)
  AND NOT EXISTS (SELECT 1 FROM public.payments)
  AND NOT EXISTS (SELECT 1 FROM public.audit_logs), 'reference seed imports no appointments, payments, or audit events');
SELECT lives_ok($$INSERT INTO public.services(source_key,name,category,gender,price,price_confirmed,requires_confirmation,duration_minutes)
  VALUES ('w-cut-1','Edited name must not win','Hair Cutting','women',1,true,false,1)
  ON CONFLICT (source_key) DO NOTHING$$, 'rerunning a matching service source key is safe');
SELECT is((SELECT name FROM public.services WHERE source_key='w-cut-1'), 'Baby Hair Cut'::text, 'reference seed conflict does not overwrite an administrator value');
SELECT lives_ok($$INSERT INTO public.staff(source_key,name,title)
  VALUES ('stf-1','Edited staff name must not win','Edited title')
  ON CONFLICT (source_key) DO NOTHING$$, 'rerunning a matching staff source key is safe');
SELECT is((SELECT name FROM public.staff WHERE source_key='stf-1'), 'Ramesh Shetty'::text, 'reference seed conflict does not overwrite an administrator staff value');
SELECT is((SELECT count(*)::integer FROM public.services WHERE price_type='range'),4,'four catalogue prices are represented as ranges');
SELECT is((SELECT count(*)::integer FROM public.services WHERE price_type='starting_at'),2,'two catalogue prices are represented as starting prices');
SELECT ok(NOT EXISTS (
  SELECT 1 FROM pg_proc
  WHERE oid='public.create_booking(uuid[],date,time,uuid,text,text,text,text)'::regprocedure
    AND 'p_price' = ANY(COALESCE(proargnames, ARRAY[]::text[]))
), 'booking RPC does not accept a customer-supplied price');
SELECT throws_ok($$INSERT INTO public.services(name,category,gender,price,price_confirmed,requires_confirmation,duration_minutes,hair_length) VALUES ('Bad length','Hair','women',100,true,false,30,'waist')$$, '23514', NULL, 'unsupported hair-length value is rejected');
SELECT throws_ok($$INSERT INTO public.services(name,category,gender,price,price_confirmed,requires_confirmation,duration_minutes,price_type,price_min,price_max) VALUES ('Bad range','Hair','women',100,true,true,30,'range',100,90)$$, '23514', NULL, 'invalid price range is rejected');
SELECT throws_ok($$INSERT INTO public.services(name,category,gender,price,price_confirmed,requires_confirmation,duration_minutes,price_type) VALUES ('Bad price type','Hair','women',100,true,false,30,'quote')$$, '23514', NULL, 'unsupported catalogue price type is rejected');

-- UUIDs and records are transaction-local fixtures. The auth trigger creates
-- customer profiles; owner-side updates below promote only disposable fixtures.
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
 ('10000000-0000-4000-8000-000000000001','authenticated','authenticated','cust-a@test.invalid','',now(),'{}','{"full_name":"Customer A","role":"admin"}',now(),now()),
 ('10000000-0000-4000-8000-000000000002','authenticated','authenticated','cust-b@test.invalid','',now(),'{}','{"full_name":"Customer B"}',now(),now()),
 ('10000000-0000-4000-8000-000000000003','authenticated','authenticated','staff-a@test.invalid','',now(),'{}','{"full_name":"Staff A"}',now(),now()),
 ('10000000-0000-4000-8000-000000000004','authenticated','authenticated','staff-b@test.invalid','',now(),'{}','{"full_name":"Staff B"}',now(),now()),
 ('10000000-0000-4000-8000-000000000005','authenticated','authenticated','no-profile@test.invalid','',now(),'{}','{}',now(),now()),
 ('10000000-0000-4000-8000-000000000006','authenticated','authenticated','admin@test.invalid','',now(),'{}','{"full_name":"Admin"}',now(),now());
DELETE FROM public.profiles WHERE id='10000000-0000-4000-8000-000000000005';
UPDATE public.profiles SET role='staff' WHERE id IN ('10000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000004');
UPDATE public.profiles SET role='admin' WHERE id='10000000-0000-4000-8000-000000000006';
SELECT is((SELECT role FROM public.profiles WHERE id='10000000-0000-4000-8000-000000000001'), 'customer'::public.user_role, 'new auth user is always a customer despite role metadata');
INSERT INTO public.staff(id,profile_id,name,title,working_days,start_time,end_time) VALUES
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000003','Staff A','Stylist','{0,1,2,3,4,5,6}','00:00','23:59'),
 ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000004','Staff B','Stylist','{0,1,2,3,4,5,6}','00:00','23:59');
INSERT INTO public.staff_private(staff_id,phone,email) VALUES
 ('20000000-0000-4000-8000-000000000001','private-1','staff-a@test.invalid'),
 ('20000000-0000-4000-8000-000000000002','private-2','staff-b@test.invalid');
INSERT INTO public.services(id,name,category,gender,price,price_confirmed,requires_confirmation,duration_minutes)
VALUES ('30000000-0000-4000-8000-000000000001','Test service','Hair','unisex',100,true,false,30);
UPDATE public.services SET hair_length='short' WHERE id='30000000-0000-4000-8000-000000000001';
INSERT INTO public.services(id,name,category,gender,price,price_confirmed,requires_confirmation,duration_minutes,price_type,price_min,price_max)
VALUES
 ('30000000-0000-4000-8000-000000000003','Range test service','Hair','unisex',100,true,true,30,'range',100,200),
 ('30000000-0000-4000-8000-000000000004','Starting test service','Hair','unisex',100,true,true,30,'starting_at',100,NULL);
INSERT INTO public.services(id,name,category,gender,price,price_confirmed,requires_confirmation,duration_minutes,is_active)
VALUES ('30000000-0000-4000-8000-000000000002','Inactive test service','Hair','unisex',75,true,false,30,false);
INSERT INTO public.staff_services VALUES ('20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001');
INSERT INTO public.appointments(id,booking_reference,customer_id,customer_name,customer_phone,customer_email,staff_id,appointment_date,start_time,end_time,total_duration_minutes,total_price,status)
VALUES
 ('40000000-0000-4000-8000-000000000001','TEST-A','10000000-0000-4000-8000-000000000001','Customer A','1','cust-a@test.invalid','20000000-0000-4000-8000-000000000001',(SELECT booking_date FROM booking_fixture_date),'10:00','10:30',30,100,'confirmed'),
 ('40000000-0000-4000-8000-000000000002','TEST-B','10000000-0000-4000-8000-000000000002','Customer B','2','cust-b@test.invalid','20000000-0000-4000-8000-000000000002',(SELECT booking_date FROM booking_fixture_date),'11:00','11:30',30,100,'confirmed');
INSERT INTO public.appointment_services(appointment_id,service_id,service_name,service_price,duration_minutes,hair_length) VALUES
 ('40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','Test service',100,30,'short'),
 ('40000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000001','Test service',100,30,'short');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
SELECT is((SELECT count(*)::integer FROM public.appointments),1,'customer sees only own appointment');
SELECT is((SELECT count(*)::integer FROM public.staff_private),0,'customer cannot read staff private contacts');
SELECT lives_ok($sql$DO $body$
DECLARE changed_rows integer;
BEGIN
  UPDATE public.staff_private SET phone='customer-write' WHERE staff_id='20000000-0000-4000-8000-000000000001';
  GET DIAGNOSTICS changed_rows = ROW_COUNT;
  IF changed_rows <> 0 THEN RAISE EXCEPTION 'customer changed a private staff contact'; END IF;
END
$body$;$sql$, 'customer cannot update staff private contacts');
SELECT throws_ok($$UPDATE public.profiles SET role='admin' WHERE id=auth.uid()$$, '42501', NULL, 'customer cannot escalate role');
SELECT throws_ok($$SELECT public.admin_set_profile_role('10000000-0000-4000-8000-000000000002','admin')$$, NULL, 'Administrator role required', 'customer cannot call admin role RPC');
SELECT throws_ok($$SELECT public.update_appointment_status('40000000-0000-4000-8000-000000000001','completed')$$, NULL, 'Staff or administrator role required', 'customer cannot change appointment status');
SELECT throws_ok($$SELECT public.record_appointment_payment('40000000-0000-4000-8000-000000000001','cash')$$, NULL, 'Administrator role required', 'customer cannot record payment');
SELECT throws_ok($$UPDATE public.appointments SET total_price=0 WHERE id='40000000-0000-4000-8000-000000000001'$$, '42501', NULL, 'customer cannot tamper with appointment price');
SELECT throws_ok($$SELECT public.create_booking(ARRAY['30000000-0000-4000-8000-000000000001']::uuid[],(SELECT booking_date FROM booking_fixture_date),'10:00','20000000-0000-4000-8000-000000000002','Customer A','1','cust-a@test.invalid',NULL)$$, NULL, 'That time is no longer available', 'staff without service qualification cannot be assigned');
SELECT throws_ok($$SELECT public.create_booking(ARRAY['30000000-0000-4000-8000-000000000001']::uuid[],(SELECT booking_date FROM booking_fixture_date),'10:00','20000000-0000-4000-8000-000000000001','Customer A','1','cust-a@test.invalid',NULL)$$, NULL, 'That time is no longer available', 'booking conflict is rejected');
SELECT throws_ok($$SELECT public.create_booking(ARRAY['30000000-0000-4000-8000-000000000002']::uuid[],(SELECT booking_date FROM booking_fixture_date),'12:00','20000000-0000-4000-8000-000000000001','Customer A','1','cust-a@test.invalid',NULL)$$, NULL, 'A selected service is unavailable or requires salon price confirmation', 'inactive service cannot be booked');
SELECT throws_ok($$SELECT public.create_booking(ARRAY['30000000-0000-4000-8000-000000000099']::uuid[],(SELECT booking_date FROM booking_fixture_date),'12:00','20000000-0000-4000-8000-000000000001','Customer A','1','cust-a@test.invalid',NULL)$$, NULL, 'A selected service is unavailable or requires salon price confirmation', 'missing service cannot be booked');
SELECT throws_ok($$SELECT public.create_booking(ARRAY['30000000-0000-4000-8000-000000000003']::uuid[],(SELECT booking_date FROM booking_fixture_date),'12:00','20000000-0000-4000-8000-000000000001','Customer A','1','cust-a@test.invalid',NULL)$$, NULL, 'A selected service is unavailable or requires salon price confirmation', 'range price cannot be booked without a confirmed final price');
SELECT throws_ok($$SELECT public.create_booking(ARRAY['30000000-0000-4000-8000-000000000004']::uuid[],(SELECT booking_date FROM booking_fixture_date),'12:00','20000000-0000-4000-8000-000000000001','Customer A','1','cust-a@test.invalid',NULL)$$, NULL, 'A selected service is unavailable or requires salon price confirmation', 'starting price cannot be booked without a confirmed final price');
RESET ROLE;
UPDATE public.services SET price_confirmed=false WHERE id='30000000-0000-4000-8000-000000000001';
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
SELECT throws_ok($$SELECT public.create_booking(ARRAY['30000000-0000-4000-8000-000000000001']::uuid[],(SELECT booking_date FROM booking_fixture_date),'12:00','20000000-0000-4000-8000-000000000001','Customer A','1','cust-a@test.invalid',NULL)$$, NULL, 'A selected service is unavailable or requires salon price confirmation', 'unconfirmed service price is rejected');
RESET ROLE;
UPDATE public.services SET price_confirmed=true, price=125, duration_minutes=45 WHERE id='30000000-0000-4000-8000-000000000001';
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
SELECT lives_ok($$SELECT public.create_booking(ARRAY['30000000-0000-4000-8000-000000000001']::uuid[],(SELECT booking_date FROM booking_fixture_date),'12:00','20000000-0000-4000-8000-000000000001','Customer A','1','cust-a@test.invalid',NULL)$$, 'valid booking is accepted');
SELECT is((SELECT total_price FROM public.appointments WHERE appointment_date=(SELECT booking_date FROM booking_fixture_date) AND start_time='12:00' AND customer_id='10000000-0000-4000-8000-000000000001'),125::numeric,'booking price uses the latest trusted catalogue price');
SELECT is((SELECT total_duration_minutes FROM public.appointments WHERE appointment_date=(SELECT booking_date FROM booking_fixture_date) AND start_time='12:00' AND customer_id='10000000-0000-4000-8000-000000000001'),45,'booking duration uses the latest trusted catalogue duration');
SELECT is((SELECT count(*)::integer FROM public.appointment_services WHERE appointment_id=(SELECT id FROM public.appointments WHERE appointment_date=(SELECT booking_date FROM booking_fixture_date) AND start_time='12:00' AND customer_id='10000000-0000-4000-8000-000000000001')),1,'booking stores every service snapshot');
SELECT ok(EXISTS (SELECT 1 FROM public.appointment_services WHERE appointment_id=(SELECT id FROM public.appointments WHERE appointment_date=(SELECT booking_date FROM booking_fixture_date) AND start_time='12:00' AND customer_id='10000000-0000-4000-8000-000000000001') AND service_price=125 AND duration_minutes=45 AND hair_length='short'), 'snapshot price, duration, and hair length match locked catalogue data');
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
SELECT is((SELECT count(*)::integer FROM public.appointments),2,'assigned staff sees its appointments');
SELECT is((SELECT count(*)::integer FROM public.staff_private),0,'staff cannot read private staff contacts');
SELECT lives_ok($sql$DO $body$
DECLARE changed_rows integer;
BEGIN
  UPDATE public.staff_private SET phone='staff-write' WHERE staff_id='20000000-0000-4000-8000-000000000001';
  GET DIAGNOSTICS changed_rows = ROW_COUNT;
  IF changed_rows <> 0 THEN RAISE EXCEPTION 'staff changed a private staff contact'; END IF;
END
$body$;$sql$, 'staff cannot update private staff contacts');
SELECT ok(NOT EXISTS (SELECT 1 FROM public.appointments WHERE id='40000000-0000-4000-8000-000000000002'), 'assigned staff cannot see another staff appointment');
SELECT lives_ok($$SELECT public.update_appointment_status('40000000-0000-4000-8000-000000000001','checked_in')$$, 'assigned staff may perform a valid status transition');
SELECT is((SELECT status FROM public.appointments WHERE id='40000000-0000-4000-8000-000000000001'), 'checked_in'::public.appointment_status, 'assigned appointment receives the staff status change');
SELECT throws_ok($$SELECT public.update_appointment_status('40000000-0000-4000-8000-000000000002','checked_in')$$, NULL, 'Assigned staff access required', 'staff cannot change unassigned appointment');
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000004',true);
SELECT is((SELECT count(*)::integer FROM public.appointments),1,'staff sees its assigned appointment');
SELECT is((SELECT count(*)::integer FROM public.staff_private),0,'other staff cannot read private contacts');
SELECT is((SELECT count(*)::integer FROM public.appointments WHERE id='40000000-0000-4000-8000-000000000001'),0,'staff cannot see an unassigned appointment');
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000005',true);
SELECT throws_ok($$SELECT public.update_appointment_status('40000000-0000-4000-8000-000000000001','completed')$$, NULL, 'Staff or administrator role required', 'authenticated user without profile is rejected');
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000006',true);
SELECT is((SELECT count(*)::integer FROM public.staff_private),2,'administrator can read private staff contacts');
SELECT lives_ok($$SELECT public.admin_set_profile_role('10000000-0000-4000-8000-000000000002','staff')$$, 'administrator can assign an authorized role');
SELECT is((SELECT role FROM public.profiles WHERE id='10000000-0000-4000-8000-000000000002'), 'staff'::public.user_role, 'authorized role assignment persists');
UPDATE public.services SET name='Admin catalogue edit' WHERE source_key='w-cut-1';
SELECT is((SELECT name FROM public.services WHERE source_key='w-cut-1'), 'Admin catalogue edit'::text, 'administrator can edit catalogue records');
UPDATE public.staff_private SET phone='admin-updated' WHERE staff_id='20000000-0000-4000-8000-000000000001';
SELECT is((SELECT phone FROM public.staff_private WHERE staff_id='20000000-0000-4000-8000-000000000001'), 'admin-updated'::text, 'administrator can update private staff contacts');
SELECT lives_ok($sql$DO $body$
BEGIN
  DELETE FROM public.salon_business_hours WHERE day_of_week=0;
  INSERT INTO public.salon_business_hours(day_of_week,day_name,is_open,open_time,close_time)
  VALUES (0,'Sunday',true,'09:00','20:30');
END
$body$;$sql$, 'admin can manage identity-backed hours without sequence grants');
SELECT is((SELECT count(*)::integer FROM public.salon_business_hours WHERE day_of_week=0),1,'admin hours insert completed');
SELECT lives_ok($$SELECT public.record_appointment_payment('40000000-0000-4000-8000-000000000001','cash')$$, 'admin can record a completed payment');
SELECT is((SELECT payment_status FROM public.payments WHERE appointment_id='40000000-0000-4000-8000-000000000001'), 'completed'::public.payment_status, 'admin payment is stored as completed');
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
SELECT is((SELECT count(*)::integer FROM public.payments),0,'customer cannot read another customer payment');
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
SELECT is((SELECT count(*)::integer FROM public.payments),1,'customer can read own payment');
RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
