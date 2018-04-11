// @flow
import type Scene from '../lib/core/Scene';
import SceneSystem from '../lib/core/SceneSystem';
import QuadTree from '../lib/ds/QuadTree';
import type Circle from '../lib/geom/Circle';
import Rect from '../lib/geom/Rect';
import Traveller from '../entities/Traveller';

export default class TravellerFinder extends SceneSystem {
  static systemName = 'TravellerFinder';

  _quadTree: QuadTree<Traveller>;

  removeTraveller(traveller: Traveller) {
    this._quadTree.remove(traveller);
  }

  afterAddToScene(scene: Scene) {
    super.afterAddToScene(scene);
    this._quadTree = new QuadTree(
      Rect.fromLeftTopRightBottom(0, 0, scene.width, scene.height),
      traveller => traveller.position,
    );
  }

  beforeUpdate() {
    const scene = this.getScene();
    this._quadTree.clear();
    scene.children.forEach(child => {
      if (child instanceof Traveller) {
        this._quadTree.insert(child);
      }
    });
    // this._quadTree.debugDraw('red');
  }

  findTravellersInCircle(circle: Circle) {
    return this._quadTree.findItemsInCircle(circle);
  }
}
