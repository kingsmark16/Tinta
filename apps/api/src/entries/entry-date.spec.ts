import { isValidEntryDate } from './entry-date.js';

describe('isValidEntryDate', () => {
  it.each(['2024-02-29', '2000-02-29', '2026-09-23'])('accepts %s', (value) => {
    expect(isValidEntryDate(value)).toBe(true);
  });

  it.each([
    '2025-02-29',
    '1900-02-29',
    '2026-04-31',
    '2026-9-3',
    '2026-09-23T00:00:00Z',
    '0000-01-01',
    null,
    20260923,
  ])('rejects %s', (value) => {
    expect(isValidEntryDate(value)).toBe(false);
  });
});
