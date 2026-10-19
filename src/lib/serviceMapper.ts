import type { ServiceRecord } from './repository';
import type { SalonService, ServiceCategory } from '../types/salon';
import { formatINR } from './formatters.ts';

// Convert only live repository records to the existing presentation model.
// The service `id` remains the database UUID used by availability RPC calls.
export const toSalonService = (record: ServiceRecord): SalonService => ({
  id: record.id,
  sourceKey: record.sourceKey,
  name: record.name,
  category: record.category as ServiceCategory,
  gender: record.gender,
  description: record.description,
  price: record.price,
  priceType: record.priceType,
  minPrice: record.minPrice ?? undefined,
  maxPrice: record.maxPrice ?? undefined,
  displayPrice: record.priceType === 'starting_at' ? `${formatINR(record.price)}+` : undefined,
  hairLength: record.hairLength ?? undefined,
  durationMinutes: record.durationMinutes,
  priceConfirmed: record.priceConfirmed,
  requiresConfirmation: record.requiresConfirmation,
  sourceNote: record.sourceNote ?? undefined,
  isActive: record.isActive,
  imageUrl: record.imageUrl ?? undefined,
  createdAt: record.createdAt,
});

export const isFixedPriceService = (service: SalonService): boolean =>
  service.isActive && service.priceType === 'fixed' && service.priceConfirmed && !service.requiresConfirmation;
