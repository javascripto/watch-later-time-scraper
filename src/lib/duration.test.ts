import {
  Duration,
  getPlaylistDurationFromLabels,
  parseDurationLabel,
} from './index';

describe('Duration.fromTimeString', () => {
  test('parses ss', () => {
    expect(Duration.fromTimeString('45').inSeconds).toBe(45);
  });

  test('parses mm:ss', () => {
    expect(Duration.fromTimeString('12:34').inSeconds).toBe(754);
  });

  test('parses hh:mm:ss', () => {
    expect(Duration.fromTimeString('01:02:03').inSeconds).toBe(3723);
  });

  test('throws for invalid value', () => {
    expect(() => Duration.fromTimeString('AO VIVO')).toThrow(
      /could not be parsed/,
    );
  });
});

describe('Duration.toTimeString', () => {
  test('formats less than one minute as 00:ss', () => {
    expect(new Duration({ seconds: 9 }).toTimeString()).toBe('00:09');
  });

  test('formats less than one hour as mm:ss', () => {
    expect(new Duration({ minutes: 7, seconds: 5 }).toTimeString()).toBe(
      '07:05',
    );
  });

  test('formats one hour or more as hh:mm:ss', () => {
    expect(
      new Duration({ hours: 1, minutes: 2, seconds: 3 }).toTimeString(),
    ).toBe('01:02:03');
  });

  test('uses absolute value for negative durations', () => {
    expect(new Duration({ seconds: -65 }).toTimeString()).toBe('01:05');
  });
});

describe('Duration unit getters', () => {
  test('exposes values in all units', () => {
    const exact = new Duration({
      hours: 24,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    expect(exact.inMilliseconds).toBe(86_400_000);
    expect(exact.inSeconds).toBe(86_400);
    expect(exact.inMinutes).toBe(1_440);
    expect(exact.inHours).toBe(24);
    expect(exact.inDays).toBe(1);
    expect(exact.inWeeks).toBeCloseTo(1 / 7);
  });
});

describe('parseDurationLabel', () => {
  test('returns null for known non-duration labels', () => {
    expect(parseDurationLabel('ESTREIA')).toBeNull();
    expect(parseDurationLabel('ao vivo')).toBeNull();
    expect(parseDurationLabel('EM BREVE')).toBeNull();
  });

  test('returns null for non-time values', () => {
    expect(parseDurationLabel('not-a-time')).toBeNull();
    expect(parseDurationLabel('')).toBeNull();
  });

  test('returns duration for valid time strings', () => {
    expect(parseDurationLabel('03:10')?.inSeconds).toBe(190);
  });
});

describe('getPlaylistDurationFromLabels', () => {
  test('sums only valid labels', () => {
    const duration = getPlaylistDurationFromLabels([
      '10:00',
      'AO VIVO',
      '01:30',
      'EM BREVE',
      'invalid',
    ]);

    expect(duration.inSeconds).toBe(690);
    expect(duration.toTimeString()).toBe('11:30');
  });
});
