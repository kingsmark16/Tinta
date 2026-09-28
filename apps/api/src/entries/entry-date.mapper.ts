import { isValidEntryDate } from './entry-date.js';

export function toDatabaseEntryDate(value: string): Date {
  if (!isValidEntryDate(value)) {
    throw new RangeError('entryDate must be a valid YYYY-MM-DD date');
  }

  return new Date(`${value}T00:00:00.000Z`);
}

export function fromDatabaseEntryDate(value: Date): string {
  if (Number.isNaN(value.getTime())) {
    throw new RangeError('Database entry date must be valid');
  }

  return value.toISOString().slice(0, 10);
}
