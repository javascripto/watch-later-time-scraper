import { Duration } from './duration';
import { parseDurationLabel } from './labels';

export function getPlaylistDurationFromLabels(
  labels: readonly string[],
): Duration {
  const totalSeconds = labels.reduce((acc, label) => {
    const duration = parseDurationLabel(label);
    return duration ? acc + duration.inSeconds : acc;
  }, 0);

  return new Duration({ seconds: totalSeconds });
}
