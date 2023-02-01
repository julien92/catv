import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Transaction, Wallet } from "../../tzkt/fetchTransactionTree";
import { isUserWallet } from "../../util/tezosUtil";
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
  rootAddress: string;
}

const onNodeClick = (node: any, event: MouseEvent) => {
  window.open(`https://tzkt.io/${node.id}`, "_blank");
};

const nodeLabel = (node: any) => {
  let label = node.id;
  if (node.alias) {
    label = node.alias;
  }
  return label;
};

const nodeCanvasObject = (
  node: any,
  canvasContext: CanvasRenderingContext2D
) => {
  const image = new Image();
  image.src = `https://services.tzkt.io/v1/avatars/${node.id}`;

  canvasContext.save();
  canvasContext.beginPath();
  canvasContext.arc(node.x, node.y, 4, 0, Math.PI * 2, true);

  if (node.isRootAddress) {
    canvasContext.strokeStyle = "#Ffe430";
    canvasContext.stroke();
  } else if (node.isSmartContract) {
    canvasContext.strokeStyle = "#B1ecff";
    canvasContext.stroke();
  } else if (node.isExchangeWallet) {
    canvasContext.strokeStyle = "#Bc2fee";
    canvasContext.stroke();
  }

  canvasContext.closePath();
  canvasContext.clip();

  canvasContext.fillStyle = "#666666";
  canvasContext.fillRect(node.x - 4, node.y - 4, 8, 8);

  canvasContext.fillStyle = "transparent";
  canvasContext.drawImage(image, node.x - 4, node.y - 4, 8, 8);
};

export default function Graphs({ transactions, rootAddress }: Props) {
  const [graph, setGraph] = useState<Graph>({ nodes: [], links: [] });
  useEffect(() => {
    if (!transactions) return;

    setGraph(buildGraph(transactions, rootAddress));
  }, [transactions, rootAddress]);

  return (
    <>
      <div className={styles.graph}>
        <ForceGraph2D
          graphData={graph}
          nodeId="id"
          nodeLabel={nodeLabel}
          width={1200}
          height={600}
          backgroundColor="#9b9b9b"
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkWidth={2}
          nodeCanvasObject={nodeCanvasObject}
          onNodeClick={onNodeClick}
        />
      </div>
    </>
  );
}
