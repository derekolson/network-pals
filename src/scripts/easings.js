// @flow
// https://gist.github.com/rezoner/713615dabedb59a15470
// http://gsgd.co.uk/sandbox/jquery/easing/
export const linear = (n: number): number => n;

export const inQuad = (t: number): number => t * t;

export const outQuad = (t: number): number => t * (2 - t);

export const inOutQuad = (t: number): number =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

export const inCubic = (t: number): number => t * t * t;

export const outCubic = (t: number): number => --t * t * t + 1;

export const inOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

export const inQuart = (t: number): number => t * t * t * t;

export const outQuart = (t: number): number => 1 - --t * t * t * t;

export const inOutQuart = (t: number): number =>
  t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;

export const inQuint = (t: number): number => t * t * t * t * t;

export const outQuint = (t: number): number => 1 + --t * t * t * t * t;

export const inOutQuint = (t: number): number =>
  t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;

export const inSine = (t: number): number =>
  -1 * Math.cos(t / 1 * (Math.PI * 0.5)) + 1;

export const outSine = (t: number): number => Math.sin(t / 1 * (Math.PI * 0.5));

export const inOutSine = (t: number): number =>
  -1 / 2 * (Math.cos(Math.PI * t) - 1);

export const inExpo = (t: number): number =>
  t == 0 ? 0 : Math.pow(2, 10 * (t - 1));

export const outExpo = (t: number): number =>
  t == 1 ? 1 : -Math.pow(2, -10 * t) + 1;

export const inOutExpo = (t: number): number => {
  if (t == 0) return 0;
  if (t == 1) return 1;
  if ((t /= 1 / 2) < 1) return 1 / 2 * Math.pow(2, 10 * (t - 1));
  return 1 / 2 * (-Math.pow(2, -10 * --t) + 2);
};

export const inCirc = (t: number): number => -1 * (Math.sqrt(1 - t * t) - 1);

export const outCirc = (t: number): number => Math.sqrt(1 - (t = t - 1) * t);

export const inOutCirc = (t: number): number => {
  if ((t /= 1 / 2) < 1) return -1 / 2 * (Math.sqrt(1 - t * t) - 1);
  return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1);
};
