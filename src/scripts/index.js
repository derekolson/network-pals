// @flow
import invariant from 'invariant';
import Scene from './render/Scene';
import Producer from './thangs/Producer';

// colors:
// https://coolors.co/f8ffe5-06d6a0-1b9aaa-ef476f-ffc43d

const scene = new Scene(800, 600, window.devicePixelRatio);
const root = document.getElementById('root');
invariant(root, '#root must be present');
scene.appendTo(root);

const producer = new Producer(100, 100);
scene.addChild(producer);

scene.start();

// auto-refresh in dev mode
// $FlowFixMe - this isn't included in flow's module typedef
if (module.hot) module.hot.dispose(() => window.location.reload());
