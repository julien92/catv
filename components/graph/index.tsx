import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Node } from "../../tzkt/fetchTransactionTree";
import { buildGraph, Graph } from "./graph";

const ForceGraph2D = dynamic(
  () => import("react-force-graph").then((mod) => mod.ForceGraph2D),
  { ssr: false }
);

const ForceGraph3D = dynamic(
  () => import("react-force-graph").then((mod) => mod.ForceGraph3D),
  { ssr: false }
);

interface Props {
  node: Node;
}

export default function Graphs({ node }: Props) {
  const [graph, setGraph] = useState<Graph>({ nodes: [], links: [] });
  useEffect(() => {
    if (!node) return;

    setGraph(buildGraph(node));
  }, [node]);

  useEffect(() => console.log(graph), [graph]);

  return (
    <>
      <div>
        <ForceGraph2D
          graphData={graph}
          nodeId="id"
          nodeLabel="id"
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkWidth={2}
        />
      </div>
    </>
  );
}
