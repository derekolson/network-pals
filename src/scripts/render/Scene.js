// @flow
import invariant from 'invariant';
import type SceneObject from './SceneObject';

export default class Scene {
  _canvas: HTMLCanvasElement;
  _ctx: CanvasRenderingContext2D;
  _scaleFactor: number;
  _children: SceneObject[] = [];
  _isPlaying: boolean = false;
  _frameHandle: string | null = null;
  _lastElapsedTime: number | null = null;

  constructor(width: number, height: number, scaleFactor: number = 1) {
    this._canvas = document.createElement('canvas');
    this._canvas.width = width * scaleFactor;
    this._canvas.height = height * scaleFactor;
    this._canvas.style.width = `${width}px`;
    this._canvas.style.height = `${height}px`;
    this._ctx = this._canvas.getContext('2d');
    this._scaleFactor = scaleFactor;

    this._setupVisiblityChange();
  }

  get width(): number {
    return this._canvas.width / this._scaleFactor;
  }

  get height(): number {
    return this._canvas.height / this._scaleFactor;
  }

  get isPlaying(): boolean {
    return this._frameHandle !== null && this._isPlaying;
  }

  set isPlaying(newValue: boolean) {
    invariant(
      this._frameHandle !== null,
      'cannot set isPlaying without calling start',
    );
    this._isPlaying = newValue;
  }

  appendTo(element: HTMLElement) {
    element.appendChild(this._canvas);
  }

  addChild(child: SceneObject) {
    this._children.push(child);
    child.onAddedToScene(this);
  }

  addChildBefore(targetChild: SceneObject, newChild: SceneObject) {
    const index = this._children.indexOf(targetChild);
    invariant(index !== -1, 'target child must be present');

    this.addChildAtIndex(index, newChild);
  }

  addChildAfter(targetChild: SceneObject, newChild: SceneObject) {
    const index = this._children.indexOf(targetChild);
    invariant(index !== -1, 'target child must be present');

    this.addChildAtIndex(index + 1, newChild);
  }

  addChildAtIndex(index: number, child: SceneObject) {
    this._children.splice(index, 0, child);
    child.onAddedToScene(this);
  }

  removeChild(child: SceneObject): boolean {
    const index = this._children.indexOf(child);
    if (index === -1) return false;

    this.removeChildAtIndex(index);
    return true;
  }

  removeChildAtIndex(index: number): SceneObject {
    const child = this._children[index];
    this._children.splice(index, 1);
    child.onRemovedFromScene();
    return child;
  }

  draw(elapsedTime: number) {
    this._ctx.clearRect(0, 0, this.width, this.height);
    this._ctx.save();
    this._ctx.scale(this._scaleFactor, this._scaleFactor);
    this._children.forEach(child => child.draw(this._ctx, elapsedTime));
    this._ctx.restore();
  }

  update(delta: number) {
    this._children.forEach(child => child.update(delta));
  }

  start() {
    this._isPlaying = true;
    this._frameHandle = window.requestAnimationFrame(this._tick);
  }

  stop() {
    if (this._frameHandle !== null) {
      window.cancelAnimationFrame(this._frameHandle);
      this._frameHandle = null;
    }
    this._isPlaying = false;
    this._lastElapsedTime = null;
  }

  _tick = (elapsedTime: number) => {
    const lastElapsedTime = this._lastElapsedTime;
    if (lastElapsedTime !== null) {
      const deltaTime = elapsedTime - lastElapsedTime;
      if (this.isPlaying) {
        this.update(deltaTime);
        this.draw(elapsedTime);
      }
    }

    this._lastElapsedTime = elapsedTime;
    this._frameHandle = window.requestAnimationFrame(this._tick);
  };

  _setupVisiblityChange() {
    let playOnVisible = false;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.isPlaying) {
        playOnVisible = true;
        this.stop();
      }
      if (playOnVisible && !document.hidden) {
        playOnVisible = false;
        this.start();
      }
    });
  }
}
