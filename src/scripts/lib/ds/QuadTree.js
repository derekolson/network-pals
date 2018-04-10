// @flow
import Rect from '../geom/Rect';
import Vector2 from '../geom/Vector2';

type Subdivisions<T> = [QuadTree<T>, QuadTree<T>, QuadTree<T>, QuadTree<T>];

export default class QuadTree<T> {
  static NODE_CAPACITY = 1;

  _boundary: Rect;
  _points: T[] = [];
  _subdivisions: null | Subdivisions<T> = null;
  _getPosition: T => Vector2;

  constructor(boundary: Rect, getPosition: T => Vector2) {
    this._boundary = boundary;
    this._getPosition = getPosition;
  }

  debugDraw(color: string) {
    this._boundary.debugDraw(color);
    if (this._subdivisions) {
      this._subdivisions.forEach(subdivision => subdivision.debugDraw(color));
    }
  }

  insert(item: T): boolean {
    const point = this._getPosition(item);
    if (!this._boundary.containsPoint(point)) return false;

    if (this._points.length < QuadTree.NODE_CAPACITY) {
      this._points.push(item);
      return true;
    }

    const subdivisions = this._getSubdivisions();

    if (subdivisions[0].insert(item)) return true;
    if (subdivisions[1].insert(item)) return true;
    if (subdivisions[2].insert(item)) return true;
    if (subdivisions[3].insert(item)) return true;

    throw new Error('Couldnt insert item');
  }

  _getSubdivisions(): Subdivisions<T> {
    if (this._subdivisions) return this._subdivisions;

    const subdivisions = [
      new QuadTree(
        Rect.fromLeftTopRightBottom(
          this._boundary.left,
          this._boundary.top,
          this._boundary.center.x,
          this._boundary.center.y,
        ),
        this._getPosition,
      ),
      new QuadTree(
        Rect.fromLeftTopRightBottom(
          this._boundary.center.x,
          this._boundary.top,
          this._boundary.right,
          this._boundary.center.y,
        ),
        this._getPosition,
      ),
      new QuadTree(
        Rect.fromLeftTopRightBottom(
          this._boundary.left,
          this._boundary.center.y,
          this._boundary.center.x,
          this._boundary.bottom,
        ),
        this._getPosition,
      ),
      new QuadTree(
        Rect.fromLeftTopRightBottom(
          this._boundary.center.x,
          this._boundary.center.y,
          this._boundary.right,
          this._boundary.bottom,
        ),
        this._getPosition,
      ),
    ];

    this._subdivisions = subdivisions;
    return subdivisions;
  }
}
