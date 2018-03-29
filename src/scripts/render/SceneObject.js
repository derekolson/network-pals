// @flow
import invariant from 'invariant';
import type Scene from './Scene';

export default class SceneObject {
  _scene: Scene | null = null;

  getScene(): Scene {
    invariant(this._scene, 'scene must be present');
    return this._scene;
  }

  // eslint-disable-next-line no-unused-vars
  draw(ctx: CanvasRenderingContext2D) {}

  // eslint-disable-next-line no-unused-vars
  update(delta: number) {}

  onAddToScene(scene: Scene) {
    this._scene = scene;
  }

  onRemoveFromScene() {
    this._scene = null;
  }
}
