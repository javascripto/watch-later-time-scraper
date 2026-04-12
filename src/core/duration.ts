import {
  MILLISECONDS_IN_ONE_DAY,
  MILLISECONDS_IN_ONE_HOUR,
  MILLISECONDS_IN_ONE_MINUTE,
  MILLISECONDS_IN_ONE_SECOND,
  MILLISECONDS_IN_ONE_WEEK,
  SECONDS_IN_ONE_HOUR,
  SECONDS_IN_ONE_MINUTE,
  TIME_PATTERN,
} from './constants';
import { padZero, restOfDivision } from './math';

type DurationParams = {
  minutes?: number;
  hours?: number;
  seconds?: number;
  milliseconds?: number;
};

export class Duration {
  private readonly milliseconds: number;

  constructor({
    minutes = 0,
    hours = 0,
    seconds = 0,
    milliseconds = 0,
  }: DurationParams = {}) {
    this.milliseconds = 0
      + hours * MILLISECONDS_IN_ONE_HOUR
      + minutes * MILLISECONDS_IN_ONE_MINUTE
      + seconds * MILLISECONDS_IN_ONE_SECOND
      + milliseconds;
  }

  static fromTimeString(timeString: string): Duration {
    const value = timeString.trim();
    const parts = value.split(':');
    const numbers = parts.map(Number);
    const parseError = new Error(`${timeString} could not be parsed`);

    if (!TIME_PATTERN.test(value)) {
      throw parseError;
    }

    if (numbers.some(Number.isNaN)) {
      throw parseError;
    }

    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    switch (numbers.length) {
      case 1:
        [seconds] = numbers;
        return new Duration({ seconds });
      case 2:
        [minutes, seconds] = numbers;
        return new Duration({ minutes, seconds });
      case 3:
        [hours, minutes, seconds] = numbers;
        return new Duration({ hours, minutes, seconds });
      default:
        throw parseError;
    }
  }

  get inMilliseconds() {
    return this.milliseconds;
  }

  get inSeconds() {
    return this.milliseconds / MILLISECONDS_IN_ONE_SECOND;
  }

  get inMinutes() {
    return this.milliseconds / MILLISECONDS_IN_ONE_MINUTE;
  }

  get inHours() {
    return this.milliseconds / MILLISECONDS_IN_ONE_HOUR;
  }

  get inDays() {
    return this.milliseconds / MILLISECONDS_IN_ONE_DAY;
  }

  get inWeeks() {
    return this.milliseconds / MILLISECONDS_IN_ONE_WEEK;
  }

  toTimeString() {
    const totalSeconds = Math.abs(this.inSeconds);
    if (totalSeconds < SECONDS_IN_ONE_MINUTE) {
      return `00:${padZero(totalSeconds)}`;
    }

    if (totalSeconds < SECONDS_IN_ONE_HOUR) {
      const minutes = padZero(totalSeconds / SECONDS_IN_ONE_MINUTE);
      const seconds = padZero(restOfDivision(totalSeconds, SECONDS_IN_ONE_MINUTE));
      return `${minutes}:${seconds}`;
    }

    const hours = padZero(totalSeconds / SECONDS_IN_ONE_HOUR);
    const minutes = padZero(
      restOfDivision(totalSeconds, SECONDS_IN_ONE_HOUR) / SECONDS_IN_ONE_MINUTE,
    );
    const seconds = padZero(restOfDivision(totalSeconds, SECONDS_IN_ONE_MINUTE));
    return `${hours}:${minutes}:${seconds}`;
  }
}
