// @flow
import invariant from 'invariant';
import Scene from './render/Scene';
import Producer from './thangs/Producer';
import Road from './thangs/Road';
import Consumer from './thangs/Consumer';

// colors:
// https://coolors.co/f8ffe5-06d6a0-1b9aaa-ef476f-ffc43d

const scene = new Scene(800, 600, window.devicePixelRatio);
const root = document.getElementById('root');
invariant(root, '#root must be present');
scene.appendTo(root);

const producer1 = new Producer(100, 100);
const producer2 = new Producer(200, 300, 2500);
const consumer = new Consumer(300, 200, 2500);
scene.addChild(producer1);
scene.addChild(producer2);
scene.addChild(consumer);

const road = new Road(producer1, consumer);
scene.addChild(road);

scene.start();

// auto-refresh in dev mode
// $FlowFixMe - this isn't included in flow's module typedef
if (module.hot) module.hot.dispose(() => window.location.reload());
