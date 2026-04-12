import { Duration } from './core/index.js';

export type FormattedDuration = {
  clock: string;  // "123:59:59"
  human: string;  // "123h 59min"
};

export function formatDuration(duration: Duration): FormattedDuration {
  const totalSeconds = Math.trunc(duration.inSeconds);
  const hours = Math.trunc(totalSeconds / 3600);
  const minutes = Math.trunc((totalSeconds % 3600) / 60);

  return {
    clock: duration.toTimeString(),
    human: `${hours}h ${String(minutes).padStart(2, '0')}min`,
  };
}
