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
    this.canvas.width = scene.width * scene.scaleFactor;
    this.canvas.height = scene.height * scene.scaleFactor;
    this.ctx.scale(scene.scaleFactor, scene.scaleFactor);
    window.HAIRLINE = 1 / scene.scaleFactor;
  }

  afterDraw(sceneCtx: CanvasRenderingContext2D) {
    const { width, height } = this.getScene();
    sceneCtx.drawImage(this.canvas, 0, 0, width, height);
    this.ctx.clearRect(0, 0, width, height);
  }
}
