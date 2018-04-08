// @flow
import invariant from 'invariant';
import Scene from './render/Scene';
import Producer from './thangs/Producer';
import Road from './thangs/Road';
import Consumer from './thangs/Consumer';
import Intersection from './thangs/Intersection';

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

  const intersection1 = new Intersection(230, 100);
  scene.addChild(new Road(producer1, intersection1));
  scene.addChild(
    new Road(intersection1, consumer1, { points: [[400, 100]], autoRound: 50 }),
  );
  scene.addChild(
    new Road(intersection1, consumer2, {
      points: [[250, 100]],
      autoRound: 50,
    }),
  );
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
  const intersection = new Intersection(300, 300);
  const consumer1 = new Consumer(300, 100, 5000);
  const consumer2 = new Consumer(500, 300, 5000);
  const consumer3 = new Consumer(300, 500, 5000);
  scene.addChild(producer);
  scene.addChild(consumer1);
  scene.addChild(consumer2);
  scene.addChild(consumer3);

  scene.addChild(new Road(producer, intersection));
  scene.addChild(new Road(intersection, consumer1));
  scene.addChild(new Road(intersection, consumer2));
  scene.addChild(new Road(intersection, consumer3));
};

const scenario3 = () => {
  const northConsumer = new Consumer(100, 50, 100);
  const middleConsumer = new Consumer(100, 100, 100);
  const southConsumer = new Consumer(100, 150, 100);
  const eastProducer = new Producer(400, 200, 100);
  // const westProducer = new Producer(250, 200, 100);

  scene.addChild(northConsumer);
  scene.addChild(middleConsumer);
  scene.addChild(southConsumer);
  scene.addChild(eastProducer);
  // scene.addChild(westProducer);

  const mainIntersection = new Intersection(230, 100);
  const eastProducerSplit = new Intersection(400, 150);
  scene.addChild(new Road(eastProducer, eastProducerSplit));
  scene.addChild(
    new Road(eastProducerSplit, mainIntersection, {
      points: [[400, 120], [500, 150], [450, 80], [350, 100], [300, 20]],
      autoRound: 50,
    }),
  );
  // scene.addChild(
  //   new Road(
  //     eastProducerSplit,
  //     mainIntersection,
  //     Path.straightThroughPoints(
  //       eastProducerSplit.position,
  //       mainIntersection.position,
  //     ),
  //   ),
  // );

  // scene.addChild(new Road(westProducer, mainIntersection));
  scene.addChild(new Road(mainIntersection, northConsumer));
  scene.addChild(new Road(mainIntersection, middleConsumer));
  scene.addChild(new Road(mainIntersection, southConsumer));
};

const go = () => {
  if (window.scene) return;
  scene = new Scene(800, 600, window.devicePixelRatio);
  window.scene = scene;
  const root = document.getElementById('root');
  invariant(root, '#root must be present');
  scene.appendTo(root);

  scenario3();

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
