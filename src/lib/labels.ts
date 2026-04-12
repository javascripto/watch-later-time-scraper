import { KNOWN_NON_DURATION_LABELS, TIME_PATTERN } from './constants';
import { Duration } from './duration';

export function parseDurationLabel(label: string): Duration | null {
  const value = label.trim();

  if (!value) {
    return null;
  }

  if (KNOWN_NON_DURATION_LABELS.has(value.toUpperCase())) {
    return null;
  }

  if (!TIME_PATTERN.test(value)) {
    return null;
  }

  return Duration.fromTimeString(value);
}
