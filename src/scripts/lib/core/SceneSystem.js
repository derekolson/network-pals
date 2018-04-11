// @flow
import invariant from 'invariant';
import Scene from './Scene';

const DEFAULT_NAME = '$$AbstractSceneSystem$$';

export default class SceneSystem {
  static systemName = DEFAULT_NAME;
  _scene: Scene | null = null;

  constructor() {
    invariant(
      this.constructor !== SceneSystem,
      'SceneSystem is an abstract class that must be extended',
    );
    invariant(
      this.constructor.systemName !== DEFAULT_NAME,
      'classes extending SceneSystem must override SceneSystem.systemName',
    );
  }

  getScene(): Scene {
    invariant(this._scene, 'scene is required');
    return this._scene;
  }

  afterAddToScene(scene: Scene) {
    this._scene = scene;
  }

  // eslint-disable-next-line no-unused-vars
  beforeRemoveFromScene(scene: Scene) {
    this._scene = null;
  }

  // eslint-disable-next-line no-unused-vars
  beforeUpdate(delta: number) {}

  // eslint-disable-next-line no-unused-vars
  afterUpdate(delta: number) {}

  // eslint-disable-next-line no-unused-vars
  beforeDraw(ctx: CanvasRenderingContext2D, time: number) {}

  // eslint-disable-next-line no-unused-vars
  afterDraw(ctx: CanvasRenderingContext2D, time: number) {}
}
