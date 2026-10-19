# OASIS Security Alert Delivery Review

Status: proposal only. No Edge Function, provider secret, alert recipient, database change, or delivery path is configured by this document.

## What the current project can observe

- The local migration set defines `public.audit_logs` triggers for successful database changes, including profile role changes through `admin_set_profile_role`. That prepared schema has not been applied to the hosted project, so this is not a live event source. Once deployed under a reviewed migration plan, the table is protected by RLS and readable only by an authenticated admin.
- The current `audit_logs` table does not record failed sign-ins, denied RLS requests, password resets, source IP addresses, or reliable device identity.
- The browser can distinguish the outcome of its own Supabase sign-in request, but a browser report is untrusted and can be forged or replayed. It must not directly send an email or be treated as authoritative evidence.
- The site has no configured mail provider for alerts. `.env.example` contains only the enquiry endpoint and public salon contact address variables; neither is a secure alert delivery integration. The requested recipient is deferred.

## Proposed reviewed architecture

1. Use a trusted source for authentication events, such as a supported Supabase Auth log drain or provider-side audit stream. Do not rely on the browser to report failed credentials as authoritative.
2. For database authorization denials, evaluate a supported Postgres audit/log export or a narrowly scoped server-side audit mechanism. Do not weaken RLS or insert arbitrary client events into `audit_logs`.
3. Send only allow-listed event fields to a server-side processor. Deduplicate by event/request ID, aggregate repeated failures by time window, rate-limit delivery, and retain the minimum metadata for a documented period.
4. Send email from a server-side provider integration using secrets stored only in server-side function secrets. Fix the recipient in trusted configuration; clients cannot select it.
5. Treat successful role-change audit entries as an existing signal that could be forwarded after the alert pipeline and recipient are reviewed. Do not claim delivery until the provider confirms it.
6. Do not infer a new device from browser fingerprinting or an IP change. A future alert may say “admin sign-in” with timestamp and event ID, but must not label the device new unless a defensible trusted device-registration mechanism is adopted.

## Events not currently alertable reliably

- Repeated failed admin sign-ins: not available from the current database schema. Requires a trusted auth event source and aggregation pipeline.
- Non-admin attempts to use admin-only resources: current RLS rejects unauthorized access, but these denials are not written to the existing audit table. Requires trusted database/API audit telemetry.
- Successful admin sign-in: can be observed by an authenticated client but not securely delivered as a privileged alert from this browser-only architecture. Use a trusted auth event stream.
- Successful password reset: Supabase may send the recovery email, but this application has no trusted reset-event notification pipeline. Add a supported auth event source before claiming alert coverage.
- Database changes and role changes: successful changes are recorded in `public.audit_logs`; notifications still require a reviewed server-side consumer and configured recipient.

Before implementation, choose and configure the trusted event source, mail provider, verified admin recipient, retention window, aggregation thresholds, and test project. Review any proposed SQL/Edge Function changes before applying them to Oasis-Test. Never deploy alert changes directly to production.
