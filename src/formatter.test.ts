import { describe, test, expect } from 'vitest';
import { Duration } from './core/index.js';
import { formatDuration } from './formatter.js';

describe('formatDuration', () => {
  test('formata duração menor que 1 hora', () => {
    const duration = new Duration({ minutes: 45, seconds: 30 });
    const result = formatDuration(duration);

    expect(result.clock).toBe('45:30');
    expect(result.human).toBe('0h 45min');
  });

  test('formata duração de exatamente 1 hora', () => {
    const duration = new Duration({ hours: 1 });
    const result = formatDuration(duration);

    expect(result.clock).toBe('01:00:00');
    expect(result.human).toBe('1h 00min');
  });

  test('formata duração maior que 24 horas', () => {
    const duration = new Duration({ hours: 123, minutes: 59, seconds: 59 });
    const result = formatDuration(duration);

    expect(result.clock).toBe('123:59:59');
    expect(result.human).toBe('123h 59min');
  });

  test('formata duração zero', () => {
    const duration = new Duration({ seconds: 0 });
    const result = formatDuration(duration);

    expect(result.clock).toBe('00:00');
    expect(result.human).toBe('0h 00min');
  });
});
