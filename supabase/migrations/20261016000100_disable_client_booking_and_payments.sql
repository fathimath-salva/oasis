-- Stage 1 keeps catalogue and availability reads available while all real
-- appointment and payment mutations remain disabled for browser clients.
-- Re-enable only after the salon has approved qualifications, verified final
-- prices, and completed an explicit end-to-end security review.
REVOKE EXECUTE ON FUNCTION public.create_booking(uuid[], date, time, uuid, text, text, text, text)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cancel_customer_booking(uuid, text)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reschedule_customer_booking(uuid, date, time)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_appointment_status(uuid, public.appointment_status)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_appointment_payment(uuid, public.payment_method, text, text)
  FROM PUBLIC, anon, authenticated;
