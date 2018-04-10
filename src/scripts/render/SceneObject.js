// @flow
import invariant from 'invariant';
import type Scene from './Scene';

const constructorIdCounts = {};

const getNextCount = (name: string): string => {
  if (!constructorIdCounts[name]) constructorIdCounts[name] = 0;
  return `${name}@${constructorIdCounts[name]++}`;
};

export default class SceneObject {
  id: string = getNextCount(this.constructor.name);
  _scene: Scene | null = null;

  getScene(): Scene {
    invariant(this._scene, 'scene must be present');
    return this._scene;
  }

  // eslint-disable-next-line no-unused-vars
  draw(ctx: CanvasRenderingContext2D, elapsedTime: number) {}

  // eslint-disable-next-line no-unused-vars
  update(delta: number) {}

  onAddedToScene(scene: Scene) {
    this._scene = scene;
  }

  onRemovedFromScene() {
    this._scene = null;
  }
}
