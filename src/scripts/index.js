// @flow
import invariant from 'invariant';
import Scene from './lib/core/Scene';
import Consumer from './entities/networkNodes/Consumer';
import Producer from './entities/networkNodes/Producer';
import Road from './entities/Road';
import Junction from './entities/Junction';
import Pal from './entities/Pal';
import DebugOverlay from './systems/DebugOverlay';
import TravellerFinder from './systems/TravellerFinder';

const ROUND = 20;

let scene;

const scenario1 = () => {
  const producer1 = new Producer(100, 100, 500);
  // const producer2 = new Consumer(100, 300, 2500);
  const consumer1 = new Consumer(400, 200, 1500);
  const consumer2 = new Consumer(250, 200, 1500);
  scene.addChild(producer1);
  // scene.addChild(producer2);
  scene.addChild(consumer1);
  scene.addChild(consumer2);

  const junction1 = new Junction(250, 100, ROUND);
  scene.addChild(junction1);
  scene.addChild(new Road(producer1, junction1));
  scene.addChild(
    new Road(junction1, consumer1, { points: [[400, 100]], autoRound: ROUND }),
  );
  scene.addChild(new Road(junction1, consumer2));

  // const path2 = new Path();
  // path2.addSegments(
  //   new StraightPathSegment(new Vector2(130, 300), new Vector2(380, 300)),
  //   new CirclePathSegment(new Vector2(380, 280), 20, Math.PI * 0.5, 0),
  //   new StraightPathSegment(new Vector2(400, 280), new Vector2(400, 230)),
  // );
  // const road2 = new Road(producer2, consumer1, path2);
  // scene.addChild(road2);
};

const scenario2 = () => {
  const producer = new Producer(100, 300, 500);
  const junction = new Junction(300, 300, ROUND);
  const consumer1 = new Consumer(300, 100, 5000);
  const consumer2 = new Consumer(500, 300, 5000);
  const consumer3 = new Consumer(300, 500, 5000);

  scene.addChild(new Road(producer, junction));
  scene.addChild(new Road(junction, consumer1));
  scene.addChild(new Road(junction, consumer2));
  scene.addChild(new Road(junction, consumer3));

  scene.addChild(producer);
  scene.addChild(junction);
  scene.addChild(consumer1);
  scene.addChild(consumer2);
  scene.addChild(consumer3);
};

const scenario3 = () => {
  const northConsumer = new Consumer(100, 50, 1500);
  const middleConsumer = new Consumer(100, 100, 1500);
  const southConsumer = new Consumer(100, 150, 1500);
  const eastProducer = new Producer(400, 250, 500);
  // const westProducer = new Producer(250, 250, 100);

  scene.addChild(northConsumer);
  scene.addChild(middleConsumer);
  scene.addChild(southConsumer);
  scene.addChild(eastProducer);
  // scene.addChild(westProducer);

  const mainJunction = new Junction(230, 100, ROUND);
  const eastProducerSplit = new Junction(400, 170, ROUND);
  scene.addChild(mainJunction);
  scene.addChild(eastProducerSplit);
  scene.addChild(new Road(eastProducer, eastProducerSplit));
  scene.addChild(
    new Road(eastProducerSplit, mainJunction, {
      points: [[400, 120], [500, 150], [450, 80], [350, 100], [300, 20]],
      // points: [[400, 100]],
      autoRound: 50,
    }),
  );
  scene.addChild(
    new Road(eastProducerSplit, mainJunction, {
      points: [[230, 170]],
      autoRound: ROUND,
    }),
  );

  // scene.addChild(new Road(westProducer, mainJunction));
  scene.addChild(new Road(mainJunction, northConsumer));
  scene.addChild(new Road(mainJunction, middleConsumer));
  scene.addChild(new Road(mainJunction, southConsumer));
};

const scenario4 = () => {
  const producer1 = new Producer(100, 100, 1000);
  const producer2 = new Producer(300, 200, 1000);
  const producer3 = new Producer(100, 300, 1000);
  // const producer4 = new Producer(400, 100, 1000);
  const consumer1 = new Consumer(300, 100, 1000);
  const consumer2 = new Consumer(100, 200, 1000);
  const consumer3 = new Consumer(300, 300, 1000);
  // const consumer4 = new Consumer(430, 300, 1000);
  scene.addChild(producer1);
  scene.addChild(producer2);
  scene.addChild(producer3);
  // scene.addChild(producer4);
  scene.addChild(consumer1);
  scene.addChild(consumer2);
  scene.addChild(consumer3);
  // scene.addChild(consumer4);

  const junction = new Junction(200, 200, 30);
  scene.addChild(junction);

  scene.addChild(new Road(producer1, junction));
  scene.addChild(new Road(producer2, junction));
  scene.addChild(new Road(producer3, junction));
  scene.addChild(new Road(junction, consumer1));
  scene.addChild(new Road(junction, consumer2));
  scene.addChild(new Road(junction, consumer3));

  // scene.addChild(
  //   new Road(producer4, consumer4, {
  //     points: [[400, 250], [415, 250], [415, 150], [430, 150]],
  //     autoRound: 30,
  //   }),
  // );
};

const scenario5 = () => {
  const pal = new Pal(100, 50);
  scene.addChild(pal);
};

const go = () => {
  if (window.scene) return;
  scene = new Scene(800, 600, window.devicePixelRatio);
  window.scene = scene;
  const root = document.getElementById('root');
  invariant(root, '#root must be present');
  scene.appendTo(root);

  scene.addSystem(new DebugOverlay());
  scene.addSystem(new TravellerFinder());

  scenario5();

  scene.start();
};

go();

// auto-refresh in dev mode
// $FlowFixMe - this isn't included in flow's module typedef
if (module.hot) {
  module.hot.dispose(() => {
    window.location.reload();
  });
  // $FlowFixMe
  module.hot.accept(() => {
    window.location.reload();
  });
}
