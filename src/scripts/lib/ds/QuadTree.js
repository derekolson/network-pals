// @flow
import Rect from '../geom/Rect';
import type Circle from '../geom/Circle';
import Vector2 from '../geom/Vector2';

type Subdivisions<T> = [QuadTree<T>, QuadTree<T>, QuadTree<T>, QuadTree<T>];

export default class QuadTree<T> {
  static NODE_CAPACITY = 4;

  boundary: Rect;
  _items: (T | void)[] = [];
  _nextItemIndex: number = 0;
  _subdivisions: null | Subdivisions<T> = null;
  _getPosition: T => Vector2;

  constructor(boundary: Rect, getPosition: T => Vector2) {
    this.boundary = boundary;
    this._getPosition = getPosition;
  }

  debugDraw(color: string) {
    this.boundary.debugDraw(color);
    if (this._subdivisions) {
      this._subdivisions.forEach(subdivision => subdivision.debugDraw(color));
    }
  }

  insert(item: T): boolean {
    const point = this._getPosition(item);
    if (!this.boundary.containsPoint(point)) return false;

    if (this._nextItemIndex < QuadTree.NODE_CAPACITY) {
      this._items[this._nextItemIndex] = item;
      this._nextItemIndex++;
      return true;
    }

    const subdivisions = this._getSubdivisions();

    if (subdivisions[0].insert(item)) return true;
    if (subdivisions[1].insert(item)) return true;
    if (subdivisions[2].insert(item)) return true;
    if (subdivisions[3].insert(item)) return true;

    throw new Error('Couldnt insert item');
  }

  remove(item: T): boolean {
    const point = this._getPosition(item);
    if (!this.boundary.containsPoint(point)) return false;

    const index = this._items.indexOf(item);
    if (index !== -1) {
      this._items.splice(index, 1);
      this._nextItemIndex--;
      return true;
    }

    const subdivisions = this._subdivisions;
    if (subdivisions) {
      if (subdivisions[0].remove(item)) return true;
      if (subdivisions[1].remove(item)) return true;
      if (subdivisions[2].remove(item)) return true;
      if (subdivisions[3].remove(item)) return true;
    }

    return false;
  }

  clear() {
    for (let i = 0; i < this._nextItemIndex; i++) {
      this._items[i] = undefined;
      this._nextItemIndex = 0;
    }

    if (this._subdivisions) {
      this._subdivisions.forEach(subdivision => subdivision.clear());
    }
  }

  findItemsInRect(rect: Rect): T[] {
    const foundItems = [];

    if (!this.boundary.intersectsRect(rect)) return foundItems;

    for (let i = 0; i < this._nextItemIndex; i++) {
      const item = this._items[i];
      if (item == null) continue;
      const point = this._getPosition(item);
      if (rect.containsPoint(point)) foundItems.push(item);
    }

    const subdivisions = this._subdivisions;
    if (!subdivisions) return foundItems;

    if (subdivisions[0].boundary.intersectsRect(rect)) {
      foundItems.push(...subdivisions[0].findItemsInRect(rect));
    }
    if (subdivisions[1].boundary.intersectsRect(rect)) {
      foundItems.push(...subdivisions[1].findItemsInRect(rect));
    }
    if (subdivisions[2].boundary.intersectsRect(rect)) {
      foundItems.push(...subdivisions[2].findItemsInRect(rect));
    }
    if (subdivisions[3].boundary.intersectsRect(rect)) {
      foundItems.push(...subdivisions[3].findItemsInRect(rect));
    }

    return foundItems;
  }

  findItemsInCircle(circle: Circle): T[] {
    return this.findItemsInRect(circle.boundingBox).filter(item =>
      circle.containsPoint(this._getPosition(item)),
    );
  }

  _getSubdivisions(): Subdivisions<T> {
    if (this._subdivisions) return this._subdivisions;

    const subdivisions = [
      new QuadTree(
        Rect.fromLeftTopRightBottom(
          this.boundary.left,
          this.boundary.top,
          this.boundary.center.x,
          this.boundary.center.y,
        ),
        this._getPosition,
      ),
      new QuadTree(
        Rect.fromLeftTopRightBottom(
          this.boundary.center.x,
          this.boundary.top,
          this.boundary.right,
          this.boundary.center.y,
        ),
        this._getPosition,
      ),
      new QuadTree(
        Rect.fromLeftTopRightBottom(
          this.boundary.left,
          this.boundary.center.y,
          this.boundary.center.x,
          this.boundary.bottom,
        ),
        this._getPosition,
      ),
      new QuadTree(
        Rect.fromLeftTopRightBottom(
          this.boundary.center.x,
          this.boundary.center.y,
          this.boundary.right,
          this.boundary.bottom,
        ),
        this._getPosition,
      ),
    ];

    this._subdivisions = subdivisions;
    return subdivisions;
  }
}
