import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addDemoService,
  addDemoStaff,
  createDemoBookingPreview,
  DEMO_APPOINTMENTS,
  DEMO_SERVICES,
  DEMO_STAFF,
  setDemoServiceEnabled,
  setDemoStaffEnabled,
  updateDemoAppointmentStatus,
  updateDemoService,
  updateDemoStaff,
} from '../src/lib/demoState.ts';

test('service add, edit, and disable operations return isolated demo state', () => {
  const original = DEMO_SERVICES.map((service) => ({ ...service }));
  const added = addDemoService(original, {
    id: 'unit-test-service', name: 'Demo-only trim', gender: 'Unisex', category: 'Sample',
    priceLabel: 'Demo only — no catalogue price', enabled: true,
  });
  const edited = updateDemoService(added, 'unit-test-service', {
    name: 'Edited demo-only trim', gender: 'Unisex', category: 'Sample category',
  });
  const disabled = setDemoServiceEnabled(edited, 'unit-test-service', false);

  assert.equal(original.length, DEMO_SERVICES.length);
  assert.equal(original.find((service) => service.id === 'demo-service-3')?.priceLabel, '₹10,000+');
  assert.notEqual(added, original);
  assert.equal(disabled.find((service) => service.id === 'unit-test-service')?.name, 'Edited demo-only trim');
  assert.equal(disabled.find((service) => service.id === 'unit-test-service')?.enabled, false);
  assert.equal(disabled.find((service) => service.id === 'unit-test-service')?.priceLabel, 'Demo only — no catalogue price');
});

test('staff add, edit, and disable operations do not mutate the fixtures', () => {
  const original = DEMO_STAFF.map((member) => ({ ...member }));
  const added = addDemoStaff(original, {
    id: 'unit-test-staff', name: 'Fictional Teammate', title: 'Sample title',
    specialties: 'Illustrative sample only', enabled: true,
  });
  const edited = updateDemoStaff(added, 'unit-test-staff', {
    name: 'Edited Fictional Teammate', title: 'Updated sample title', specialties: 'Illustrative sample only',
  });
  const disabled = setDemoStaffEnabled(edited, 'unit-test-staff', false);

  assert.equal(original.length, DEMO_STAFF.length);
  assert.notEqual(added, original);
  assert.equal(disabled.find((member) => member.id === 'unit-test-staff')?.name, 'Edited Fictional Teammate');
  assert.equal(disabled.find((member) => member.id === 'unit-test-staff')?.enabled, false);
});

test('staff appointment status changes are local immutable sample updates', () => {
  const original = DEMO_APPOINTMENTS.map((appointment) => ({ ...appointment }));
  const updated = updateDemoAppointmentStatus(original, 'DEMO-001', 'In progress');

  assert.equal(original[0].status, 'Scheduled');
  assert.equal(updated[0].status, 'In progress');
  assert.equal(updated[1].status, original[1].status);
  assert.notEqual(updated, original);
});

test('booking simulator returns a not-booked preview with no appointment or booking reference', () => {
  const preview = createDemoBookingPreview('Basic Hair Cut', '2026-10-20', '10:30 AM');

  assert.equal(preview.result, 'DEMO ONLY — Appointment not booked');
  assert.match(preview.detail, /No live availability was checked/);
  assert.match(preview.detail, /no salon appointment was created/);
  assert.deepEqual(Object.keys(preview).sort(), ['date', 'detail', 'result', 'serviceName', 'time']);
});
