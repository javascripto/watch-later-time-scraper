import { vi } from 'vitest';

vi.mock('./constants', async () => {
  const actual =
    await vi.importActual<typeof import('./constants')>('./constants');

  return {
    ...actual,
    TIME_PATTERN: /^.*$/,
  };
});

import { Duration } from './duration';

describe('Duration.fromTimeString error branches', () => {
  test('throws when parsed numbers contain NaN', () => {
    expect(() => Duration.fromTimeString('AO VIVO')).toThrow(
      /could not be parsed/,
    );
  });

  test('throws when parsed parts length is not 1, 2, or 3', () => {
    expect(() => Duration.fromTimeString('1:2:3:4')).toThrow(
      /could not be parsed/,
    );
  });
});
