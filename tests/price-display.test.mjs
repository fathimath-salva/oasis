import assert from 'node:assert/strict';
import test from 'node:test';
import { getCataloguePriceLabel } from '../src/lib/formatters.ts';
import { isFixedPriceService, toSalonService } from '../src/lib/serviceMapper.ts';

const serviceRecord = (overrides = {}) => ({
  id: '00000000-0000-4000-8000-000000000001',
  sourceKey: 'test-service',
  name: 'Test service',
  category: 'Hair',
  gender: 'women',
  description: '',
  price: 500,
  priceType: 'fixed',
  minPrice: null,
  maxPrice: null,
  hairLength: null,
  priceConfirmed: true,
  requiresConfirmation: false,
  durationMinutes: 30,
  isActive: true,
  imageUrl: null,
  sourceNote: null,
  createdAt: '',
  updatedAt: '',
  ...overrides,
});

test('fixed catalogue prices display exactly and remain bookable when otherwise eligible', () => {
  const womenService = toSalonService(serviceRecord({ price: 1999 }));
  const menService = toSalonService(serviceRecord({
    id: '00000000-0000-4000-8000-000000000002',
    sourceKey: 'm-fixed',
    gender: 'men',
    price: 500,
  }));

  assert.equal(getCataloguePriceLabel(womenService), '₹1,999');
  assert.equal(getCataloguePriceLabel(menService), '₹500');
  assert.equal(isFixedPriceService(womenService), true);
  assert.equal(isFixedPriceService(menService), true);
});

test('verified range prices display while remaining unavailable for booking', () => {
  const service = toSalonService(serviceRecord({
    price: 3000,
    priceType: 'range',
    minPrice: 3000,
    maxPrice: 5000,
    requiresConfirmation: true,
  }));

  assert.equal(getCataloguePriceLabel(service), '₹3,000–₹5,000');
  assert.equal(isFixedPriceService(service), false);
});

test('verified starting prices display with a plus while remaining unavailable for booking', () => {
  const service = toSalonService(serviceRecord({
    price: 10000,
    priceType: 'starting_at',
    minPrice: 10000,
    requiresConfirmation: true,
  }));

  assert.equal(getCataloguePriceLabel(service), '₹10,000+');
  assert.equal(isFixedPriceService(service), false);
});

test('a genuinely unconfirmed catalogue price still uses the confirmation label', () => {
  const service = toSalonService(serviceRecord({ priceConfirmed: false }));

  assert.equal(getCataloguePriceLabel(service), 'Price to be confirmed');
  assert.equal(isFixedPriceService(service), false);
});
