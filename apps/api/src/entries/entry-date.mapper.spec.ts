import {
  fromDatabaseEntryDate,
  toDatabaseEntryDate,
} from './entry-date.mapper.js';

describe('entry date persistence mapping', () => {
  it.each([
    ['2024-02-29', '2024-02-29T00:00:00.000Z'],
    ['2026-01-01', '2026-01-01T00:00:00.000Z'],
    ['2026-12-31', '2026-12-31T00:00:00.000Z'],
  ])('converts %s to UTC midnight for Prisma', (day, expectedInstant) => {
    expect(toDatabaseEntryDate(day).toISOString()).toBe(expectedInstant);
  });

  it.each(['2025-02-29', '2026-02-30', '2026-9-3'])(
    'rejects an invalid diary day %s',
    (day) => {
      expect(() => toDatabaseEntryDate(day)).toThrow(RangeError);
    },
  );

  it('returns the UTC day without using the local calendar date', () => {
    expect(fromDatabaseEntryDate(new Date('2026-03-01T23:30:00.000Z'))).toBe(
      '2026-03-01',
    );
  });

  it('rejects an invalid database date', () => {
    expect(() => fromDatabaseEntryDate(new Date(Number.NaN))).toThrow(
      RangeError,
    );
  });
});
