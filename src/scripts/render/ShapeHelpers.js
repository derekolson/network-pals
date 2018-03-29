// @flow

export default {
  circle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  },
};
