// @flow

export const lerp = (a: number, b: number, n: number): number =>
  a + n * (b - a);

export const mapRange = (
  a1: number,
  b1: number,
  a2: number,
  b2: number,
  n: number,
): number => lerp(a2, b2, (n - a1) / (b1 - a1));

export const constrain = (min: number, max: number, n: number): number =>
  Math.min(max, Math.max(min, n));
