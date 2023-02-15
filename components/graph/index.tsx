import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Transaction } from "../../model/transaction";
import { WalletType } from "../../model/wallet";
import { buildGraph, Graph, NodeGraph } from "./graph";

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

const onNodeClick = (node: NodeGraph) => {
  window.open(`https://tzkt.io/${node.id}`, "_blank");
};

const nodeLabel = (node: any) => {
  let label = node.id;
  if (node.alias) {
    label = node.alias;
  }
  return label;
};

const nodeCanvasObject =
  (imageMap: Record<string, HTMLImageElement>) =>
  (node: any, canvasContext: CanvasRenderingContext2D) => {
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

    if (imageMap[node.id]) {
      canvasContext.fillStyle = "transparent";
      canvasContext.drawImage(imageMap[node.id], node.x - 4, node.y - 4, 8, 8);
    }
  };

const arrowColor = () => {
  return "rgb(75 75 75)";
};

export default function Graphs({ transactions, rootAddress }: Props) {
  const [graph, setGraph] = useState<Graph>({ nodes: [], links: [] });
  useEffect(() => {
    if (!transactions) return;

    setGraph(buildGraph(transactions, rootAddress));
  }, [transactions, rootAddress]);

  const imageMap = useMemo(() => {
    const map = {};

    transactions.forEach((transaction) => {
      if (!map[transaction.sender.address]) {
        map[transaction.sender.address] = new Image();
        map[transaction.sender.address].src = transaction.sender.avatarUrl;
      }
      if (!map[transaction.target.address]) {
        map[transaction.target.address] = new Image();
        map[transaction.target.address].src = transaction.target.avatarUrl;
      }
    });

    return map;
  }, [transactions]);

  return (
    <ForceGraph2D
      graphData={graph}
      nodeId="id"
      nodeLabel={nodeLabel}
      width={1248}
      height={600}
      backgroundColor="#121212"
      linkDirectionalArrowLength={4}
      linkDirectionalArrowRelPos={1}
      linkDirectionalParticles={2}
      linkDirectionalParticleWidth={2}
      linkDirectionalParticleSpeed={0.001}
      linkColor={arrowColor}
      linkDirectionalArrowColor={arrowColor}
      linkWidth={1}
      nodeCanvasObject={nodeCanvasObject(imageMap)}
      onNodeClick={onNodeClick}
    />
  );
}
