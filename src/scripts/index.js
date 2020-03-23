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

const ROUND = 50;

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
  const northConsumer = new Consumer(300, 550, 1500);
  const middleConsumer = new Consumer(100, 450, 1500);
  const southConsumer = new Consumer(100, 250, 1500);
  const eastProducer = new Producer(600, 150, 500);
  const westProducer = new Producer(100, 100, 500);
  // const westProducer = new Producer(250, 250, 100);

  scene.addChild(northConsumer);
  scene.addChild(middleConsumer);
  scene.addChild(southConsumer);
  scene.addChild(eastProducer);
  scene.addChild(westProducer);

  const mainJunction = new Junction(300, 150, ROUND);
  const eastProducerSplit = new Junction(500, 370, ROUND);
  const southConsumerJoin = new Junction(330, 400, ROUND);
  scene.addChild(mainJunction);
  scene.addChild(eastProducerSplit);
  scene.addChild(southConsumerJoin);
  scene.addChild(new Road(westProducer, mainJunction));
  scene.addChild(new Road(eastProducer, eastProducerSplit));
  scene.addChild(new Road(eastProducerSplit, southConsumerJoin));
  // scene.addChild(
  //   new Road(eastProducerSplit, mainJunction, {
  //     points: [[600, 280], [700, 50], [450, 180], [450, 100], [300, 20]],
  //     // points: [[400, 100]],
  //     autoRound: 50,
  //   }),
  // );
  scene.addChild(
    new Road(eastProducerSplit, mainJunction, {
      points: [[400, 300], [500, 50]],
      autoRound: ROUND,
    }),
  );

  // scene.addChild(new Road(westProducer, mainJunction));
  scene.addChild(new Road(mainJunction, southConsumerJoin));
  scene.addChild(new Road(southConsumerJoin, northConsumer));
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

  const root = document.getElementById('root');
  invariant(root, '#root must be present');

  root.addEventListener('mousemove', e => {
    pal.setTarget(e.offsetX / scene.scaleFactor, e.offsetY / scene.scaleFactor);
  });
};

const scenario6 = () => {
  const producer = new Producer(300, 50, 1500).addTo(scene);
  const consumer = new Consumer(500, 50, 100).addTo(scene);
  new Road(producer, consumer, {
    points: [[350, 150], [150, 350], [400, 500], [650, 350], [450, 150]],
    autoRound: 400,
  }).addTo(scene);
};

const scenarioSim = () => {
  var N = 50;
  var radius = 25;
  var width = scene.width;
  var height = scene.height;
  var xMax = 1,
      xMin = 0,
      yMax = 1,
      yMin = 0;
  var xscale = d3.scaleLinear().domain([xMin, xMax]).range([0, width]),
      yscale = d3.scaleLinear().domain([yMin, yMax]).range([0, height]);

  var xData = Array.from({length: N}, d3.randomUniform(0.5, 0.5)),
      yData = Array.from({length: N}, d3.randomUniform(0.5, 0.5));

  var nodes = xData.map( (d, i) => {
    return Object.create({x: d, y: yData[i]})
  });

  var simulation = d3.forceSimulation(nodes)
        .force("x", d3.forceX(d => { return xscale(d.x) }).strength(0.5))
        .force("y", d3.forceY(d => { return yscale(d.y) }).strength(0.1))
        .force("collide", d3.forceCollide(radius))
        .velocityDecay(0.5)
        .alphaTarget(0.1)
        // .alphaDecay(0.05);

  const pals = []
  for(var i = 0; i < nodes.length; i++) {
    const d = nodes[i];
    const pal = new Pal(xscale(d.x), yscale(d.y));
    pals.push(pal)
    scene.addChild(pal);
  }

  simulation.on("tick", () => {
    for(var i = 0; i < nodes.length; i++) {
      const d = nodes[i];
      const pal = pals[i];
      pal.setTarget(d.x, d.y);
    }
  });

  document.querySelector('#root').addEventListener('click', (e) => {

    nodes.forEach((n) => {
      n.x = e.offsetX / scene.width;
      n.y = e.offsetY / scene.height;
    });

    simulation
      .nodes(nodes)
      .restart()
  });
};

const go = () => {
  if (window.scene) return;
  scene = new Scene(window.innerWidth, window.innerHeight, window.devicePixelRatio);
  window.scene = scene;
  const root = document.getElementById('root');
  invariant(root, '#root must be present');
  scene.appendTo(root);

  scene.addSystem(new DebugOverlay());
  scene.addSystem(new TravellerFinder());

  scenarioSim();

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
