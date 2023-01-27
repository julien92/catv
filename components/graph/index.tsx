import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Node, Transaction } from "../../tzkt/fetchTransactionTree";
import { buildGraph, Graph } from "./graph";

import styles from "./styles.module.css";

const ForceGraph2D = dynamic(
  () => import("react-force-graph").then((mod) => mod.ForceGraph2D),
  { ssr: false }
);

const ForceGraph3D = dynamic(
  () => import("react-force-graph").then((mod) => mod.ForceGraph3D),
  { ssr: false }
);

interface Props {
  transactions: Transaction[];
}

export default function Graphs({ transactions }: Props) {
  const [graph, setGraph] = useState<Graph>({ nodes: [], links: [] });
  useEffect(() => {
    console.log("graph transact", transactions);
    if (!transactions) return;

    setGraph(buildGraph(transactions));
  }, [transactions]);

  useEffect(() => console.log(graph), [graph]);

  return (
    <>
      <div className={styles.graph}>
        <ForceGraph2D
          graphData={graph}
          nodeId="id"
          nodeLabel="id"
          width={1200}
          height={600}
          backgroundColor="#9b9b9b"
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkWidth={2}
        />
      </div>
    </>
  );
}
