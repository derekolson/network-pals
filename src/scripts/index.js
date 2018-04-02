// @flow
import invariant from 'invariant';
import Scene from './render/Scene';
import Vector2 from './geom/Vector2';
import Path from './geom/path/Path';
import StraightPathSegment from './geom/path/StraightPathSegment';
import CirclePathSegment from './geom/path/CirclePathSegment';
import Producer from './thangs/Producer';
import Road from './thangs/Road';
import Consumer from './thangs/Consumer';

// colors:
// https://coolors.co/f8ffe5-06d6a0-1b9aaa-ef476f-ffc43d

const scene = new Scene(800, 600, window.devicePixelRatio);
const root = document.getElementById('root');
invariant(root, '#root must be present');
scene.appendTo(root);

const producer1 = new Producer(100, 100, 500);
const producer2 = new Producer(100, 300, 1000);
const consumer = new Consumer(400, 200, 1000);
scene.addChild(producer1);
scene.addChild(producer2);
scene.addChild(consumer);

const path1 = new Path();
path1.addSegments(
  new StraightPathSegment(new Vector2(130, 100), new Vector2(380, 100)),
  new CirclePathSegment(new Vector2(380, 120), 20, Math.PI * -0.5, 0),
  new StraightPathSegment(new Vector2(400, 120), new Vector2(400, 170)),
);
const road1 = new Road(producer1, consumer, path1);
scene.addChild(road1);

const path2 = new Path();
path2.addSegments(
  new StraightPathSegment(new Vector2(130, 300), new Vector2(380, 300)),
  new CirclePathSegment(new Vector2(380, 280), 20, Math.PI * 0.5, 0),
  new StraightPathSegment(new Vector2(400, 280), new Vector2(400, 230)),
);
const road2 = new Road(producer2, consumer, path2);
scene.addChild(road2);

scene.start();

// auto-refresh in dev mode
// $FlowFixMe - this isn't included in flow's module typedef
if (module.hot)
  module.hot.dispose(() => {
    scene.stop();
    root.removeChild(scene._canvas);
  });
