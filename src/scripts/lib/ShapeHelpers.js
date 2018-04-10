// @flow
import type Path from './geom/path/Path';
import StraightPathSegment from './geom/path/StraightPathSegment';
import CirclePathSegment from './geom/path/CirclePathSegment';

export default {
  circle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  },
  path(ctx: CanvasRenderingContext2D, path: Path) {
    path.segments.forEach((segment, i) => {
      if (i === 0) ctx.moveTo(segment.start.x, segment.start.y);
      if (segment instanceof StraightPathSegment) {
        ctx.lineTo(segment.end.x, segment.end.y);
      } else if (segment instanceof CirclePathSegment) {
        ctx.arc(
          segment.circle.center.x,
          segment.circle.center.y,
          segment.circle.radius,
          segment.startAngle,
          segment.endAngle,
          segment.isAnticlockwise,
        );
      } else {
        throw new Error(`Unknown path segment type: ${segment.toString()}`);
      }
    });
  },
};
