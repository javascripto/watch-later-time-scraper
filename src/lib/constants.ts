export const ONE_SECOND_MD = 1000;
export const ONE_MINUTE_MS = ONE_SECOND_MD * 60;
export const ONE_HOUR_MS = ONE_MINUTE_MS * 60;
export const ONE_DAY_MS = ONE_HOUR_MS * 24;
export const ONE_WEEK_MS = ONE_DAY_MS * 7;
export const ONE_MINUTE_SEC = 60;
export const ONE_HOUR_SEC = ONE_MINUTE_SEC * ONE_MINUTE_SEC;

export const KNOWN_NON_DURATION_LABELS = new Set([
  'ESTREIA',
  'AO VIVO',
  'EM BREVE',
]);

export const TIME_PATTERN = /^\d+(?::\d+){0,2}$/;
