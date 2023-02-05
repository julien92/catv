import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Transaction } from "../../model/transaction";
import { WalletType } from "../../model/wallet";
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

const strokeStyleByWalletType: Map<WalletType, string> = new Map([
  [WalletType.Exchange, "#Bc2fee"],
  [WalletType.SmartContract, "#B1ecff"],
]);

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

  const strokeStyle = node.isRootAddress
    ? "#Ffe430"
    : strokeStyleByWalletType.get(node.walletType);
  if (strokeStyle) {
    canvasContext.strokeStyle = strokeStyle;
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
    <ForceGraph2D
      graphData={graph}
      nodeId="id"
      nodeLabel={nodeLabel}
      width={1248}
      height={600}
      backgroundColor="#9b9b9b"
      linkDirectionalArrowLength={4}
      linkDirectionalArrowRelPos={1}
      linkWidth={2}
      nodeCanvasObject={nodeCanvasObject}
      onNodeClick={onNodeClick}
    />
  );
}
