import { Node } from "../../tzkt/fetchTransactionTree";

export interface NodeGraph {
  id: string;
  val: number;
}

export interface Link {
  source: string;
  target: string;
}
export interface Graph {
  nodes: NodeGraph[];
  links: Link[];
}

export const buildGraph = (
  node: Node,
  graph: Graph = { nodes: [], links: [] }
) => {
  let nodeGraph = graph.nodes.filter(
    (nodeGraph) => nodeGraph.id == node.wallet.address
  )[0];

  if (nodeGraph) {
    nodeGraph.val += 1;
  } else {
    nodeGraph = {
      id: node.wallet.address,
      val: 1,
    };
    graph.nodes.push(nodeGraph);
  }

  let senderLinks = [];
  let targetLinks = [];
  if (node.senders) {
    senderLinks = node.senders.map((sender) => {
      return {
        source: sender.wallet.address,
        target: node.wallet.address,
      };
    });
  }

  if (node.targets) {
    targetLinks = node.targets.map((target) => {
      return {
        source: node.wallet.address,
        target: target.wallet.address,
      };
    });
  }

  graph.links = graph.links.concat(senderLinks).concat(targetLinks);

  if (node.senders) {
    node.senders.forEach((sender) => {
      buildGraph(sender, graph);
    });
  }

  if (node.targets) {
    node.targets.forEach((target) => {
      buildGraph(target, graph);
    });
  }

  return graph;
};
