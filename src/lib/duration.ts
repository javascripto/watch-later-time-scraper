import {
  ONE_DAY_MS,
  ONE_HOUR_MS,
  ONE_HOUR_SEC,
  ONE_MINUTE_MS,
  ONE_MINUTE_SEC,
  ONE_SECOND_MD,
  ONE_WEEK_MS,
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
    this.milliseconds =
      0 +
      hours * ONE_HOUR_MS +
      minutes * ONE_MINUTE_MS +
      seconds * ONE_SECOND_MD +
      milliseconds;
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
    return this.milliseconds / ONE_SECOND_MD;
  }

  get inMinutes() {
    return this.milliseconds / ONE_MINUTE_MS;
  }

  get inHours() {
    return this.milliseconds / ONE_HOUR_MS;
  }

  get inDays() {
    return this.milliseconds / ONE_DAY_MS;
  }

  get inWeeks() {
    return this.milliseconds / ONE_WEEK_MS;
  }

  toTimeString() {
    const totalSeconds = Math.abs(this.inSeconds);
    if (totalSeconds < ONE_MINUTE_SEC) {
      return `00:${padZero(totalSeconds)}`;
    }

    if (totalSeconds < ONE_HOUR_SEC) {
      const minutes = padZero(totalSeconds / ONE_MINUTE_SEC);
      const seconds = padZero(restOfDivision(totalSeconds, ONE_MINUTE_SEC));
      return `${minutes}:${seconds}`;
    }

    const hours = padZero(totalSeconds / ONE_HOUR_SEC);
    const minutes = padZero(
      restOfDivision(totalSeconds, ONE_HOUR_SEC) / ONE_MINUTE_SEC,
    );
    const seconds = padZero(restOfDivision(totalSeconds, ONE_MINUTE_SEC));
    return `${hours}:${minutes}:${seconds}`;
  }
}
