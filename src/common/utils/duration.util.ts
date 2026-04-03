const DURATION_UNITS_IN_SECONDS: Record<string, number> = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 60 * 60 * 24,
};

export function durationToSeconds(
  value: string | number | undefined,
  fallbackInSeconds: number,
): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (!value) {
    return fallbackInSeconds;
  }

  const normalizedValue = String(value).trim().toLowerCase();

  if (/^\d+$/.test(normalizedValue)) {
    return Number(normalizedValue);
  }

  const match = normalizedValue.match(/^(\d+)([smhd])$/);

  if (!match) {
    return fallbackInSeconds;
  }

  const [, amount, unit] = match;
  return Number(amount) * DURATION_UNITS_IN_SECONDS[unit];
}
