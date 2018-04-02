// @flow
import invariant from 'invariant';
import type Road from './Road';
import type { NetworkNode } from './interfaces';

const PathFinder = {
  getNextRoad(initialNode: NetworkNode, destinationNode: NetworkNode): Road {
    const remainingNodes = new Set(initialNode.getAllReachableNodes());
    remainingNodes.add(initialNode);
    invariant(
      remainingNodes.has(destinationNode),
      'destination must be reachable',
    );
    const bestDistances = new Map();
    const prevRoads = new Map();

    bestDistances.set(initialNode, 0);

    while (remainingNodes.size) {
      const { node, distance } = PathFinder._nodeWithShortestDistance(
        remainingNodes,
        bestDistances,
      );
      remainingNodes.delete(node);

      if (node === destinationNode) {
        return PathFinder._nextRoadFromRoute(
          prevRoads,
          initialNode,
          destinationNode,
        );
      }

      PathFinder._updateNeighbours(node, bestDistances, distance, prevRoads);
    }

    throw new Error('unreachable i hope');
  },

  _nodeWithShortestDistance(
    nodes: Set<NetworkNode>,
    distances: Map<NetworkNode, ?number>,
  ): { node: NetworkNode, distance: number } {
    let bestDist = Infinity;
    let bestNode = null;

    for (const node of nodes) {
      const distance = distances.get(node);
      if (distance != null && distance < bestDist) {
        bestDist = distance;
        bestNode = node;
      }
    }

    invariant(bestNode, 'node must be found');
    return { node: bestNode, distance: bestDist };
  },
  _updateNeighbours(
    node: NetworkNode,
    bestDistances: Map<NetworkNode, ?number>,
    distance: number,
    prevRoads: Map<NetworkNode, Road>,
  ) {
    for (const road of node.outgoingConnections) {
      const nextNode = road.to;
      const nextNodeDist = bestDistances.get(nextNode);
      const altNextNodeDist = distance + road.length;
      if (nextNodeDist == null || nextNodeDist < altNextNodeDist) {
        bestDistances.set(nextNode, altNextNodeDist);
        prevRoads.set(nextNode, road);
      }
    }
  },
  _nextRoadFromRoute(
    prevRoads: Map<NetworkNode, Road>,
    start: NetworkNode,
    finish: NetworkNode,
  ): Road {
    let node = finish;
    while (prevRoads.has(node)) {
      const road = prevRoads.get(node);
      invariant(road, 'road must exist');
      node = road.from;
      if (node === start) return road;
    }

    throw new Error('prev road must be found');
  },
};

export default PathFinder;
