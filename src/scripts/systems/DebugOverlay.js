// @flow
import type Scene from '../lib/core/Scene';
import SceneSystem from '../lib/core/SceneSystem';

export default class DebugOverlay extends SceneSystem {
  static systemName = 'DebugOverlay';

  canvas: HTMLCanvasElement = document.createElement('canvas');
  ctx: CanvasRenderingContext2D = this.canvas.getContext('2d');

  constructor() {
    super();

    window.debugCanvas = this.canvas;
    window.debugContext = this.ctx;
  }

  afterAddToScene(scene: Scene) {
    super.afterAddToScene(scene);
    this.canvas.width = scene.width;
    this.canvas.height = scene.height;
  }

  afterDraw(sceneCtx: CanvasRenderingContext2D) {
    sceneCtx.drawImage(this.canvas, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
