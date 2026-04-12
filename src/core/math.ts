export function padZero(number = 0): string {
  const integer = Math.trunc(number);
  if (integer < 10) {
    return `0${integer}`;
  }

  return `${integer}`;
}

export function restOfDivision(dividend: number, divider: number): number {
  const quotient = Math.trunc(dividend / divider);
  return dividend - quotient * divider;
}
