import dynamic from "next/dynamic";
import * as THREE from "three";
import threeSpritetext from "three-spritetext";
import { Node } from "../../tzkt/fetchTransactionTree";
import squashAddress from "../../tzkt/squashAddress";
import { Graph, NodeGraph } from "./graph";

const ForceGraph3D = dynamic(
  () => import("react-force-graph").then((mod) => mod.ForceGraph3D),
  { ssr: false }
);

interface Props {
  node: Node;
}

export default function Graphs({ node }: Props) {
  let graph: Graph = {
    nodes: [],
    links: [],
  };
  const buildGraph = (node: Node, graph: Graph) => {
    let nodeGraph = graph.nodes.filter(
      (nodeGraph) => nodeGraph.id == node.address
    )[0];

    if (nodeGraph) {
      nodeGraph.val += nodeGraph.val;
    } else {
      nodeGraph = {
        id: node.address,
        val: 1,
      };
      graph.nodes.push(nodeGraph);
    }

    let senderLinks = [];
    let targetLinks = [];
    if (node.senders) {
      senderLinks = node.senders.map((sender) => {
        return {
          source: sender.address,
          target: node.address,
        };
      });
    }

    if (node.targets) {
      targetLinks = node.targets.map((target) => {
        return {
          source: node.address,
          target: target.address,
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
  };

  if (node) {
    console.log("node ----", node);
    buildGraph(node, graph);
    console.log("Graph ----- builded", graph);
  }
  return (
    <>
      <div>
        <ForceGraph3D
          graphData={graph}
          nodeId="id"
          nodeLabel="id"
          nodeAutoColorBy="user"
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.25}
          nodeThreeObject={(node: NodeGraph) => {
            const scene = new THREE.Scene();

            const sphereGeometry = new THREE.SphereGeometry(4);
            const sphereMaterial = new THREE.MeshLambertMaterial({
              color: Math.round(Math.random() * Math.pow(2, 24)),
              transparent: true,
              opacity: 1,
              depthWrite: false,
            });
            const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

            const sprite = new threeSpritetext(squashAddress(`${node.id}`));
            sprite.textHeight = 4;

            scene.add(sphereMesh);
            scene.add(sprite);

            return scene;
          }}
        />
      </div>
    </>
  );
}
